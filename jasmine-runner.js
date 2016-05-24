const Jasmine = require('jasmine');
const SpecReporter = require('jasmine-spec-reporter');

const jrunner = new Jasmine();

jrunner.configureDefaultReporter({print: () => {}}); // remove default reporter logs
jasmine.getEnv().addReporter(new SpecReporter());    // add jasmine-spec-reporter
jrunner.loadConfigFile('./jasmine.json');            // load jasmine.json configuration
jrunner.execute();
