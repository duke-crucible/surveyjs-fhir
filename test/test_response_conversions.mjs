import assert from 'assert';
import converters from './../src/index.mjs';
import {Fhir} from 'fhir';
import SurveyJS from 'survey-angular';
import testData from './test_data.mjs';

describe('toFromQuestionnaireResponseIdempotence', function() {
  it('Questionnaire response should be converted to and from SurveyJS ' +
     'in an idempotent fashion.', function(done) {
    // TODO:  These first parts that only validate the survey and the FHIR
    //        can probably be factored out into a test util module.
    // First, we load a SurveyJS questionnaire JSON.
    let surveyJson = testData.sampleSurveyjs1;

    // Now parse it into a SurveyJS SurveyModel.
    const survey = new SurveyJS.SurveyModel(surveyJson);

    // And finally export it back to JSON so as to validate it.
    // Note that the output here may contain additional fields, even for
    // valid surveys.
    // TODO:  Is there a better way to avoid getting additional fields?
    surveyJson = survey.toJSON();

    // Convert the survey to FHIR, and make sure the result is valid.
    const fhir = new Fhir();
    const fhirQuestionnaire = converters.toQuestionnaire(surveyJson, 'R4');
    const validationResult = fhir.validate(fhirQuestionnaire);

    assert.strictEqual(
        true,
        validationResult.valid);

    // Convert the survey result into a FHIR questionnaire response.
    const questionnaireResponse = converters.toQuestionnaireResponse(
        fhirQuestionnaire,
        testData.sampleSurveyjs1Response,
        'R4');

    // Spot check that a few things came through in the survey response.
    const resultString = JSON.stringify(questionnaireResponse);

    assert.ok(resultString.includes('Single Inputs Page'), resultString);
    assert.ok(resultString.includes('Other Selected!'), resultString);

    // Convert it back to SurveyJS and make sure it's the same.
    const surveyResponseJson = converters.fromQuestionnaireResponse(
        questionnaireResponse, 'R4', {});

    assert.deepStrictEqual(
        surveyResponseJson,
        testData.sampleSurveyjs1Response);

    done();
  });
});

