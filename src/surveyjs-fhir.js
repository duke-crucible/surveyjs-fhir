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
    var questionnaire_json = {
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
	  var child_items = [];
	
   	  if (page.hasOwnProperty("elements")) {
            page['elements'].forEach(function (element, page_index) {
              if (element.hasOwnProperty("name") && element.hasOwnProperty("type")) {
                var child_item = {
		  'linkId': element['name']
		}

		if (element.hasOwnProperty("title")) {
		  child_item['text'] = element['title'];
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
                  case 'text':
		    if (element.hasOwnProperty("inputType")) {
		      switch (element['inputType']) {
          	        case 'number':
     		          child_item['type'] = 'decimal';

                          if (element.hasOwnProperty("defaultValue")) {
                            child_item['initial'] = [{
                                'valueDecimal': element["defaultValue"]
                            }]
                          }

     	 	          child_items.push(child_item);
		          break;
           		case 'date':
         		  child_item['type'] = 'date';

                          if (element.hasOwnProperty("defaultValue")) {
                            child_item['initial'] = [{
                                'valueDate': element["defaultValue"]
                            }]
                          }

	       	          child_items.push(child_item);
         		  break;
          		case 'datetime':
  	  	          child_item['type'] = 'dateTime';

                          if (element.hasOwnProperty("defaultValue")) {
                            child_item['initial'] = [{
                                'valueDateTime': element["defaultValue"]
                            }]
                          }
    
 	   	         child_items.push(child_item);
		         break;
	  	       case 'time':
  	  	         child_item['type'] = 'time';

                         if (element.hasOwnProperty("defaultValue")) {
                           child_item['initial'] = [{
                               'valueTime': element["defaultValue"]
                           }]
                         }

		         child_items.push(child_item);
 	        	 break;
		       case 'url':
 	  	         child_item['type'] = 'url';

                         if (element.hasOwnProperty("defaultValue")) {
                           child_item['initial'] = [{
                              'valueUri': element["defaultValue"]
                           }]
                         }

                         child_items.push(child_item);
	        	 break;
 		       default:
                         console.warn("Skipping unsupported string input type: " + element['inputType']);
		         break;
		      }
	  	    } else {
		      child_item['type'] = 'string';

                      if (element.hasOwnProperty("defaultValue")) {
                        child_item['initial'] = [{
                            'valueString': element["defaultValue"]
                        }]
                      }
                    
		      child_items.push(child_item);
		    }
		    break;
                  case 'boolean':
                    child_item['type'] = 'boolean';

                    if (element.hasOwnProperty("defaultValue")) {
                      child_item['initial'] = [{
                          'valueBoolean': element["defaultValue"]
                      }]
                    }

                    child_items.push(child_item);
                    break;	
                  case 'comment':
		    child_item['type'] = 'text';

                    if (element.hasOwnProperty("defaultValue")) {
                      child_item['initial'] = [{
                          'valueString': element["defaultValue"]
                      }]
                    }

		    child_items.push(child_item);
		    break;
		  case 'url':
		    child_item['type'] = 'url';

                    if (element.hasOwnProperty("defaultValue")) {
                      child_item['initial'] = [{
                          'valueUri': element["defaultValue"]
                      }]
                    }

                    child_items.push(child_item);
		    break;
		  case 'dropdown':
		    if (element.hasOwnProperty('hasOther') && element['hasOther']) {
	              child_item['type'] = 'open-choice';
	            } else {
		      child_item['type'] = 'choice';
		    }

                    var answer_options = [];

		    if (element.hasOwnProperty('choices')) {
                      element['choices'].forEach(function (option, page_index) {
		        var answer_option = {
			    'valueCoding': {}
			};

			if (option.hasOwnProperty('value')) {
			  answer_option['valueCoding']['code'] = option['value'];

			  if (element.hasOwnProperty("defaultValue")) {
			    if (option['value'] == element['defaultValue']) {
                              answer_option['initialSelected'] = true;
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
    	    var item_group = {
 	        'linkId': page['name'],
                'type': 'group',
	        'item': child_items
   	    };

            if (page.hasOwnProperty("title")) {
	      item_group['text'] = page['title'];
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

function unpack_items_recursive(questionnaire, fhir_version, default_title=null) {
  if (fhir_version == "R4") {
    var pages = [];

    if (questionnaire.hasOwnProperty('item')) {
      var page = {};

      // Get basic data for this page.
      var title = default_title;

      // Root questionnaire
      if (questionnaire.hasOwnProperty('title')) {
	title = questionnaire['title'];
      }

      // Child item-groups
      if (questionnaire.hasOwnProperty('text')) {
        title = questionnaire['text'];
      }

      if (title) {
	page['title'] = title;
      }

      if (questionnaire.hasOwnProperty('name')) {
	page['name'] = questionnaire['name'];
      }

      if (questionnaire.hasOwnProperty('linkId')) {
        page['name'] = questionnaire['linkId'];
      }

      var elements = [];
      questionnaire['item'].forEach(function (item, item_index) {
	if (item.hasOwnProperty('item')) {
          // This is a group.  Unpack it using our current defaults.
          pages = pages.concat(unpack_items_recursive(item, fhir_version, title));
	} else {
          // This is an element.
          var element = {};

          // Get basic, universal information for this item.
	  // Root questionnaire
          if (item.hasOwnProperty('name')) {
            element['name'] = item['name'];
          }	

	  // Child item-groups
          if (item.hasOwnProperty('linkId')) {
            element['name'] = item['linkId'];
	  }

          // Root questionnarie
	  if (item.hasOwnProperty('title')) {
            element['title'] = item['title'];
	  }

          // Child item-groups
          if (item.hasOwnProperty('text')) {
            element['title'] = item['text'];
          }

	  if (item.hasOwnProperty('required')) {
	    element['isRequired'] = item['required'];
	  }

	  if (item.hasOwnProperty('maxLength')) {
	    element['maxLength'] = item['maxLength'];
	  }
	  
          if (item.hasOwnProperty('readOnly')) {
            element['readOnly'] = item['readOnly'];
          }

	  // TODO:  Support FHIR enableWhen/enableBehavior.
	  // Going from FHIR to SurveyJS in this case should be much easier than from SurveyJS to FHIR.

	  switch (item['type']) {
	    case 'decimal':
	      if (item.hasOwnProperty('initial') && item['initial'].length == 1 && item['initial'][0].hasOwnProperty('valueDecimal')) {
		element['defaultValue'] = item['initial'][0]['valueDecimal'];
	      }

	      element['type'] = 'text';
	      element['inputType'] = 'number';
	      elements.push(element);
	      break;
            case 'date':
              if (item.hasOwnProperty('initial') && item['initial'].length == 1 && item['initial'][0].hasOwnProperty('valueDate')) {
                element['defaultValue'] = item['initial'][0]['valueDate'];
              }

              element['type'] = 'text';
              element['inputType'] = 'date';
              elements.push(element);
              break;
            case 'dateTime':
              if (item.hasOwnProperty('initial') && item['initial'].length == 1 && item['initial'][0].hasOwnProperty('valueDateTime')) {
                element['defaultValue'] = item['initial'][0]['valueDateTime'];
	      }

              element['type'] = 'text';
              element['inputType'] = 'datetime';
              elements.push(element);
              break;
            case 'time':
              if (item.hasOwnProperty('initial') && item['initial'].length == 1 && item['initial'][0].hasOwnProperty('valueTime')) {
                element['defaultValue'] = item['initial'][0]['valueTime'];
	      }

              element['type'] = 'text';
              element['inputType'] = 'time';
              elements.push(element);
              break;
	    case 'url':
              if (item.hasOwnProperty('initial') && item['initial'].length == 1 && item['initial'][0].hasOwnProperty('valueUri')) {
                element['defaultValue'] = item['initial'][0]['valueUri'];
              }

              element['type'] = 'text';
              element['inputType'] = 'url';
              elements.push(element);
	      break;
	    case 'string':
              if (item.hasOwnProperty('initial') && item['initial'].length == 1 && item['initial'][0].hasOwnProperty('valueString')) {
                element['defaultValue'] = item['initial'][0]['valueString'];
              }

              element['type'] = 'text';
              elements.push(element);
	      break;
            case 'boolean':
              if (item.hasOwnProperty('initial') && item['initial'].length == 1 && item['initial'][0].hasOwnProperty('valueBoolean')) {
                element['defaultValue'] = item['initial'][0]['valueBoolean'];
              }

              element['type'] = 'boolean';
              elements.push(element);
	      break;
            case 'text':
              if (item.hasOwnProperty('initial') && item['initial'].length == 1 && item['initial'][0].hasOwnProperty('valueString')) {
                element['defaultValue'] = item['initial'][0]['valueString'];
              }

	      element['type'] = 'comment';
              elements.push(element);
              break;
	    case 'attachment':
	      element['type'] = 'file';
	      element['maxSize'] = 0;  // Required, but no clear place to store this in FHIR.
	      elements.push(element);
	      break;
	    case 'open-choice':
              element['hasOther'] = true;
	    case 'choice':
	      element['type'] = 'dropdown';
	      var defaultValue = null;
	      var choices = [];

	      if (item.hasOwnProperty('answerOption')) {
                item['answerOption'].forEach(function (option, option_index) {
	          var choice = {};

		  if (option.hasOwnProperty('valueInteger')) {
		    choice['value'] = String(option['valueInteger']);
		    choice['text'] = String(option['valueInteger']);
		  }

                  if (option.hasOwnProperty('valueDate')) {
                    choice['value'] = String(option['valueDate']);
                    choice['text'] = String(option['valueDate']);
                  }

                  if (option.hasOwnProperty('valueTime')) {
                    choice['value'] = String(option['valueTime']);
                    choice['text'] = String(option['valueTime']);
                  }

                  if (option.hasOwnProperty('valueString')) {
                    choice['value'] = String(option['valueString']);
                    choice['text'] = String(option['valueString']);
                  }

		  if (option.hasOwnProperty('valueCoding')) {
		    if (option['valueCoding'].hasOwnProperty('code')) {
		      choice['value'] = option['valueCoding']['code'];
		      choice['text'] = option['valueCoding']['code'];
		    }

		    if (option['valueCoding'].hasOwnProperty('display')) {
                      choice['text'] = option['valueCoding']['display'];

		      if (!(choice.hasOwnProperty('value'))) {
                        choice['value'] = option['valueCoding']['display'];
		      }
		    }
		  }

	          if (choice.hasOwnProperty('value')) {
  	            if (option.hasOwnProperty('initialSelected')){
	              if (option['initialSelected']) {
                        defaultValue = choice['value'];
	  	      }
 	            }
		    choices.push(choice);
		  } else {
                    console.warn("Questionnaire dropdowns had invalid options.");
	          }
		});

		element['choices'] = choices;
	      }

	      if (defaultValue) {
		element['defaultValue'] = defaultValue;
	      }
              elements.push(element);
              break;
            default:
              console.warn("Skipping unsupported questionnaire item type: " + item['type']);
              break;
	  }
	}
      });

      // Decline to add empty pages.
      if (elements.length > 0) {
        page['elements'] = elements;
        pages.push(page);
      }
    }

    return pages;
  } else {
    throw new Error("FHIR version not implemented: " + fhir_version);
  }
}


function from_questionnaire(questionnaire, fhir_version) {
  pages = [];

  pages = unpack_items_recursive(questionnaire, fhir_version);

  return {
      'pages': pages
  };
}

function pack_survey_response(questionnaire, survey_response, fhir_version) {
  if (fhir_version == "R4") {
    // We will traverse the questionnaire's items, matching them to a survey response as possible.
    var items = [];

    // The response item's structure largely mimics that of the questionnaire itself.
    // Thus, we will copy it and add the answers whenever applicable.
    if (questionnaire.hasOwnProperty('item')) {
      questionnaire['item'].forEach(function (item, item_index) {
        var current_item = {};

	if (item.hasOwnProperty('linkId')) {
          current_item['linkId'] = item['linkId'];

          // Check the survey response for this linkId.
          if (survey_response.hasOwnProperty(item['linkId']) && item.hasOwnProperty['type']) {
 	    switch (item['type']) {
 	      case 'decimal':
		current_item['answer'] = [{'valueDecimal': survey_response[item['linkId']]}];
	        break;
              case 'date':
		current_item['answer'] = [{'valueDate': survey_response[item['linkId']]}];
                break;
              case 'dateTime':
		current_item['answer'] = [{'valueDateTime': survey_response[item['linkId']]}];
                break;
              case 'time':
		current_item['answer'] = [{'valueTime': survey_response[item['linkId']]}];
                break;
	      case 'url':
		current_item['answer'] = [{'valueUri': survey_response[item['linkId']]}];
	        break;
  	      case 'string':
		current_item['answer'] = [{'valueString': survey_response[item['linkId']]}];
	        break;
              case 'boolean':
		current_item['answer'] = [{'valueBoolean': survey_response[item['linkId']]}];
	        break;
              case 'text':
 		current_item['answer'] = [{'valueString': survey_response[item['linkId']]}];
	        break;
	      case 'attachment':
	        current_item['answer'] = [];

		survey_response[item['linkId']].forEach(function (survey_attachment, survey_attachment_index) {
                  var attachment = {};

		  if (survey_attachment.hasOwnProperty('type')) {
                    attachment['contentType'] = survey_attachment['type'];
		  }

	          if (survey_attachment.hasOwnProperty('name')) {
		    attachment['title'] = survey_attachment['name'];
		  }

		  if (survey_attachment.hasOwnProperty('content')) {
		    // SurveyJS includes a prefix.
		    // We should take everything after the comma.
                    attachment['data'] = survey_attachment['content'].substring(comma_position + 1);
		  }

	          current_item['answer'].push({'valueAttachment': attachment});
		});
	        break;
  	      case 'choice':
        	current_item['answer'] = [{'valueString': survey_response[item['linkId']]}];
	        break;
  	      case 'open-choice':  
        	current_item['answer'] = [{'valueString': survey_response[item['linkId']]}];

	        if (survey_response.hasOwnProperty(item['linkId'] + "-Comment")) {
		  current_item['answer'].push({'valueString': survey_response[item['linkId'] + "-Comment"]});
	        }
	        break;
              default:
                console.warn("Skipping unsupported questionnaire item type: " + item['type']);
                break;
	    }
	  }
	}

        if (item.hasOwnProperty('definition')) {
          current_item['definition'] = item['definition'];
	}

        if (item.hasOwnProperty('text')) {
          current_item['text'] = item['text'];
        }

	if (item.hasOwnProperty('item')) {
          current_item['item'] = pack_survey_response(item['item'], survey_response, fhir_version);
	}

	items.push(current_item);
      });
    }

    return items;
  } else {
    throw new Error("FHIR version not implemented: " + fhir_version);
  }
}

function to_questionnaire_response(questionnaire, survey_response, fhir_version) {
  if (fhir_version == "R4") {
    // We will traverse the questionnaire's items, matching them to a survey response as possible.
    var questionnaire_response_json = {
        "resourceType": "QuestionnaireResponse",
        "status": "completed",
    };

    // The response item's structure largely mimics that of the questionnaire itself.
    // Thus, we will copy it and add the answers whenever applicable.

    questionnaire_response_json['item'] = pack_survey_response(questionnaire, survey_response, fhir_version);

    return questionnaire_response_json;
  } else {
    throw new Error("FHIR version not implemented: " + fhir_version);
  }
}

function from_questionnaire_response(questionnaire_response, fhir_version) {
  return "TODO!";
}

module.exports = {
  toQuestionnaire: to_questionnaire,
  fromQuestionnaire: from_questionnaire,
  toQuestionnaireResponse: to_questionnaire_response,
  fromQuestionnaireResponse: from_questionnaire_response,
};
