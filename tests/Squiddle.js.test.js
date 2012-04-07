(
    function()
    {
        var monitor, lab, suite, suite2, monitor2,
            case1, case2, case3, case4, case5, case6;

        ROCKET.bus.debug = true;
        ROCKET.bus.log = false;

        monitor = new ROCKET.monitors.Console();
        monitor.switchOn();

        monitor2 = new ROCKET.monitors.Default();
        monitor2.switchOn();

        lab = new ROCKET.TestLab("Squiddle.js");

        suite = new ROCKET.TestSuite("Basic Functionality");

        case1 = new ROCKET.TestCase(
            "subscribe(), then trigger()",
            function(params)
            {
                var sq = new Squiddle(),
                    fn = function(data) 
                    { 
                        params.value = true;
                    };
                sq.log = true;
                sq.subscribe(fn, "squiddle_test");
                sq.trigger("squiddle_test", params);
            },
            function(params)
            {
                this.assert(params.value === true, 
                    "Variable params.value should be true.");
            },
            {
                init: function() { return { value: false }; },
                wait: 20
            }
        );
        
        case2 = new ROCKET.TestCase(
            "subscribe(), unsubscribe(), then trigger()",
            function(params)
            {
                var sq = new Squiddle(),
                fn = function(data) 
                { 
                    params.value = true;
                };
                sq.log = true;
                sq.subscribe(fn, "squiddle_test2");
                sq.unsubscribe(fn, "squiddle_test2");
                sq.trigger("squiddle_test2", params);
            },
            function(params)
            {
                this.assert(params.value === false, 
                    "Variable params.value should be false.");
            },
            {
                init: function() { return { value: false }; },
                wait: 20
            }
        );
        
        case3 = new ROCKET.TestCase(
            "subscribe(), trigger() 3x and count number of listener executions",
            function(params)
            {
                var sq = new Squiddle(),
                fn = function(data) 
                { 
                    params.count += 1;
                };
                sq.log = true;
                sq.subscribe(fn, "squiddle_test3");
                sq.trigger("squiddle_test3", params);
                sq.trigger("squiddle_test3", params);
                sq.trigger("squiddle_test3", params);
            },
            function(params)
            {
                this.assertEquals(
                    params.count, 3, 
                    "Variable params.count should be 3."
                );
                throw new Error("Test Error...");
            },
            {
                init: function() { return { count: 0 }; },
                wait: 20
            }
        );
        
        case6 = new ROCKET.TestCase(
            "Send data along with the event",
            function(params)
            {
                var sq = new Squiddle(),
                fn = function(data) 
                { 
                    params.secret = data;
                };
                sq.log = true;
                sq.subscribe(fn, "squiddle_test7");
                sq.trigger("squiddle_test7", "this is a secret");
            },
            function(params)
            {
                this.assertEquals(
                    params.secret, "this is a secret", 
                    "Listener didn't receive the expected data."
                );
            },
            {
                init: function() { return { secret: "" }; },
                wait: 20
            }
        );

        suite.addTestCase(case1);
        suite.addTestCase(case2);
        suite.addTestCase(case3);
        suite.addTestCase(case6);
        lab.addTestSuite(suite);
        
        
        suite2 = new ROCKET.TestSuite("Advanced Features");
        
        
        case4 = new ROCKET.TestCase(
            "Introspect number of listeners",
            function(params)
            {
                var sq = new Squiddle(),
                    fn = function(data, info) 
                    { 
                        params.listeners = info.subscribers;
                    },
                    fn2 = function() {},
                    fn3 = function() {};
                    sq.log = true;
                    sq.subscribe(fn, "squiddle_test4");
                    sq.subscribe(fn2, "squiddle_test4");
                    sq.subscribe(fn3, "squiddle_test4");
                    sq.trigger("squiddle_test4", params);
            },
            function(params)
            {
                this.assertEquals(
                    params.listeners, 3, 
                    "Variable params.listeners should be 3."
                );
            },
            {
                init: function() { return { listeners: 0 }; },
                wait: 20
            }
        );
        
        case5 = new ROCKET.TestCase(
            "Introspect event name",
            function(params)
            {
                var sq = new Squiddle(),
                    fn = function(data, info) 
                    { 
                        params.name = info.event;
                    },
                    fn2 = function() {},
                    fn3 = function() {};
                sq.log = true;
                sq.subscribe(fn, "squiddle_test5");
                sq.subscribe(fn, "squiddle_test6");
                sq.trigger("squiddle_test5", params);
            },
            function(params)
            {
                this.assertEquals(
                    params.name, "squiddle_test5", 
                    "Found wrong event name."
                );
            },
            {
                init: function() { return { listeners: 0 }; },
                wait: 20
            }
        );
        
        
        suite2.addTestCase(case4);
        suite2.addTestCase(case5);
        lab.addTestSuite(suite2);
        
        suite3 = new ROCKET.TestSuite("Unexpected Input");
        
        
        case3_1 = new ROCKET.TestCase(
            "Use wrong data types as listener",
            function(params)
            {
                var sq = new Squiddle();
                sq.log = true;
                sq.subscribe(null, "squiddle_test8");
                sq.trigger("squiddle_test8");
                sq.subscribe(false, "squiddle_test9");
                sq.trigger("squiddle_test9");
                sq.subscribe({}, "squiddle_test10");
                sq.trigger("squiddle_test10");
                sq.subscribe([], "squiddle_test11");
                sq.trigger("squiddle_test11");
            },
            function(params)
            {
            },
            {
                wait: 20
            }
        );
        
        suite3.addTestCase(case3_1);
        lab.addTestSuite(suite3);

        lab.run();
    }
)();