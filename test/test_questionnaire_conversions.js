var assert = require('assert');

var converters = require('./../src/surveyjs-fhir.js');

// First, we should test toQuestionnaire.
// The general test plan can be to take some valid SurveyJS questionnaires,
// Parse them into current SurveyJS (in case the format changes, we need to 
// be aware that the gold-standard test surveys are actually valid),
// re-serialize them, and output valid FHIR JSON.  It would be a change-detector
// test if we ended up validating against a fixed result, but we can check a few
// fields.  Finally, we can have an end-to-end idempotence test where we convert
// SurveyJS toQuestionnaire, fromQuestionnaire, and toQuestionnaire, and make sure
// that the result after the first and third operations are the same.

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

