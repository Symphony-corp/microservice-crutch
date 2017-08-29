'use strict';
var path = require('path');

module.exports = function logging(log4js, options) {

  log4js.addLayout('ih-structured-json', function (config) {

    var componentName = path.basename(process.mainModule.filename, '.js');

    return function convertToStructuredJson(logEvent) {
      var struct = {
        timestamp: logEvent.startTime,
        component: componentName,
        level: logEvent.level.levelStr,
        pid: logEvent.pid
      };
      var messageData = [];
      logEvent.data.forEach(function (datum) {
        if (isErrorObject(datum)) {
          struct.message = datum.message;
          messageData.push(datum.stack);
        } else if (isMessageContext(datum)) {
          struct.tracking = datum.properties.tracking;
          struct.context = datum.routingKey;
        } else {
          messageData.push(datum);
        }
      });
      if (!struct.context) {
        struct.context = logEvent.categoryName;
      }
      if (!struct.tracking) {
        struct.tracking = null;
      }
      struct.message = struct.message || messageData[0] || null;
      struct.messageData = messageData;
      return JSON.stringify(struct) + config.separator;
    };

    function isMessageContext(datum) {
      return (typeof datum === 'object') &&
        (datum.properties !== undefined);
    }

    function isErrorObject(datum) {
      return (typeof datum === 'object') &&
        (datum.message !== undefined) &&
        (datum.stack !== undefined);
    }
  });

  var config = options.log.config || {
    appenders: {
      out: {
        type: 'stdout',
        layout: {
          type: 'ih-structured-json',
          separator: ','
        }
      }
    },
    categories: {
      default: {
        appenders: ['out'],
        level: options.log.level
      }
    }
  };

  var opts = {
    reloadSecs: options.log.refresh
  };

  log4js.configure(config, opts);

  var log = log4js.getLogger('microservice-crutch.logging');
  log.debug('Configured log4js; config:', config, '\n opts:', opts);

  return log4js;
};
