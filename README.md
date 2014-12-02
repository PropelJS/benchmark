benchmark
=========

Benchmarking Tool for Node Modules (Requires a version of node >= 0.11.4)

Using the CLI
---------
The cli can be installed globally

benchmark [path] [options]

If no path is specified it will default to benchmarks in the current working directory

Options:

+ --help - displays help information
+ -v, --version - displays the version information
+ -s, --silent - suppresses the reporter output
+ -i, --iterations - sets the default number of iterations of each bench, default is 10,000
+ -c, --concurrency - sets the number of iterations to run at one time, default is 100
+ -d, --delay - sets the default delay between iterations, default is 0
+ -m, --minTime - sets a default minimumTime for benches to run, default is 1,000 ms
+ -t, --timeOut - sets the default timeout for a run to be considered an error, default is 1,000 ms
+ -r, --reporter - the reporter to use, default is clean

Using the Library
---------

You may use the library by requiring the module just like any other however note that you must have harmony enabled
this may not be true after the 0.12 release but currently it is

When calling the returned function you may pass in a configuration object that works just like the command line options
with the exception of version and help not being available

If you'd like the output to be run through the reporter as it does in the cli you should set cli to true in your config
options i.e.:

```javascript
var bench = require('benchmark');
bench({cli: true});
```

You'll receive a promise back from this that you may then use to retrieve the JSON results.

## API ##

### Suite ###

Inside your test files you'll have a global suite method available. The usage for this function is:

name, function, options

Name is the display name of the suite

function is a generator function that you wish to be executed

Options can be any of:

+ comp - The benchmark that should run the fastest (turns the suite into a comparative suite)
+ delay - The delay between each iteration for this suites benchmarks
+ iterations - The number of iterations this suites benchmarks should run for
+ concurrency - The number of concurrent iterations to run at once
+ minOps - The minimum operations per second for this suites benchmarks to be considered a success
+ minTime - The minimum amount of time to run the suites benchmarks for
+ timeOut - The timeout for a run to be considered an error
+ before - A generator function to be run before the suite starts
+ after - A generator function to be run after the suite finishes
+ beforeEach - A generator function to be run before each run of the suites benches
+ afterEach - A generator function to be run after each run of the suites benches

Suites may be nested inside of each other

Please note that beforeEach and afterEach will be run for each concurrent iteration and may cause side effects if your
concurrency is greater than 1. These will also include any beforeEach and afterEach functions from the parent suites.

### Bench ###

Inside your test files you'll have a global bench method available. The usage for this function is:

name, function, options

Name is the display name of the benchmark

function is a generator function that you wish to be executed, this will receive a timer object described below

options can be any of:

+ delay - The delay between each iteration for this benchmark
+ iterations - The number of iterations this benchmark should run for
+ concurrency - The number of concurrent iterations to run at once
+ minOps - The minimum operations per second for this benchmark to be considered a success
+ minTime - The minimum amount of time to run the benchmark for
+ timeOut - The timeout for a run to be considered an error
+ before - A generator function to be run before the bench starts
+ after - A generator function to be run after the bench finishes
+ beforeEach - A generator function to be run before each run of the bench
+ afterEach - A generator function to be run after each run of the bench

Please note that beforeEach and afterEach will be run for each concurrent iteration and may cause side effects if your
concurrency is greater than 1

### Timer ###

Inside of your bench functions you'll have access to a timer object that you can add arbitrary mark points to

```javascript
bench('mark example', function * (timer) {
  timer.mark('init work');
  // do something here
  timer.mark('finished work');
}, benchOpts);
```
