var assert = require('assert');

var converters = require('./../src/surveyjs-fhir.js');

describe('returnsTest', function() {
  it('should return Test', function(done) {
    assert.strictEqual('Test!', converters.removeThisTest());
    done();
  });
});
