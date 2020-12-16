var assert = require('assert');

var converters = require('./../src/surveyjs-fhir.js');

describe('fromQuestionnaireTODO', function() {
  it('should return TODO', function(done) {
    assert.strictEqual(
	'TODO!',
	 converters.fromQuestionnaire('TODO', 'TODO'));
    done();
  });
});

describe('toQuestionnaireTODO', function() {
  it('should return TODO', function(done) {
    assert.strictEqual(
        'TODO!',
         converters.toQuestionnaire('TODO', 'TODO'));
    done();
  });
});

