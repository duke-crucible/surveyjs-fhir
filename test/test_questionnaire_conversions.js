const assert = require('assert');
const converters = require('./../src/surveyjs-fhir.js');
const Fhir = require('fhir').Fhir;
const SurveyJS = require('survey-angular');
const test_data = require('./test_data.js');


describe('toFromQuestionnaireIdempotence', function() {
  it('Should idempotently convert compatible SurveyJS to Questionnaire and back.', function(done) {
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

    assert.strictEqual(
        true,
        validation_result['valid']);

    // Check that some things in the survey FHIR translated over.
    // We avoid making a change-detector test by just spot checking a few things.
    const result_string = JSON.stringify(fhir_questionnaire);

    assert.ok(result_string.includes('Single Inputs Page'), result_string);
    assert.ok(result_string.includes('valueUri'), result_string);
    assert.ok(result_string.includes('Special Inputs Page'), result_string);
    assert.ok(result_string.includes('Lorem Ipsum Et Cetera'), result_string);
    assert.ok(result_string.includes('Dropdowns Page'), result_string);
    assert.ok(result_string.includes('item1'), result_string);

    // Now let's convert it back and see if the conversion was idempotent.
    const survey_from_fhir = converters.fromQuestionnaire(fhir_questionnaire, 'R4');
    assert.deepStrictEqual(
        survey_json,
        survey_from_fhir);

    done();
  });
});

