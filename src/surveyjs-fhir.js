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

function to_questionnaire(survey, fhir_format) {
  return "TODO!";
}

function from_questionnaire(questionnaire, fhir_format) {
  return "TODO!";
}

function to_questionnaire_response(questionnaire, response, fhir_format) {
  return "TODO!";
}

function from_questionnaire_response(questionnaire, response, fhir_format) {
  return "TODO!";
}

module.exports = {
  toQuestionnaire: to_questionnaire,
  fromQuestionnaire: from_questionnaire,
  toQuestionnaireResponse: to_questionnaire_response,
  fromQuestionnaireResponse: from_questionnaire_response,
};
