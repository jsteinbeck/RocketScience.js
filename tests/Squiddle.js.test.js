var squiddleTest = ( function( ROCKET, Squiddle, exports )
{
        var lab, suite, suite2, suite3, sq,
            case1, case2, case3, case4, case5, case6, case3_1, case3_2;
            
        exports = exports || {};
        
        ROCKET = ROCKET || require("../RocketScience.js");
        Squiddle = Squiddle || require("../libs/Squiddle.js/Squiddle.js");

        ROCKET.bus.debug = true;
        ROCKET.bus.log = false;

        lab = new ROCKET.TestLab("Squiddle.js");

        suite = new ROCKET.TestSuite("Basic Functionality");

        case1 = new ROCKET.TestCase(
            "Subscribed listeners must be executed when their event is triggered.",
            function(params)
            {
                var fn = function(data) 
                    { 
                        params.value = true;
                    };
//                 sq.log = true;
                sq = Squiddle.create();
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
            "Unsubscribed listeners shouldn't be called when triggering the event after unsubscribing.",
            function(params)
            {
                var fn = function(data) 
                { 
                    params.value = true;
                };
//                 sq.log = true;
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
            "A listener must be called exactly the number of times the subscribed event is triggered.",
            function(params)
            {
                var fn = function(data) 
                { 
                    params.count += 1;
                };
//                 sq.log = true;
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
            },
            {
                init: function() { return { count: 0 }; },
                wait: 20
            }
        );
        
        case6 = new ROCKET.TestCase(
            "Data provided when triggering must be made available in subscribed listeners.",
            function(params)
            {
                var fn = function(data) 
                { 
                    params.secret = data;
                };
//                 sq.log = true;
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
            "Listeners can get the number of other listeners subscribed to the same event.",
            function(params)
            {
                var fn = function(data, info) 
                    { 
                        params.listeners = info.subscribers;
                    },
                    fn2 = function() {},
                    fn3 = function() {};
//                     sq.log = true;
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
            "Listeners can get the name of the triggered event.",
            function(params)
            {
                var fn = function(data, info) 
                    { 
                        params.name = info.event;
                    },
                    fn2 = function() {},
                    fn3 = function() {};
//                 sq.log = true;
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
        
        suite3 = new ROCKET.TestSuite("Invalid Input");
        
        
        case3_1 = new ROCKET.TestCase(
            "Only functions should be able to subscribe to an event.",
            function(params)
            {
                var t;
//                 sq.log = true;
                t = false;
                try
                {
                    sq.subscribe( null, "squiddle_test8" );
                    t = true;
                }
                catch ( e ) {}
                this.assertEquals( t, false, "Subscribing null does not throw an Error." );
                
                t = false;
                try
                {
                    sq.subscribe( false, "squiddle_test8" );
                    t = true;
                }
                catch ( e ) {}
                this.assertEquals( t, false, "Subscribing false does not throw an Error." );
                
                t = false;
                try
                {
                    sq.subscribe( {}, "squiddle_test8" );
                    t = true;
                }
                catch ( e ) {}
                this.assertEquals( t, false, "Subscribing {} does not throw an Error." );
                
                t = false;
                try
                {
                    sq.subscribe( [], "squiddle_test8" );
                    t = true;
                }
                catch ( e ) {}
                this.assertEquals( t, false, "Subscribing [] does not throw an Error." );
                
            },
            function(params)
            {
            },
            {
                wait: 20
            }
        );
        
        case3_2 = new ROCKET.TestCase(
            "Event names can only be strings or numbers.",
            function()
            {
                var t = false;
                try
                {
                    sq.subscribe( function() {}, [] );
                    t = true;
                }
                catch( e ) {}
                this.assertEquals( t, false, "Using an array as event name on subscribe did not fail!" );
                
                t = false;
                try
                {
                    sq.subscribe( function() {}, {} );
                    t = true;
                }
                catch( e ) {}
                this.assertEquals( t, false, "Using an object as event name on subscribe did not fail!" );
                
                t = false;
                try
                {
                    sq.subscribe( function() {}, function() {} );
                    t = true;
                }
                catch( e ) {}
                this.assertEquals( t, false, "Using a function as event name on subscribe did not fail!" );
                
                
                t = false;
                try
                {
                    sq.unsubscribe( function() {}, null );
                    t = true;
                }
                catch( e ) {}
                this.assertEquals( t, false, "Using null as event name on unsubscribe did not fail!" );
                t = false;
                try
                {
                    sq.unsubscribe( function() {}, [] );
                    t = true;
                }
                catch( e ) {}
                this.assertEquals( t, false, "Using an array as event name on unsubscribe did not fail!" );
                
                t = false;
                try
                {
                    sq.unsubscribe( function() {}, {} );
                    t = true;
                }
                catch( e ) {}
                this.assertEquals( t, false, "Using an object as event name on unsubscribe did not fail!" );
                
                t = false;
                try
                {
                    sq.unsubscribe( function() {}, null );
                    t = true;
                }
                catch( e ) {}
                this.assertEquals( t, false, "Using null as event name on unsubscribe did not fail!" );
                
                t = false;
                try
                {
                    sq.unsubscribe( function() {}, function() {} );
                    t = true;
                }
                catch( e ) {}
                this.assertEquals( t, false, "Using a function as event name on unsubscribe did not fail!" );
                
                
                
                t = false;
                try
                {
                    sq.trigger( [] );
                    t = true;
                }
                catch( e ) {}
                this.assertEquals( t, false, "Using an array as event name on trigger did not fail!" );
                
                t = false;
                try
                {
                    sq.trigger( {} );
                    t = true;
                }
                catch( e ) {}
                this.assertEquals( t, false, "Using an object as event name on trigger did not fail!" );
                
                t = false;
                try
                {
                    sq.trigger( null );
                    t = true;
                }
                catch( e ) {}
                this.assertEquals( t, false, "Using null as event name on trigger did not fail!" );
                
                t = false;
                try
                {
                    sq.trigger( function() {} );
                    t = true;
                }
                catch( e ) {}
                this.assertEquals( t, false, "Using a function as event name on trigger did not fail!" );
            }
        );
        
        suite3.addTestCase(case3_1);
        suite3.addTestCase(case3_2);
        lab.addTestSuite(suite3);

        exports.lab = lab;
        
        return lab;
}(
    (typeof ROCKET === "undefined") ? false : ROCKET,
    (typeof Squiddle === "undefined") ? false : Squiddle,
    (typeof exports === "undefined") ? false : exports
));