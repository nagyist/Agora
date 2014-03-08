"use strict";
var nconf = require('../configure');
var Beans = require('CoolBeans');
var fs = require('fs');

nconf.set('port', '17125');

var winston = require('winston');
winston.loggers = {
  add: function () {},
  get: function () {
    var dummyLogger = {
      warn: function () {},
      info: function () {},
      error: function () {}
    };
    return dummyLogger;
  }
};

// sympa:
nconf.set('swkTrustedAppName', null);
nconf.set('swkTrustedAppPwd', null);
nconf.set('swkRemoteAppUser', null);

nconf.set('dontUsePersistentSessions', true);

nconf.set('superuser', ['superuserID']);

// beans:
var productionBeans = require('../config/beans.json');
var testBeans = require('../config/testbeansWithDB.json');
for (var bean in testBeans) {
  productionBeans[bean] = testBeans[bean];
}
fs.writeFileSync('./testWithDB/tempbeansWithDB.json', JSON.stringify(productionBeans));

nconf.set('beans', new Beans('./testWithDB/tempbeansWithDB.json'));

module.exports = nconf;
