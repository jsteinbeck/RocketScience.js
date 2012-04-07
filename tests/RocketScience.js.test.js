(
    function()
    {
        var monitor, lab, suite, case1;

        ROCKET.bus.debug = true;
        ROCKET.bus.log = false;

        monitor = new ROCKET.monitors.Default();
        monitor.switchOn();

        lab = new ROCKET.TestLab("RocketScience.js");

        suite = new ROCKET.TestSuite("Assertions");

        case1 = new ROCKET.TestCase(
            "assert()",
            function(params)
            {
                var tc = new ROCKET.TestCase("test");
                try
                {
                    tc.assert(true === false);
                }
                catch (e)
                {
                    this.assert(e instanceof ROCKET.AssertionError);
                }
                try
                {
                    tc.assert(true === true);
                }
                catch (e)
                {
                    if (e instanceof ROCKET.AssertionError)
                    {
                        throw new ROCKET.AssertionError("Unexpected AssertionError thrown.");
                    }
                    else
                    {
                        throw new ROCKET.AssertionError("Unexpected Error occured.");
                    }
                }
            },
            function(params) {},
            {
                init: function() { return {}; },
                wait: 0
            }
        );
        suite.addTestCase(case1);
        
        var case2 = new ROCKET.TestCase(
            "assertEquals()",
            function(params)
            {
                var tc = new ROCKET.TestCase("test");
                
                try
                {
                    tc.assertEquals(true, false);
                }
                catch (e)
                {
                    this.assert(e instanceof ROCKET.AssertionError);
                }
                
                try
                {
                    tc.assertEquals(true, 1);
                }
                catch (e)
                {
                    this.assert(e instanceof ROCKET.AssertionError);
                }
                
                try
                {
                    tc.assertEquals(false, 0);
                }
                catch (e)
                {
                    this.assert(e instanceof ROCKET.AssertionError);
                }
                
                
                try
                {
                    tc.assertEquals(false, null);
                }
                catch (e)
                {
                    this.assert(e instanceof ROCKET.AssertionError);
                }
                
                try
                {
                    tc.assertEquals({}, {});
                }
                catch (e)
                {
                    this.assert(e instanceof ROCKET.AssertionError);
                }
                
                try
                {
                    tc.assertEquals(true, true);
                }
                catch (e)
                {
                    if (e instanceof ROCKET.AssertionError)
                    {
                        throw new ROCKET.AssertionError("Unexpected AssertionError thrown.");
                    }
                    else
                    {
                        throw new ROCKET.AssertionError("Unexpected Error occured.");
                    }
                }
            },
            function(params) {},
            {
                init: function() { return {}; },
                wait: 0
            }
        );
        suite.addTestCase(case2);
        
        var case3 = new ROCKET.TestCase(
            "assertTruthy()",
            function(params)
            {
                var tc = new ROCKET.TestCase("test");
                
                try
                {
                    tc.assertTruthy(false);
                }
                catch (e)
                {
                    this.assert(e instanceof ROCKET.AssertionError);
                }
                
                try
                {
                    tc.assertTruthy(true, "Value: true");
                    tc.assertTruthy(1, "Value: 1");
                    tc.assertTruthy(2, "Value: 2");
                    tc.assertTruthy({}, "Value: {}");
                    tc.assertTruthy([], "Value: []");
                    tc.assertTruthy("a", 'Value: "a"');
                }
                catch (e)
                {
                    if (e instanceof ROCKET.AssertionError)
                    {
                        throw new ROCKET.AssertionError("Unexpected AssertionError thrown: " + e.message);
                    }
                    else
                    {
                        throw new ROCKET.AssertionError("Unexpected Error occured.");
                    }
                }
            },
            function(params) {},
            {
                init: function() { return {}; },
                wait: 0
            }
        );
        suite.addTestCase(case3);
        
        
        lab.addTestSuite(suite);
        
        lab.run();
    }
)();