module.exports = [

    {
        description: 'delete transceiver',
        method: 'PUT',
        path: '/deleteTransceiver/',
        fn: function (callback, args) {
            var ok = Homey.app.RxTxManager.deleteTransceiver;
            var ok = Homey.app.RxTxManager.deleteTransceiver(args.body);
            // callback follows ( err, result )
            callback(null, ok);

            // access /?foo=bar as args.query.foo
        }

    },

    {
        description: 'save transceiver',
        method: 'PUT',
        path: '/saveTransceiver/',
        fn: function (callback, args) {
            var ok = Homey.app.RxTxManager.saveTransceiver;
            var ok = Homey.app.RxTxManager.saveTransceiver(args.body);
            // callback follows ( err, result )
            callback(null, ok);

            // access /?foo=bar as args.query.foo
        }

    },



    {
        description: 'Get something',
        method: 'GET',
        path: '/getSomething/',
        fn: function (callback, args) {
            var result = Homey.app.getSomething();

            // callback follows ( err, result )
            callback(null, result);

            // access /?foo=bar as args.query.foo
        }

    },

    {
        description: 'Get something Trx',
        method: 'GET',
        path: '/getSomethingTrx/',
        fn: function (callback, args) {
            var result = Homey.app.getSomethingTrx();

            // callback follows ( err, result )
            callback(null, result);

            // access /?foo=bar as args.query.foo
        }

    },


    {
        description: 'open settings üage',
        method: 'PUT',
        path: '/opensettingspage/',
        fn: function (callback, args) {
            var ok = Homey.app.sendsettingspage ;
            var ok = Homey.app.sendsettingspage();
            // callback follows ( err, result )
            callback(null, ok);

            // access /?foo=bar as args.query.foo
        }

    },












    {
        description: 'test server',
        method: 'PUT',
        path: '/testLan/',
        fn: function (callback, args) {
            var ok = Homey.app.rfxcomLan.testServer;
            var ok = Homey.app.rfxcomLan.testServer(args['body']['test']);
            // callback follows ( err, result )
            callback(null, ok);

            // access /?foo=bar as args.query.foo
        }

    },

    {
        description: 'test server trx',
        method: 'PUT',
        path: '/testTrx/',
        fn: function (callback, args) {
            var ok = Homey.app.rfxcomTrx.testServer;
            var ok = Homey.app.rfxcomTrx.testServer(args['body']['test']);
            // callback follows ( err, result )
            callback(null, ok);

            // access /?foo=bar as args.query.foo
        }

    },

   


      {
        description: 'test transceiver new',
        method: 'PUT',
        path: '/addRxTx/',
        fn: function (callback, args) {
            var ok = Homey.app.RxTxManager.addRxTx;
            var ok = Homey.app.RxTxManager.addRxTx(args['body']['add']);
            // callback follows ( err, result )
            callback(null, ok);

            // access /?foo=bar as args.query.foo
        }

    },









    {
        description: 'Start OTG search',
        method: 'PUT',
        path: '/search/',
        requires_authorizaton: true,
        fn: function (callback, args) {
            var openComm = Homey.app.api.openComm;
            var ok = openComm(args['body']['ip'], args['body']['port']);
            callback(null, ok);
        }
    },
    {
        description: 'Get variables available for logging',
        method: 'GET',
        path: '/getLogVars/',
        requires_authorizaton: true,
        fn: function (callback, args) {
            var getLoggableVars = Homey.app.api.getLoggableVars;
            var ok = getLoggableVars();
            callback(null, ok);
        }
    },
    {
        description: 'Get OTG configuration',
        method: 'GET',
        path: '/getOtgwConfig/',
        requires_authorizaton: false,
        fn: function (callback, args) {
            var result = Homey.app.api.getGatewayConfig();
            callback(null, result);
        }
    },
    {
        description: 'Get OTG variables and values',
        method: 'GET',
        path: '/getOtgwVars/',
        requires_authorizaton: false,
        fn: function (callback, args) {
            var result = Homey.app.api.getGatewayVariables();
            callback(null, result);
        }
    }
];