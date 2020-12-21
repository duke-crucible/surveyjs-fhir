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
        "status": "unknown",
	"item": []
    };

    // TODO:  visibleIf <-> FHIR.enableWhen and FHIR.enableBehavior need to be done in a separate pass.
    //        This is because we won't know all of the type mappings for the elements, which will require a first pass.
    //        We will need to maintain a dict of the mappings between element names and types.
    //        Further, we can only support simple clauses like (question operand value) and all must be
    //        linked by only one of "and" and "or" because of limitations of FHIR.
    //        The right way to parse this is likely going to be through SurveyJS's own conditionsParser:
    //        https://github.com/surveyjs/survey-library/blob/master/src/conditionsParser.ts

    if (survey.hasOwnProperty("pages")) {
      survey['pages'].forEach(function (page, page_index) {
	if (page.hasOwnProperty("name")) {
	  child_items = [];
	
   	  if (page.hasOwnProperty("elements")) {
            page['elements'].forEach(function (element, page_index) {
              if (element.hasOwnProperty("name") && element.hasOwnProperty("type")) {
                child_item = {
		  'linkId': element['name']
		}

		if (element.hasOwnProperty("title")) {
		  child_item['title'] = element['title'];
		}

	        if (element.hasOwnProperty("readOnly")) {
		  child_item['readOnly'] = element['readOnly'];
		}

		if (element.hasOwnProperty("maxLength")) {
		  child_item['maxLength'] = element['maxLength'];
		}

		if (element.hasOwnProperty("isRequired")) {
		  child_item['required'] = element['isRequired'];
		}

		if (element.hasOwnProperty("visibleIf")) {
                  console.warn("visibleIf is not yet supported: " + element['name']);
		}

                switch (element['type']) {
                  case 'boolean':
		    child_item['type'] = 'boolean';

		    if (element.hasOwnProperty("defaultValue")) {
		      child_item['initial'] = {
			  'valueBoolean': element["defaultValue"]
		      }
	            }

		    child_items.push(child_item);
                    break;
          	  case 'numeric':
		    child_item['type'] = 'decimal';

                    if (element.hasOwnProperty("defaultValue")) {
                      child_item['initial'] = {
                          'valueDecimal': element["defaultValue"]
                      }
                    }

		    child_items.push(child_item);
		    break;
		  case 'date':
		    child_item['type'] = 'date';

                    if (element.hasOwnProperty("defaultValue")) {
                      child_item['initial'] = {
                          'valueDate': element["defaultValue"]
                      }
                    }

		    child_items.push(child_item);
		    break;
		  case 'datetime':
		    child_item['type'] = 'dateTime';

                    if (element.hasOwnProperty("defaultValue")) {
                      child_item['initial'] = {
                          'valueDateTime': element["defaultValue"]
                      }
                    }

		    child_items.push(child_item);
		    break;
		  case 'time':
		    child_item['type'] = 'time';

                    if (element.hasOwnProperty("defaultValue")) {
                      child_item['initial'] = {
                          'valueTime': element["defaultValue"]
                      }
                    }

		    child_items.push(child_item);
		    break;
		  case 'text':
		    child_item['type'] = 'string';

                    if (element.hasOwnProperty("defaultValue")) {
                      child_item['initial'] = {
                          'valueString': element["defaultValue"]
                      }
                    }

		    child_items.push(child_item);
		    break;
                  case 'comment':
		    child_item['type'] = 'text';

                    if (element.hasOwnProperty("defaultValue")) {
                      child_item['initial'] = {
                          'valueString': element["defaultValue"]
                      }
                    }

		    child_items.push(child_item);
		    break;
		  case 'url':
		    child_item['type'] = 'url';

                    if (element.hasOwnProperty("defaultValue")) {
                      child_item['initial'] = {
                          'valueUri': element["defaultValue"]
                      }
                    }

                    child_items.push(child_item);
		    break;
		  case 'dropdown':
		    if (element.hasOwnProperty('hasOther') && element['hasOther']) {
	              child_item['type'] = 'open-choice';
	            } else {
		      child_item['type'] = 'choice';
		    }

                    answer_options = [];

		    if (element.hasOwnProperty('choices')) {
                      element['choices'].forEach(function (option, page_index) {
		        answer_option = {
			    'valueCoding': {}
			};

			if (option.hasOwnProperty('value')) {
			  answer_option['valueCoding']['code'] = option['value'];

			  if (element.hasOwnProperty("defaultValue")) {
			    if (option['value'] == element['defaultValue']) {
                              answer_option['initiaSelected'] = true;
		            }
		          }
		        }

 	   	        if (option.hasOwnProperty('text')) {
   		          answer_option['valueCoding']['display'] = option['text'];
		  	}

			answer_options.push(answer_option);
		      });
		    }

	            child_item['answerOption'] = answer_options;

		    child_items.push(child_item);
		    break;
		  case 'file':
		    child_item['type'] = 'attachment';

		    child_items.push(child_item);
		    break;
		  default:
                    console.warn("Skipping unsupported survey element type: " + element['type']);
		    break;
		 }

              } else {
                console.warn("Survey elements found missing a name or type.  These will be skipped.");
	      }
            });
          }

          if (child_items.length > 0) {
    	    item_group = {
 	        'linkId': page['name'],
                'type': 'group',
	        'item': child_items
   	    };

            if (page.hasOwnProperty("title")) {
	      item_group['text'] = pages['title'];
   	    }

            questionnaire_json['item'].push(item_group);
	  } else {
            console.warn("A page was found with no elements, so it could not be included in our FHIR questionnaire.");
	  }
	} else {
          console.warn("Survey page had no name, so it could not be included in our FHIR questionnaire.");
	}
      });
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
