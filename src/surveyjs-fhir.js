/*
 * SurveyJS-FHIR
 * (c) 2020 Duke Crucible
 * MIT license
 *
 * Converts JSON between SurveyJS and FHIR formats.
 */

// We need survey-library from SurveyJS, but it doesn't matter which way we get it.
const requireOneOf = require('require-one-of');
requireOneOf(['survey-angular', 'survey-jquery', 'survey-knockout', 'survey-react', 'survey-vue']);

function to_questionnaire(survey, fhir_version) {
  if (fhir_version == "R4") {
    questionnaire_json = {
	"resourceType": "Questionnaire",
        "status": "unknown"
    };

    if (survey.hasOwnProperty("pages")) {

    } else {
      console.warn("Survey in to_questionnaire had no pages in it.  Returning a blank FHIR questionnaire.");

    }
  } else {
    throw new Error("FHIR version not implemented: " + fhir_version);
  }

  return questionnaire_json;  
}

function from_questionnaire(questionnaire, fhir_version) {
  return "TODO!";
}

function to_questionnaire_response(questionnaire, survey_response, fhir_version) {
  return "TODO!";
}

function from_questionnaire_response(questionnaire, questionnaire_response, fhir_version) {
  return "TODO!";
}

module.exports = {
  toQuestionnaire: to_questionnaire,
  fromQuestionnaire: from_questionnaire,
  toQuestionnaireResponse: to_questionnaire_response,
  fromQuestionnaireResponse: from_questionnaire_response,
};
