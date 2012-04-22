var ROCKET = ( function( console, exports, Squiddle )
{
    "use strict";
    
    var RS, key;
    
    console = console || { log: function() {} };
    exports = exports || {};
    console.error = console.log;
    console.warn = console.log;
    
    Squiddle = Squiddle || require("./libs/Squiddle.js/Squiddle.js");

    /**

        @module RocketScience.js


        [Object] ROCKET
        ===============
    
        Namespace object for the RocketScience Unit Testing Suite.
        
    */
    RS = RS || {};

    RS.bus = Squiddle.create();

    RS.highestId = 0;

    RS.getUniqueId = function()
    {
        var p1, p2, p3, out;
        p1 = 255 * Math.random();
        p2 = 255 * Math.random();
        p3 = 255 * Math.random();
        RS.highestId += 1;
        out = RS.highestId + parseInt(p1 * p2 * p3, 10);
        return out;
    };

    RS.AssertionError = function(message) 
    {
        message = message || "";
        this.message = message;
    };
    RS.AssertionError.prototype = new Error();
    RS.AssertionError.prototype.constructor = RS.AssertionError;


    RS.TestCase = function(name, fn, checker, args) 
    {
        args = args || {};
        var self = this;
        this.id = RS.getUniqueId();
        this.name = name;
        this.run = fn || function() {};
        this.checker = checker || function() {};
        this.wait = args.wait || 20;
        this.init = args.init || function() { return {}; };
    };

    RS.TestCase.prototype.assert = function(value, message)
    {
        message = message ||  "Expected value to be true.";
        message = message + " Value: " + value;
        if (value !== true)
        {
            throw new RS.AssertionError(message);
        }
    };

    RS.TestCase.prototype.assertTruthy = function(value, message)
    {
        message = message + " Found: " + value || 
            "Expected value to be truthy but found: " + value;
        if (!value)
        {
            throw new RS.AssertionError(message);
        }
    };

    RS.TestCase.prototype.assertEquals = function(value, expect, message)
    {
        message = message || "Expected values to be exactly equal.";
        message = message + " Value: " + value + "; Expected: " + expect;
        if (value !== expect)
        {
            throw new RS.AssertionError(message);
        }
    };


    RS.TestSuite = function(name)
    {
        this.id = RS.getUniqueId();
        this.name = name || "RocketScience.js TestSuite";
        this.cases = [];
        this.errors = 0;
        this.failures = 0;
        this.results = [];
        this.running = false;
    };

    RS.TestSuite.prototype.addTestCase = function(testCase)
    {
        RS.bus.trigger("ROCKET.TestSuite.addTestCase", this);
        this.cases.push(testCase);
    };

    RS.TestSuite.prototype.run = function()
    {
        this.clear();
        this.running = true;
        RS.bus.trigger("ROCKET.TestSuite.run.start", this);
        var i, test, 
            cases = this.cases, 
            len = cases.length, 
            results = [],
            key,
            self = this,
            ret, handle, fn;
        handle = setInterval(
            function()
            {
                if (self.successes + self.errors + self.failures === self.cases.length)
                {
                    self.running = false;
                    RS.bus.trigger("ROCKET.TestSuite.run.end", self);
                    clearInterval(handle);
                    return;
                }
            },
            20
        );
        fn = function(i) 
        { 
            var test = cases[i];
            var params = test.init();
            try
            {
                test.run(params);
                setTimeout(
                    function()
                    {
                        try
                        {
                            test.checker(params);
                        }
                        catch (e)
                        {
                            if (e instanceof RS.AssertionError)
                            {
                                RS.bus.trigger(
                                    "ROCKET.TestSuite.run.result.failure", 
                                    {
                                        testSuite: self,
                                        testCase: test,
                                        error: e
                                    }
                                );
                                self.failures += 1;
                                self.results.push({
                                    testCase: test,
                                    result: "failure",
                                    error: e
                                });
                            }
                            else
                            {
                                RS.bus.trigger(
                                    "ROCKET.TestSuite.run.result.error", 
                                    {
                                        testSuite: self,
                                        testCase: test,
                                        error: e
                                    }
                                );
                                self.errors += 1;
                                self.results.push({
                                    testCase: test,
                                    result: "error",
                                    error: e
                                });
                            }
                            return;
                        }
                        RS.bus.trigger(
                            "ROCKET.TestSuite.run.result.success", 
                            {
                                testSuite: self,
                                testCase: test
                            }
                        );
                        self.successes += 1;
                        self.results.push({
                            testCase: test,
                            result: "success"
                        });
                    },
                    test.wait
                );
            }
            catch (e)
            {
                if (e instanceof RS.AssertionError)
                {
                    setTimeout(
                        function() 
                        {
                            var t = test;
                            RS.bus.trigger(
                                "ROCKET.TestSuite.run.result.failure", 
                                {
                                    testSuite: self,
                                    testCase: test,
                                    error: e
                                }
                            );
                            self.failures += 1;
                            self.results.push({
                                testCase: test,
                                result: "failure",
                                error: e
                            });
                        },
                        test.wait
                    );
                }
                else
                {
                    setTimeout(
                        function()
                        {
                            var t = test;
                            RS.bus.trigger(
                                "ROCKET.TestSuite.run.result.error", 
                                {
                                    testSuite: self,
                                    testCase: test,
                                    error: e
                                }
                            );
                            self.errors += 1;
                            self.results.push({
                                testCase: test,
                                result: "error",
                                error: e
                            });
                        },
                        test.wait
                    );
                }
            }
        };
        for (i = 0; i < len; ++i)
        {
            fn(i);
        }
    };

    RS.TestSuite.prototype.clear = function()
    {
        if (this.running === true)
        {
            RS.bus.trigger(
                "ROCKET.TestSuite.clear.error", 
                "Clearing failed: TestSuite is still running!"
            );
            return;
        }
        RS.bus.trigger("ROCKET.TestSuite.clear.before", this, false);
        this.errors = 0;
        this.failures = 0;
        this.successes = 0;
        this.results = [];
        RS.bus.trigger("ROCKET.TestSuite.clear.after", this);
    };



    RS.TestLab = function(name) 
    {
        this.id = RS.getUniqueId();
        this.name = name || "RocketScience.js TestLab";
        this.suites = [];
        this.failures = 0;
        this.successes = 0;
    };

    RS.TestLab.prototype.run = function()
    {
        var i, len, suites = this.suites, cur, handle, self = this, suitesById = {};
        RS.bus.trigger("ROCKET.TestLab.run.start", this, false);
        for (i = 0, len = suites.length; i < len; ++i)
        {
            cur = suites[i];
            cur.run();
            suitesById[cur.id] = true;
        }
        RS.bus.subscribe(
            function(data, info) 
            {
                // doesn't concern this lab? return
                if (typeof suitesById[data.id] === "undefined" || suitesById[data.id] === null)
                {
                    return;
                }
                if (data.failures + data.errors === 0)
                {
                    self.successes += 1;
                }
                else
                {
                    self.failures += 1;
                }
                if (self.failures + self.successes >= self.suites.length)
                {
                    RS.bus.trigger("ROCKET.TestLab.run.end", self);
                }
            },
            "ROCKET.TestSuite.run.end"
        );
    };

    RS.TestLab.prototype.addTestSuite = function(suite)
    {
        this.suites.push(suite);
    };

    RS.TestLab.prototype.clear = function()
    {
        if (this.running === true)
        {
            RS.bus.trigger(
                "ROCKET.TestLab.clear.error", 
                "Clearing failed: TestSuite is still running!"
            );
            return;
        }
        RS.bus.trigger("ROCKET.TestLab.clear.before", this, false);
        this.successes = 0;
        this.failures = 0;
        RS.bus.trigger("ROCKET.TestLab.clear.after", this);
    };



    RS.monitors = {};

    RS.monitors.Console = function()
    {
        this.id = RS.getUniqueId();
        RS.bus.trigger("ROCKET.monitors.create", this);
    };

    RS.monitors.Console.prototype.onLabEnd = function(data, info)
    {
        console.log(" ");
        var msg = (data.failures < 1) ? "SUCCEEDED! :)" : "FAILED!!! :(";
        console.log("======================================================================");
        console.log("== TestLab Result for '" + data.name + "':");
        console.log("== " + msg);
        console.log("== Failures: " + data.failures + 
            "; Successes: " + data.successes);
        console.log("======================================================================");
        console.log(" ");
    };

    RS.monitors.Console.prototype.onSuiteEnd = function(data, info)
    {
        console.log(" ");
        var msg = (data.errors < 1 && data.failures < 1) ? "ALL TESTS SUCCEEDED! :)" : "TESTS FAILED!!! :(";
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("~~ TestSuite Result for '" + data.name + "':");
        console.log("~~ " + msg);
        console.log("~~ Errors: " + data.errors + "; Failures: " + 
        data.failures + "; Successes: " + data.successes);
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log(" ");
    };

    RS.monitors.Console.prototype.onResultFailure = function(data, info)
    {
        console.log(" ");
        console.warn(
            "[FAILURE!] TestCase '" + data.testCase.name + "' failed!. " + 
            "Reason: " + data.error.message
        );
    };

    RS.monitors.Console.prototype.onResultError = function(data, info)
    {
        console.log(" ");
        console.error(
            "[ERROR!!!] TestCase '" + data.testCase.name + "' failed!. " + 
            "Error: " + data.error.message
        );
    };

    RS.monitors.Console.prototype.switchOn = function()
    {
        var self = this;
        RS.bus.subscribe(
            function(data, info) { self.onLabEnd(data, info); }, 
            "ROCKET.TestLab.run.end"
        );
        RS.bus.subscribe(
            function(data, info) { self.onSuiteEnd(data, info); }, 
            "ROCKET.TestSuite.run.end"
        );
        RS.bus.subscribe(
            function(data, info) { self.onResultFailure(data, info); }, 
            "ROCKET.TestSuite.run.result.failure"
        );
        RS.bus.subscribe(
            function(data, info) { self.onResultError(data, info); }, 
            "ROCKET.TestSuite.run.result.error"
        );
    };



    RS.monitors.HTML = function(args)
    {
        args = args || {};
        this.id = RS.getUniqueId();
        RS.bus.trigger("ROCKET.monitors.create", this);
        this.root = args.root || document.getElementsByTagName("body")[0];
        this.labs = {};
        this.suites = {};
        this.cases = {};
    };

    RS.monitors.HTML.prototype.onLabStart = function(data, info)
    {
        var lab = document.createElement("div"),
            list = document.createElement("ul"),
            labContainer, suiteContainer, labResultsElement, suiteResultsElement,
            fn, caseContainer,
            i, j, il, jl, cur, curCase,
            cases = {},
            suiteElement, suiteList, caseElement;
        try
        {
            document.getElementsByTagName("title")[0].innerHTML = 
                'RocketScience.js TestLab: ' + data.name;
        }
        catch (e) {}
        lab.setAttribute("class", "TestLab");
        lab.innerHTML = '<h1><span class="RocketScience">' +
            'RocketScience.js</span> TestLab: ' + data.name + '</h1>';
        labResultsElement = document.createElement("p");
        labResultsElement.setAttribute("class", "TestLabResults");
        labResultsElement.setAttribute("id", "TestLabResults" + data.id);
        labResultsElement.innerHTML = 'Waiting for tests to finish...';
        this.root.appendChild(lab);
        lab.appendChild(labResultsElement);
        lab.appendChild(list);
        labContainer = 
        {
            lab: data,
            element: lab,
            list: list,
            results: labResultsElement,
            id: data.id
        };
        this.labs[data.id] = labContainer;
        for (i = 0, il = data.suites.length; i < il; ++i)
        {
            cur = data.suites[i];
            suiteElement = document.createElement("li");
            suiteElement.innerHTML = '<h2>TestSuite: ' + cur.name + '</h2>';
            suiteElement.setAttribute("class", "TestSuite");
            suiteElement.setAttribute("id", "TestSuite" + cur.id);
            suiteList = document.createElement("ul");
            suiteResultsElement = document.createElement("p");
            suiteResultsElement.setAttribute("class", "TestSuiteResults");
            suiteResultsElement.setAttribute("id", "TestSuiteResults" + cur.id);
            suiteResultsElement.innerHTML = 'Waiting for tests to finish...';
            suiteElement.appendChild(suiteList);
            suiteElement.appendChild(suiteResultsElement);
            labContainer.list.appendChild(suiteElement);
            suiteContainer = 
            {
                testSuite: cur,
                element: suiteElement,
                list: suiteList,
                results: suiteResultsElement,
                id: cur.id
            };
            this.suites[cur.id] = suiteContainer;
            for (j = 0, jl = cur.cases.length; j < jl; ++j)
            {
                curCase = cur.cases[j];
                caseElement = document.createElement("li");
                caseElement.setAttribute("class", "TestCase");
                caseElement.setAttribute("class", "TestCase" + curCase.id);
                caseElement.innerHTML = 'TestCase "' + curCase.name + '": ' + 
                    '<span class="tag pending">Pending...</span>';
                try
                {
                    suiteContainer.list.appendChild(caseElement);
                }
                catch (e)
                {
                    e.message = e.message + "--> Cannot append caseElement to suiteElement.list!";
                    throw e;
                }
                caseContainer = 
                {
                    lab: labContainer,
                    testSuite: suiteContainer,
                    test: curCase,
                    element: caseElement,
                    id: curCase.id
                };
                this.cases[curCase.id] = caseContainer;
            }
        }
    };

    RS.monitors.HTML.prototype.onLabEnd = function(data, info)
    {
        var labContainer = this.labs[data.id];
        var msg = (data.failures < 1) ? "SUCCESS!" : "FAILURE!";
        var className = (data.failures < 1) ? "success" : "failure";
        labContainer.results.innerHTML = '<span class="tag ' + className + 
            '">TestLab Result: ' + msg + '</span> ' +
            ' Failures: ' + data.failures + '; Successes: ' + data.successes;
        if (className === "success")
        {
            labContainer.element.setAttribute("class", "TestLab TestLabSuccess");
            labContainer.results.setAttribute("class", "TestLabResults TestLabSuccess");
            return;
        }
        labContainer.element.setAttribute("class", "TestLab TestLabFailure");
        labContainer.results.setAttribute("class", "TestLabResults TestLabFailure");
    };

    RS.monitors.HTML.prototype.onSuiteEnd = function(data, info)
    {
        var suiteContainer = this.suites[data.id];
        var msg = 
            (data.failures + data.errors < 1) ? "SUCCESS!" : "FAILURE!";
        var className = 
            (data.failures + data.errors < 1) ? "success" : "failure";
        suiteContainer.results.innerHTML = '<span class="TestSuiteResultOverview ' + className + 
            '">TestSuite Result: ' + msg + '</span>' + 'Errors: ' + data.errors +
            '; Failures: ' + data.failures + '; Successes: ' + data.successes;
        if (className === "success")
        {
            suiteContainer.element.setAttribute("class", "TestSuite TestSuiteSuccess");
            return;
        }
        suiteContainer.element.setAttribute("class", "TestSuite TestSuiteFailure");
    };

    RS.monitors.HTML.prototype.onResultSuccess = function(data, info)
    {
        var caseContainer = this.cases[data.testCase.id];
        caseContainer.element.setAttribute(
            "class", 
            "" + caseContainer.element.getAttribute("class") + " success"
        );
        caseContainer.element.innerHTML = 'TestCase "' + data.testCase.name + 
            '": <span class="tag success">SUCCESS!</span>';
    };

    RS.monitors.HTML.prototype.onResultFailure = function(data, info)
    {
        var caseContainer = this.cases[data.testCase.id];
        caseContainer.element.setAttribute(
            "class", 
            "" + caseContainer.element.getAttribute("class") + " failure"
        );
        caseContainer.element.innerHTML = 'TestCase "' + data.testCase.name + 
        '": <span class="tag failure">FAILURE!</span>' +
        '<span class="details">Reason: ' + data.error.message + '</span>';
    };

    RS.monitors.HTML.prototype.onResultError = function(data, info)
    {
        var caseContainer = this.cases[data.testCase.id];
        caseContainer.element.setAttribute(
            "class", 
            "" + caseContainer.element.getAttribute("class") + " error"
        );
        caseContainer.element.innerHTML = 'TestCase "' + data.testCase.name + 
        '": <span class="tag error">ERROR!</span>' +
        '<span class="details">Error: ' + data.error.message + '</span>';
    };

    RS.monitors.HTML.prototype.switchOn = function()
    {
        var self = this;
        RS.bus.subscribe(
            function(data, info) { self.onLabStart(data, info); }, 
            "ROCKET.TestLab.run.start"
        );
        RS.bus.subscribe(
            function(data, info) { self.onLabEnd(data, info); }, 
            "ROCKET.TestLab.run.end"
        );
        RS.bus.subscribe(
            function(data, info) { self.onSuiteEnd(data, info); }, 
            "ROCKET.TestSuite.run.end"
        );
        RS.bus.subscribe(
            function(data, info) { self.onResultSuccess(data, info); }, 
            "ROCKET.TestSuite.run.result.success"
        );
        RS.bus.subscribe(
            function(data, info) { self.onResultFailure(data, info); }, 
            "ROCKET.TestSuite.run.result.failure"
        );
        RS.bus.subscribe(
            function(data, info) { self.onResultError(data, info); }, 
            "ROCKET.TestSuite.run.result.error"
        );
    };
    
    for (key in RS)
    {
        if ( RS.hasOwnProperty(key) )
        {
            exports[key] = RS[key];
        }
    }
    
    return RS;
    
}(
    ( typeof console === "undefined" ) ? false : console,
    ( typeof exports === "undefined" ) ? false : exports,
    ( typeof Squiddle === "undefined" ) ? false : Squiddle
));