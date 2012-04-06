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

ROCKET.AssertionError = function(message) 
{
    this.message = message;
};
ROCKET.AssertionError.prototype = new Error();
ROCKET.AssertionError.prototype.constructor = ROCKET.AssertionError;


ROCKET.TestCase = function(name, fn, checker, args) 
{
    args = args || {};
    this.name = name;
    this.run = fn || function() {};
    this.checker = checker || function() {};
    this.wait = args.wait || 20;
};

ROCKET.TestCase.prototype.assert = function(value, message)
{
    message = message + " Value: " + value || 
        "Expected value to be true but found: " + value;
    if (value !== true)
    {
        throw new ROCKET.AssertionError(message);
    }
};


ROCKET.TestSuite = function(name)
{
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
        results = [];
    for (i = 0; i < len; ++i)
    {
        test = cases[i];
        try
        {
            test.run();
        }
        catch (e)
        {
            if (e instanceof ROCKET.AssertionError)
            {
                this.failures += 1;
                this.results.push({
                    case: test,
                    result: "failure",
                    error: e
                });
                ROCKET.bus.trigger(
                    "ROCKET.TestSuite.run.result.failure", 
                    {
                        suite: this,
                        case: test,
                        error: e
                    }
                );
            }
            else
            {
                this.errors += 1;
                this.results.push({
                    case: test,
                    result: "error",
                    error: e
                });
                ROCKET.bus.trigger(
                    "ROCKET.TestSuite.run.result.error", 
                    {
                        suite: this,
                        case: test,
                        error: e
                    }
                );
            }
            continue;
        }
        this.successes += 1;
        this.results.push({
            case: test,
            result: "success"
        });
        ROCKET.bus.trigger(
            "ROCKET.TestSuite.run.result.success", 
            {
                suite: this,
                case: test
            }
        );
    }
    this.running = false;
    ROCKET.bus.trigger("ROCKET.TestSuite.run.end", this);
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
    this.name = name || "RocketScience.js TestLab";
    this.suites = [];
    this.failures = 0;
    this.successes = 0;
};

ROCKET.TestLab.prototype.run = function()
{
    var i, len, suites = this.suites, cur;
    ROCKET.bus.trigger("ROCKET.TestLab.run.start", this, false);
    for (i = 0, len = suites.length; i < len; ++i)
    {
        failed = 0;
        cur = suites[i];
        cur.run();
        if ((cur.failures + cur.errors) > 0)
        {
            this.failures += 1;
        }
        else
        {
            this.successes += 1;
        }
    }
    ROCKET.bus.trigger("ROCKET.TestLab.run.end", this);
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
    ROCKET.bus.trigger("ROCKET.monitors.create", this);
    this.root = args.root || document.getElementsByTagName("body")[0];
    this.current = this.root;
    this.currentLab = null;
    this.currentLabList = null;
    this.currentSuite = null;
    this.currentSuiteList = null;
};

ROCKET.monitors.Default.prototype.onLabStart = function(data, info)
{
    var lab = document.createElement("div"),
        list = document.createElement("ul");
    lab.setAttribute("class", "TestLab");
    lab.innerHTML = '<h1><span class="RocketScience">' +
        'RocketScience.js</span> TestLab: ' + data.name + '</h1>';
    this.root.appendChild(lab);
    lab.appendChild(list);
    this.currentLab = lab;
    this.currentLabList = list;
};

ROCKET.monitors.Default.prototype.onLabEnd = function(data, info)
{
    var msg = (data.failures < 1) 
    ? "SUCCESS!" 
    : "FAILURE!";
    var className = (data.failures < 1) 
    ? "success" 
    : "failure";
    var results = document.createElement("div");
    results.setAttribute("class", "LabResults");
    results.innerHTML = '<p class="TestLabResults">' + 
        '<span class="tag ' + className + '">TestLab Result: ' + msg + '</span> ' +
        ' Failures: ' + data.failures + '; Successes: ' + data.successes +
        '</p>';
    this.currentLab.appendChild(results);
    this.currentLab = null;
};

ROCKET.monitors.Default.prototype.onSuiteStart = function(data, info)
{
    var suite = document.createElement("div"),
    list = document.createElement("ul");
    suite.setAttribute("class", "TestSuite");
    suite.innerHTML = "<h2>" + data.name + "</h2>";
    this.currentLabList.appendChild(suite);
    suite.appendChild(list);
    this.currentSuiteList = list;
    this.currentSuite = suite;
};

ROCKET.monitors.Default.prototype.onSuiteEnd = function(data, info)
{
    var msg = (data.failures + data.errors < 1) 
        ? "SUCCESS!" 
        : "FAILURE!";
    var className = (data.failures + data.errors < 1) 
        ? "success" 
        : "failure";
    var results = document.createElement("div");
    results.setAttribute("class", "SuiteResults");
    results.innerHTML = '<p class="results">' + 
        '<span class="' + className + '">TestSuite Result: ' + msg + '</span>' +
        'Errors: ' + data.errors +
        '; Failures: ' + data.failures + '; Successes: ' + data.successes +
        '</p>';
    this.currentSuite.appendChild(results);
    this.currentSuiteList = null;
    this.currentSuite = null;
};

ROCKET.monitors.Default.prototype.onResultSuccess = function(data, info)
{
    var li = document.createElement("li");
    li.setAttribute("class", "success");
    li.innerHTML = 'TestCase "' + data.case.name + 
        '": <span class="tag success">SUCCESS!</span>';
    this.currentSuiteList.appendChild(li);
};

ROCKET.monitors.Default.prototype.onResultFailure = function(data, info)
{
    var li = document.createElement("li");
    li.setAttribute("class", "failure");
    li.innerHTML = 'TestCase "' + data.case.name + 
        '": <span class="tag failure">FAILURE!</span>' +
        '<span class="details">Reason: ' + data.error.message + '</span>';
    this.currentSuiteList.appendChild(li);
};

ROCKET.monitors.Default.prototype.onResultError = function(data, info)
{
    var li = document.createElement("li");
    li.setAttribute("class", "error");
    li.innerHTML = 'TestCase "' + data.case.name + 
    '": <span class="tag error">ERROR!</span>' +
        '<span class="details">Error: ' + data.error.message + '</span>';
    this.currentSuiteList.appendChild(li);
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