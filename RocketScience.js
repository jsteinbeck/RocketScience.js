var console = console || { log: function() {} };
console.error = console.log;
console.warn = console.log;

/**

    @module RocketScience.js


    [Object] ROCKET
    ===============
    
        Namespace object for the RocketScience Unit Testing Suite.
        

*/
var ROCKET = ROCKET || {};

ROCKET.bus = new Squiddle();

ROCKET.highestId = 0;

ROCKET.getUniqueId = function()
{
    var p1, p2, p3, out;
    p1 = 255 * Math.random();
    p2 = 255 * Math.random();
    p3 = 255 * Math.random();
    ROCKET.highestId += 1;
    out = ROCKET.highestId + parseInt(p1 * p2 * p3);
    return out;
};

ROCKET.AssertionError = function(message) 
{
    this.message = message;
};
ROCKET.AssertionError.prototype = new Error();
ROCKET.AssertionError.prototype.constructor = ROCKET.AssertionError;


ROCKET.TestCase = function(name, fn, checker, args) 
{
    args = args || {};
    var self = this;
    this.id = ROCKET.getUniqueId();
    this.name = name;
    this.run = fn || function() {};
    this.checker = checker || function() {};
    this.wait = args.wait || 20;
    this.init = args.init || function() { return {}; };
};

ROCKET.TestCase.prototype.assert = function(value, message)
{
    message = message ||  "Expected value to be true.";
    message = message + " Value: " + value;
    if (value !== true)
    {
        throw new ROCKET.AssertionError(message);
    }
};

ROCKET.TestCase.prototype.assertTruthy = function(value, message)
{
    message = message + " Found: " + value || 
    "Expected value to be truthy but found: " + value;
    if (value)
    {
        // ...
    }
    else
    {
        throw new ROCKET.AssertionError(message);
    }
};

ROCKET.TestCase.prototype.assertEquals = function(value, expect, message)
{
    message = message || "Expected values to be exactly equal.";
    message = message + " Value: " + value + "; Expected: " + expect;
    if (value !== expect)
    {
        throw new ROCKET.AssertionError(message);
    }
};


ROCKET.TestSuite = function(name)
{
    this.id = ROCKET.getUniqueId();
    this.name = name || "RocketScience.js TestSuite";
    this.cases = [];
    this.errors = 0;
    this.failures = 0;
    this.results = [];
    this.running = false;
};

ROCKET.TestSuite.prototype.addTestCase = function(testCase)
{
    ROCKET.bus.trigger("ROCKET.TestSuite.addTestCase", this);
    this.cases.push(testCase);
};

ROCKET.TestSuite.prototype.run = function()
{
    this.clear();
    this.running = true;
    ROCKET.bus.trigger("ROCKET.TestSuite.run.start", this);
    var i, test, 
        cases = this.cases, 
        len = cases.length, 
        results = [],
        key,
        self = this,
        ret, handle;
    handle = setInterval(
        function()
        {
            if (self.successes + self.errors + self.failures === self.cases.length)
            {
                self.running = false;
                ROCKET.bus.trigger("ROCKET.TestSuite.run.end", self);
                clearInterval(handle);
                return;
            }
        },
        20
    );
    for (i = 0; i < len; ++i)
    {
        (
            function() 
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
                                if (e instanceof ROCKET.AssertionError)
                                {
                                    ROCKET.bus.trigger(
                                        "ROCKET.TestSuite.run.result.failure", 
                                        {
                                            suite: self,
                                            case: test,
                                                error: e
                                        }
                                    );
                                    self.failures += 1;
                                    self.results.push({
                                        case: test,
                                        result: "failure",
                                        error: e
                                    });
                                }
                                else
                                {
                                    ROCKET.bus.trigger(
                                        "ROCKET.TestSuite.run.result.error", 
                                        {
                                            suite: self,
                                        case: test,
                                            error: e
                                        }
                                    );
                                    self.errors += 1;
                                    self.results.push({
                                        case: test,
                                        result: "error",
                                        error: e
                                    });
                                }
                                return;
                            }
                            ROCKET.bus.trigger(
                                "ROCKET.TestSuite.run.result.success", 
                                {
                                    suite: self,
                                        case: test
                                }
                            );
                            self.successes += 1;
                            self.results.push({
                                case: test,
                                result: "success"
                            });
                        },
                        test.wait
                    );
                }
                catch (e)
                {
                    if (e instanceof ROCKET.AssertionError)
                    {
                        setTimeout(
                            function() 
                            {
                                var t = test;
                                ROCKET.bus.trigger(
                                    "ROCKET.TestSuite.run.result.failure", 
                                    {
                                        suite: self,
                                        case: test,
                                        error: e
                                    }
                                );
                                self.failures += 1;
                                self.results.push({
                                    case: test,
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
                                ROCKET.bus.trigger(
                                    "ROCKET.TestSuite.run.result.error", 
                                    {
                                        suite: self,
                                        case: test,
                                        error: e
                                    }
                                );
                                self.errors += 1;
                                self.results.push({
                                    case: test,
                                    result: "error",
                                    error: e
                                });
                            },
                            test.wait
                        );
                    };
                }
            }
        )();
    }
};

ROCKET.TestSuite.prototype.clear = function()
{
    if (this.running === true)
    {
        ROCKET.bus.trigger(
            "ROCKET.TestSuite.clear.error", 
            "Clearing failed: TestSuite is still running!"
        );
        return;
    }
    ROCKET.bus.trigger("ROCKET.TestSuite.clear.before", this, false);
    this.errors = 0;
    this.failures = 0;
    this.successes = 0;
    this.results = [];
    ROCKET.bus.trigger("ROCKET.TestSuite.clear.after", this);
};



ROCKET.TestLab = function(name) 
{
    this.id = ROCKET.getUniqueId();
    this.name = name || "RocketScience.js TestLab";
    this.suites = [];
    this.failures = 0;
    this.successes = 0;
};

ROCKET.TestLab.prototype.run = function()
{
    var i, len, suites = this.suites, cur, handle, self = this, suitesById = {};
    ROCKET.bus.trigger("ROCKET.TestLab.run.start", this, false);
    for (i = 0, len = suites.length; i < len; ++i)
    {
        failed = 0;
        cur = suites[i];
        cur.run();
        suitesById[cur.id] = true;
    }
    ROCKET.bus.subscribe(
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
                ROCKET.bus.trigger("ROCKET.TestLab.run.end", self);
            }
        },
        "ROCKET.TestSuite.run.end"
    );
};

ROCKET.TestLab.prototype.addTestSuite = function(suite)
{
    this.suites.push(suite);
};

ROCKET.TestLab.prototype.clear = function()
{
    if (this.running === true)
    {
        ROCKET.bus.trigger(
            "ROCKET.TestLab.clear.error", 
            "Clearing failed: TestSuite is still running!"
        );
        return;
    }
    ROCKET.bus.trigger("ROCKET.TestLab.clear.before", this, false);
    this.successes = 0;
    this.failures = 0;
    ROCKET.bus.trigger("ROCKET.TestLab.clear.after", this);
};



ROCKET.monitors = {};

ROCKET.monitors.Console = function()
{
    this.id = ROCKET.getUniqueId();
    ROCKET.bus.trigger("ROCKET.monitors.create", this);
};

ROCKET.monitors.Console.prototype.onLabStart = function(data, info)
{
    console.log(" ");
    console.log(
        "[i] .. TestLab '" + data.name + "' started."
    );
    console.log(" ");
};

ROCKET.monitors.Console.prototype.onLabEnd = function(data, info)
{
    console.log(
        "[i] .. TestLab '" + data.name + "' finished."
    );
    console.log(" ");
    var msg = (data.failures < 1) 
        ? "SUCCEEDED! :)" 
        : "FAILED!!! :(";
    console.log("[R] .. =====================================================");
    console.log("[R] .. == TestLab '" + data.name + "' " + msg);
    console.log("[R] .. == Failures: " + data.failures + 
        "; Successes: " + data.successes);
    console.log("[R] .. =====================================================");
    console.log(" ");
};

ROCKET.monitors.Console.prototype.onSuiteStart = function(data, info)
{
    console.log(
        "[i] .... TestSuite '" + data.name + "' started."
    );
    console.log(" ");
};

ROCKET.monitors.Console.prototype.onSuiteEnd = function(data, info)
{
    console.log(" ");
    console.log(
        "[i] .... TestSuite '" + data.name + "' finished."
    );
    console.log(" ");
    var msg = (data.errors < 1 && data.failures < 1) 
    ? "ALL TESTS SUCCEEDED! :)" 
    : "TESTS FAILED!!! :(";
    console.log("[R] .... ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log("[R] .... ~~ TestSuite Result: " + msg);
    console.log("[R] .... ~~ Errors: " + data.errors + "; Failures: " + 
    data.failures + "; Successes: " + data.successes);
    console.log("[R] .... ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log(" ");
};

ROCKET.monitors.Console.prototype.onResultSuccess = function(data, info)
{
    console.log(
        "[S] ...... [SUCCESS!] TestCase '" + data.case.name + "' succeeded!."
    );
};

ROCKET.monitors.Console.prototype.onResultFailure = function(data, info)
{
    console.warn(
        "[X] ...... [FAILURE!] TestCase '" + data.case.name + "' failed!. " + 
        "Reason: " + data.error.message
    );
};

ROCKET.monitors.Console.prototype.onResultError = function(data, info)
{
    console.error(
        "[!] ...... [ERROR!!!] TestCase '" + data.case.name + "' failed!. " + 
        "Error: " + data.error.message
    );
};

ROCKET.monitors.Console.prototype.switchOn = function()
{
    var self = this;
    ROCKET.bus.subscribe(
        function(data, info) { self.onLabStart(data, info); }, 
        "ROCKET.TestLab.run.start"
    );
    ROCKET.bus.subscribe(
        function(data, info) { self.onLabEnd(data, info); }, 
        "ROCKET.TestLab.run.end"
    );
    ROCKET.bus.subscribe(
        function(data, info) { self.onSuiteStart(data, info); }, 
        "ROCKET.TestSuite.run.start"
    );
    ROCKET.bus.subscribe(
        function(data, info) { self.onSuiteEnd(data, info); }, 
        "ROCKET.TestSuite.run.end"
    );
    ROCKET.bus.subscribe(
        function(data, info) { self.onResultSuccess(data, info); }, 
        "ROCKET.TestSuite.run.result.success"
    );
    ROCKET.bus.subscribe(
        function(data, info) { self.onResultFailure(data, info); }, 
        "ROCKET.TestSuite.run.result.failure"
    );
    ROCKET.bus.subscribe(
        function(data, info) { self.onResultError(data, info); }, 
        "ROCKET.TestSuite.run.result.error"
    );
};








ROCKET.monitors.Default = function(args)
{
    args = args || {};
    this.id = ROCKET.getUniqueId();
    ROCKET.bus.trigger("ROCKET.monitors.create", this);
    this.root = args.root || document.getElementsByTagName("body")[0];
    this.labs = {};
    this.suites = {};
    this.cases = {};
};

ROCKET.monitors.Default.prototype.onLabStart = function(data, info)
{
    var lab = document.createElement("div"),
        list = document.createElement("ul"),
        labContainer, suiteContainer, labResultsElement, suiteResultsElement,
        fn,
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
            suite: cur,
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
                suite: suiteContainer,
                test: curCase,
                element: caseElement,
                id: curCase.id
            };
            this.cases[curCase.id] = caseContainer;
        }
    }
};

ROCKET.monitors.Default.prototype.onLabEnd = function(data, info)
{
    var labContainer = this.labs[data.id];
    var msg = (data.failures < 1) 
    ? "SUCCESS!" 
    : "FAILURE!";
    var className = (data.failures < 1) 
    ? "success" 
    : "failure";
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

ROCKET.monitors.Default.prototype.onSuiteEnd = function(data, info)
{
    var suiteContainer = this.suites[data.id];
    var msg = 
        (data.failures + data.errors < 1) 
        ? "SUCCESS!" 
        : "FAILURE!";
    var className = 
        (data.failures + data.errors < 1) 
        ? "success" 
        : "failure";
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

ROCKET.monitors.Default.prototype.onResultSuccess = function(data, info)
{
    var caseContainer = this.cases[data.case.id];
    caseContainer.element.setAttribute(
        "class", 
        "" + caseContainer.element.getAttribute("class") + " success"
    );
    caseContainer.element.innerHTML = 'TestCase "' + data.case.name + 
        '": <span class="tag success">SUCCESS!</span>';
};

ROCKET.monitors.Default.prototype.onResultFailure = function(data, info)
{
    var caseContainer = this.cases[data.case.id];
    caseContainer.element.setAttribute(
        "class", 
        "" + caseContainer.element.getAttribute("class") + " failure"
    );
    caseContainer.element.innerHTML = 'TestCase "' + data.case.name + 
    '": <span class="tag failure">FAILURE!</span>' +
    '<span class="details">Reason: ' + data.error.message + '</span>';
};

ROCKET.monitors.Default.prototype.onResultError = function(data, info)
{
    var caseContainer = this.cases[data.case.id];
    caseContainer.element.setAttribute(
        "class", 
        "" + caseContainer.element.getAttribute("class") + " error"
    );
    caseContainer.element.innerHTML = 'TestCase "' + data.case.name + 
    '": <span class="tag error">ERROR!</span>' +
    '<span class="details">Error: ' + data.error.message + '</span>';
};

ROCKET.monitors.Default.prototype.switchOn = function()
{
    var self = this;
    ROCKET.bus.subscribe(
        function(data, info) { self.onLabStart(data, info); }, 
        "ROCKET.TestLab.run.start"
    );
    ROCKET.bus.subscribe(
        function(data, info) { self.onLabEnd(data, info); }, 
        "ROCKET.TestLab.run.end"
    );
    ROCKET.bus.subscribe(
        function(data, info) { self.onSuiteEnd(data, info); }, 
        "ROCKET.TestSuite.run.end"
    );
    ROCKET.bus.subscribe(
        function(data, info) { self.onResultSuccess(data, info); }, 
        "ROCKET.TestSuite.run.result.success"
    );
    ROCKET.bus.subscribe(
        function(data, info) { self.onResultFailure(data, info); }, 
        "ROCKET.TestSuite.run.result.failure"
    );
    ROCKET.bus.subscribe(
        function(data, info) { self.onResultError(data, info); }, 
        "ROCKET.TestSuite.run.result.error"
    );
};