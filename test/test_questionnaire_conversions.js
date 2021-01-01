const assert = require('assert');
const converters = require('./../src/index.js');
const Fhir = require('fhir').Fhir;
const SurveyJS = require('survey-angular');
const testData = require('./test_data.js');


describe('toFromQuestionnaireIdempotence', function() {
  it('Should idempotently convert compatible SurveyJS ' +
     'to Questionnaire and back.', (done) => {
    // First, we load a SurveyJS questionnaire JSON.
    let surveyJson = testData.sampleSurveyjs1;

    // Now parse it into a SurveyJS SurveyModel.
    const survey = new SurveyJS.SurveyModel(surveyJson);

    // And finally export it back to JSON so as to validate it.
    // Note that the output here may contain additional fields,
    // even for valid surveys.

    // TODO:  Is there a better way to avoid getting additional fields?
    surveyJson = survey.toJSON();

    // Convert the survey to FHIR, and make sure the result is valid.
    const fhir = new Fhir();
    const fhirQuestionnaire = converters.toQuestionnaire(surveyJson, 'R4');
    const validationResult = fhir.validate(fhirQuestionnaire);

    assert.strictEqual(
        true,
        validationResult['valid']);

    // Check that some things in the survey FHIR translated over.
    // We avoid making a change-detector test by spot checking a few things.
    const resultString = JSON.stringify(fhirQuestionnaire);

    assert.ok(resultString.includes('Single Inputs Page'), resultString);
    assert.ok(resultString.includes('valueUri'), resultString);
    assert.ok(resultString.includes('Special Inputs Page'), resultString);
    assert.ok(resultString.includes('Lorem Ipsum Et Cetera'), resultString);
    assert.ok(resultString.includes('Dropdowns Page'), resultString);
    assert.ok(resultString.includes('item1'), resultString);

    // Now let's convert it back and see if the conversion was idempotent.
    const surveyFromFhir = converters.fromQuestionnaire(
        fhirQuestionnaire, 'R4');
    assert.deepStrictEqual(
        surveyJson,
        surveyFromFhir);

    done();
  });
});

