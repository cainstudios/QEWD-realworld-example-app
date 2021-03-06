/*
 ----------------------------------------------------------------------------
 | qewd-conduit: QEWD Implementation of the Conduit Back-end                |
 |                                                                          |
 | Copyright (c) 2017 M/Gateway Developments Ltd,                           |
 | Reigate, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  3 May 2017

*/

var validation = require('../utilities/validation');
var errorHandler = require('../utilities/errorHandler');
var getArticleIdBySlug = require('./getArticleIdBySlug');
var getArticle = require('./getArticle');
var slugify = require('slugify');

function update(args, callback) {
  // Update Article

  // check for body and optional fields

  var errors = validation.bodyAndFields(args, 'article', null, ['title', 'description', 'body']);
  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, callback);

  var request = args.req.body.article;

  // validate title

  if (request.title && request.title !== '' && request.title.length > 255) {
    errors = errorHandler.add('title', "must be no longer than 255 characters", errors);
  }

  // validate description

  if (request.description && request.description !== '' && request.description.length > 255) {
    errors = errorHandler.add('description', "must be no longer than 255 characters", errors);
  }

  // validate tagList

  var tagList = request.tagList;
  //if (tagList !== 'undefined' && (!Array.isArray(tagList) || tagList.length === 0)) {
  if (tagList !== 'undefined' && !Array.isArray(tagList)) {
    errors = errorHandler.add('tagList', "must be an array", errors);
  }

  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, callback);

  // next, validate JWT

  var errors;
  var status = validation.jwt.call(this, args);
  if (status.error) return callback(status);
  var username = status.payload.username;
  var id = status.payload.id;

  // check that slug exists

  var slug = args.slug;
  var articleId = getArticleIdBySlug.call(this, slug);
  if (!articleId) {
    return errorHandler.notFound(callback);
  }

  // check that user is the author

  var article = getArticle.call(this, articleId);
  if (article.author.username !== username) {
    errors = errorHandler.add('article', "not owned by author", errors);
    return errorHandler.errorResponse(errors, callback, 403);
  }

  // update the article

  article.author = id;



  var articlesDoc = new this.documentStore.DocumentNode('conduitArticles');

  if (request.title && request.title !== article.title) {
    // remove the old slug index
    articlesDoc.$(['bySlug', slug]).delete();
    //create and index a new slug
    var newSlug = slugify(request.title).toLowerCase();
    if (articlesDoc.$(['bySlug', newSlug]).exists) {
      newSlug = newSlug + '-x' + articleId;
    }
    articlesDoc.$(['bySlug', newSlug]).value = articleId;
    article.slug = newSlug;
    article.title = request.title;
  }

  if (request.description) article.description = request.description;
  if (request.body) article.body = request.body;

  var articleDoc = articlesDoc.$(['byId', articleId]);

  //update time stamp and reverse timestamp index

  var now = new Date();
  article.updatedAt = now.toISOString();

  var ts = articleDoc.$('timestampIndex').value;
  articlesDoc.$(['byTimestamp', ts]).delete();
  ts = 100000000000000 - now.getTime();
  articlesDoc.$(['byTimestamp', ts]).value = articleId;
  article.timestampIndex = ts;

  //update tags - first remove old ones from index

  var oldTagList = articleDoc.$('tagList').getDocument(true);
  if (oldTagList) {
    oldTagList.forEach(function(tag) {
      articlesDoc.$(['byTag', tag, articleId]).delete();
    });
  }

  // now update tags in article and create new taglist index

  article.tagList = request.tagList;
  request.tagList.forEach(function(tag) {
    articlesDoc.$(['byTag', tag, articleId]).value = articleId;
  });


  // update main article database record

  articleDoc.setDocument(article);

  // output updated article object

  var article = getArticle.call(this, articleId, id);

  callback({article: article});
}

module.exports = update;
