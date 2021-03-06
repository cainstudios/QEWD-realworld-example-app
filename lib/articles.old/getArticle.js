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

var getProfile = require('../profiles/getProfile');

function getArticle(articleId, byId) {
  var articlesDoc = new this.documentStore.DocumentNode('conduitArticles', ['byId', articleId]);
  var article = articlesDoc.getDocument(true);
  if (!article.tagList) article.tagList = [];
  delete article.timestampIndex;
  delete article.comments;
  var ofId = article.author;
  // favorited by user?
  article.favorited = false;
  if (byId) {
    var userFavorited = new this.documentStore.DocumentNode('conduitUsers', ['byId', byId, 'favorited', articleId]);
    if (userFavorited.exists) article.favorited = true;
  }
  article.author = getProfile.call(this, ofId, byId);
  return article;
}

module.exports = getArticle;
