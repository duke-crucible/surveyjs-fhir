const assert = require('assert');
var converters = require('./../src/surveyjs-fhir.js');
const Fhir = require('fhir').Fhir;
const SurveyJS = require('survey-angular');
const test_data = require('./test_data.js');
var converters = require('./../src/surveyjs-fhir.js');

describe('toFromQuestionnaireResponseIdempotence', function() {
  it('Questionnaire response should be converted to and from SurveyJS in an idempotent fashion.', function(done) {
    // TODO:  These first parts that only validate the survey and the FHIR
    //        can probably be factored out into a test util module.
    // First, we load a SurveyJS questionnaire JSON.
    let survey_json = test_data.sample_surveyjs_1;

    // Now parse it into a SurveyJS SurveyModel.
    const survey = new SurveyJS.SurveyModel(survey_json);

    // And finally export it back to JSON so as to validate it.
    // Note that the output here may contain additional fields, even for valid surveys.
    // TODO:  Is there a better way to avoid getting additional fields?
    survey_json = survey.toJSON();

    // Convert the survey to FHIR, and make sure the result is valid.
    const fhir = new Fhir();
    const fhir_questionnaire = converters.toQuestionnaire(survey_json, 'R4');
    const validation_result = fhir.validate(fhir_questionnaire);

    // Convert the survey result into a FHIR questionnaire response.
    const questionnaire_response = converters.toQuestionnaireResponse(
        fhir_questionnaire,
        test_data.sample_surveyjs_1_response,
        'R4');

    // Spot check that a few things came through in the survey response.
    const result_string = JSON.stringify(questionnaire_response);

    assert.ok(result_string.includes('Single Inputs Page'), result_string);
    assert.ok(result_string.includes('Other Selected!'), result_string);

    // Convert it back to SurveyJS and make sure it's the same.
    const survey_response_json = converters.fromQuestionnaireResponse(questionnaire_response, 'R4', {});

    assert.deepStrictEqual(
        survey_response_json,
        test_data.sample_surveyjs_1_response);

    done();
  });
});

