var assert = require('assert');

var converters = require('./../src/surveyjs-fhir.js');

describe('fromQuestionnaireResponseTODO', function() {
  it('should return TODO', function(done) {
    assert.strictEqual(
	'TODO!',
	 converters.fromQuestionnaireResponse('TODO', 'TODO', 'TODO'));
    done();
  });
});

describe('toQuestionnaireResponseTODO', function() {
  it('should return TODO', function(done) {
    assert.strictEqual(
        'TODO!',
         converters.toQuestionnaireResponse('TODO', 'TODO', 'TODO'));
    done();
  });
});

