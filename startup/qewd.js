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

  28 April 2017

*/


var config = {
  managementPassword: 'changeThisPassword!',
  serverName: 'QEWD Conduit Server',
  port: 8080,
  poolSize: 2,
  database: {
    type: 'redis'
  },
  cors: true
};

var routes = [
  {
    path: '/api',
    module: 'qewd-conduit',
    errors: {
      notfound: {
        text: 'Resource Not Recognised',
        statusCode: 404
      }
    }
  }
];

var qewd = require('qewd').master;
var q = qewd.start(config, routes);



