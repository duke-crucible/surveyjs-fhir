var assert = require('assert');
var converters = require('./../src/surveyjs-fhir.js');
var Fhir = require('fhir').Fhir;
var SurveyJS = require('survey-angular');

var sample_surveyjs_1 = {
    "pages": [
        {
            "name": "single-inputs-page",
            "elements": [
                {
                    "type": "text",
                    "name": "single-input-text",
                    "title": "Single Input Text",
                    "defaultValue": "default"
                },
                {
                    "type": "text",
                    "name": "single-input-date",
                    "title": "Single Input Date",
                    "defaultValue": "1982-11-22",
                    "inputType": "date"
                },
                {
                    "type": "text",
                    "name": "single-input-datetime",
                    "title": "Single Input Datetime",
                    "defaultValue": "11/22/1982 12:00:00",
                    "inputType": "datetime"
                },
                {
                    "type": "text",
                    "name": "single-input-time",
                    "title": "Single Input Time",
                    "defaultValue": "11:22",
                    "inputType": "time"
                },
                {
                    "type": "text",
                    "name": "single-input-number",
                    "title": "Single Input Number",
                    "defaultValue": 11.22,
                    "inputType": "number"
                },
                {
                    "type": "text",
                    "name": "single-input-url",
                    "title": "Single Input URL",
                    "defaultValue": "http://www.github.com",
       	            "inputType": "url"
                }
            ],
        "title": "Single Inputs Page"
        },
        { 
            "name": "special-inputs-page",
            "elements": [
                {
                    "type": "comment",
                    "name": "comment",
                    "title": "Read Only Comment",
                    "defaultValue": "Lorem Ipsum Et Cetera",
                    "readOnly": true
                },
                {
                    "type": "boolean",
                    "name": "Required Boolean",
                    "defaultValue": "true",
                    "isRequired": true
                },
                {
                    "type": "file",
                    "name": "file-uploader",
                    "title": "File Attachment",
                    "maxSize": 0
                }
            ],
            "title": "Special Inputs Page"
        },
        {
            "name": "dropdowns-page",
            "elements": [
                {
                    "type": "dropdown",
                    "name": "dropdown-no-other",
                    "title": "Dropdown No Other",
                    "defaultValue": "item3",
                    "choices": [
                        {
                            "value": "item1",
                            "text": "1"
                        },
                        {
                            "value": "item2",
                            "text": "2"
                        },
                        {
                            "value": "item3",
                            "text": "3"
                        }
                    ]
                },
                {
                    "type": "dropdown",
                    "name": "dropdown-with-other",
                    "title": "Dropdown With Other",
                    "choices": [
                        {
                            "value": "item1",
                            "text": "1"
                        },
                        {
                            "value": "item2",
                            "text": "2"
                        },
                        {
                            "value": "item3",
                            "text": "3"
                        }
                    ],
                    "hasOther": true
                }
            ],
            "title": "Dropdowns Page"
        }
    ]
};

describe('toFromQuestionnaireIdempotence', function() {
  it('Should idempotently convert compatible SurveyJS to Questionnaire and back.', function(done) {
    // First, we load a SurveyJS questionnaire JSON.
    var survey_json = sample_surveyjs_1; 

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
    // We avoid making a change-detector test by just spot checking a few things.
    var result_string = JSON.stringify(fhir_questionnaire);

    assert.ok(result_string.includes("Single Inputs Page"), result_string);
    assert.ok(result_string.includes("valueUri"), result_string);
    assert.ok(result_string.includes("Special Inputs Page"), result_string);
    assert.ok(result_string.includes("Lorem Ipsum Et Cetera"), result_string);
    assert.ok(result_string.includes("Dropdowns Page"), result_string);
    assert.ok(result_string.includes("item1"), result_string);

    // Now let's convert it back and see if the conversion was idempotent.
    var survey_from_fhir = converters.fromQuestionnaire(fhir_questionnaire, 'R4');
    assert.deepStrictEqual(
	survey_json,
	survey_from_fhir)

    done();
  });
});

