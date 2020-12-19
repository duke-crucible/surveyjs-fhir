var assert = require('assert');
var converters = require('./../src/surveyjs-fhir.js');
var Fhir = require('fhir').Fhir;
var SurveyJS = require('survey-angular');

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
    // First, we load a SurveyJS questionnaire JSON.
    var survey_json = {
        "pages": [
            {
                "name": "page1",
                "elements": [
                    {
                        "type": "text",
                        "name": "question1",
                        "title": "Enter a Thing"
                    },
                    {
                        "type": "dropdown",
                        "name": "question2",
                        "title": "More Things!",
                        "choices": [
                            {
                                "value": "item1",
                                "text": "A"
                            },
                            {
                                "value": "item2",
                                "text": "B"
                            },
                            {
                                "value": "item3",
                                "text": "C"
                            },
                            {
                                "value": "item4",
                                "text": "D"
                            }
                        ]
                    },
                    {
                        "type": "checkbox",
                        "name": "question3",
                        "visibleIf": "{question2} = 'item1'",
                        "title": "Only if 2 is A.",
                        "choices": [
                            {
                                "value": "item1",
                                "text": "Yes"
                            }
                        ]
                    }
                ]
            }
        ]
    };

    // Now parse it into a SurveyJS SurveyModel.
    var survey = new SurveyJS.SurveyModel(survey_json);

    // And finally export it back to JSON so as to validate it.
    // Note that the output here may contain additional fields, even for valid surveys.
    // TODO:  Is there a better way to avoid getting additional fields?
    survey_json = survey.toJSON();

    // Convert the survey to FHIR, and make sure the result is valid.
    var fhir = new Fhir();
    var fhir_questionnaire = converters.toQuestionnaire(survey_json, 'R4');
    var validation_result = fhir.validate(fhir_questionnaire);

    assert.strictEqual(
         true,
         validation_result['valid']);

    // Check that some things in the survey FHIR translated over.

    done();
  });
});

