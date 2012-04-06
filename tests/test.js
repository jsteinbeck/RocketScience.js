(
    function()
    {
        var monitor, lab, suite, monitor2,
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
            function()
            {
                var sq = new Squiddle(),
                    val = { value: false },
                    fn = function(data) { val.value = true; console.log("val.value 2: " + val.value); },
                    start = new Date().getTime(),
                    now,
                    time = 0,
                    wait = 5000;
                sq.log = true;
                sq.subscribe(fn, "squiddle_test");
                sq.trigger("squiddle_test", val, false);
                while (time < wait)
                {
                    now = new Date().getTime();
                    time = now - start;
                }
                console.log("val.value: " + val.value);
                this.assert(val.value === true, "Variable val should be true.");
            }
        );

        suite.addTestCase(case1);
        lab.addTestSuite(suite);

        lab.run();
    }
)();