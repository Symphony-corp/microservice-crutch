'use strict';

module.exports = function logging(log4js, options) {

	var config = options.log.config || {
		appenders: {
			out: {
				type: 'stdout',
				layout: {
					type: 'pattern',
					pattern: '[%d] [%p] [%c] [tracking:%X{tracking}] %m%n'
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
