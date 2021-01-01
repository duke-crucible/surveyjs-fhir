/*
 * SurveyJS-FHIR
 * (c) 2020 Duke Crucible
 * MIT license
 *
 * Converts JSON between SurveyJS and FHIR formats.
 */

// We need survey-library from SurveyJS, but it doesn't matter which
// way we get it.
const requireOneOf = require('require-one-of');
requireOneOf([
  'survey-angular',
  'survey-jquery',
  'survey-knockout',
  'survey-react',
  'survey-vue']);

/**
 * Convert a SurveyJS Questionnaire to a FHIR Questionnaire.
 *
 * @param {json} survey JSON representing a SurveyJS survey.
 * @param {string} fhirVersion The FHIR version of the result Questionnaire.
 *
 * @return {json} JSON representing an equivalent FHIR Questionnaire.
 */
function toQuestionnaire(survey, fhirVersion) {
  if (fhirVersion === 'R4') {
    const questionnaireJson = {
      'resourceType': 'Questionnaire',
      'status': 'unknown',
      'item': [],
    };

    // TODO:  visibleIf <-> FHIR.enableWhen and FHIR.enableBehavior need to be
    //        done in a separate pass. This is because we won't know all of the
    //        type mappings for the elements, which will require a first pass.
    //        We will need to maintain a dict of the mappings between element
    //        names and types. Further, we can only support simple clauses like
    //        (question operand value) and all must be linked by only one of
    //        "and" and "or" because of limitations of FHIR.
    //        The right way to parse this is likely going to be through
    //        SurveyJS's own conditionsParser:
    //        https://github.com/surveyjs/survey-library/blob/master/src/conditionsParser.ts

    if (survey.hasOwnProperty('pages')) {
      survey['pages'].forEach((page, pageIndex) => {
        if (page.hasOwnProperty('name')) {
          const childItems = [];

          if (page.hasOwnProperty('elements')) {
            page['elements'].forEach((element, elementIndex) => {
              if (element.hasOwnProperty('name') &&
                  element.hasOwnProperty('type')) {
                const childItem = {
                  'linkId': element['name'],
                };

                if (element.hasOwnProperty('title')) {
                  childItem['text'] = element['title'];
                }

                if (element.hasOwnProperty('readOnly')) {
                  childItem['readOnly'] = element['readOnly'];
                }

                if (element.hasOwnProperty('maxLength')) {
                  childItem['maxLength'] = element['maxLength'];
                }

                if (element.hasOwnProperty('isRequired')) {
                  childItem['required'] = element['isRequired'];
                }

                if (element.hasOwnProperty('visibleIf')) {
                  console.warn(
                      'visibleIf is not yet supported: ' +
                      element['name']);
                }

                switch (element['type']) {
                  case 'text':
                    if (element.hasOwnProperty('inputType')) {
                      switch (element['inputType']) {
                        case 'number':
                          childItem['type'] = 'decimal';

                          if (element.hasOwnProperty('defaultValue')) {
                            childItem['initial'] = [{
                              'valueDecimal': element['defaultValue'],
                            }];
                          }

                          childItems.push(childItem);
                          break;
                        case 'date':
                          childItem['type'] = 'date';

                          if (element.hasOwnProperty('defaultValue')) {
                            childItem['initial'] = [{
                              'valueDate': element['defaultValue'],
                            }];
                          }

                          childItems.push(childItem);
                          break;
                        case 'datetime':
                          childItem['type'] = 'dateTime';

                          if (element.hasOwnProperty('defaultValue')) {
                            childItem['initial'] = [{
                              'valueDateTime': element['defaultValue'],
                            }];
                          }

                          childItems.push(childItem);
                          break;
                        case 'time':
                          childItem['type'] = 'time';

                          if (element.hasOwnProperty('defaultValue')) {
                            childItem['initial'] = [{
                              'valueTime': element['defaultValue'],
                            }];
                          }

                          childItems.push(childItem);
                          break;
                        case 'url':
                          childItem['type'] = 'url';

                          if (element.hasOwnProperty('defaultValue')) {
                            childItem['initial'] = [{
                              'valueUri': element['defaultValue'],
                            }];
                          }

                          childItems.push(childItem);
                          break;
                        default:
                          console.warn(
                              'Skipping unsupported string input type: ' +
                              element['inputType']);
                          break;
                      }
                    } else {
                      childItem['type'] = 'string';

                      if (element.hasOwnProperty('defaultValue')) {
                        childItem['initial'] = [{
                          'valueString': element['defaultValue'],
                        }];
                      }

                      childItems.push(childItem);
                    }
                    break;
                  case 'boolean':
                    childItem['type'] = 'boolean';

                    if (element.hasOwnProperty('defaultValue')) {
                      childItem['initial'] = [{
                        'valueBoolean': element['defaultValue'],
                      }];
                    }

                    childItems.push(childItem);
                    break;
                  case 'comment':
                    childItem['type'] = 'text';

                    if (element.hasOwnProperty('defaultValue')) {
                      childItem['initial'] = [{
                        'valueString': element['defaultValue'],
                      }];
                    }

                    childItems.push(childItem);
                    break;
                  case 'url':
                    childItem['type'] = 'url';

                    if (element.hasOwnProperty('defaultValue')) {
                      childItem['initial'] = [{
                        'valueUri': element['defaultValue'],
                      }];
                    }

                    childItems.push(childItem);
                    break;
                  case 'dropdown':
                    if (element.hasOwnProperty('hasOther') &&
                        element['hasOther']) {
                      childItem['type'] = 'open-choice';
                    } else {
                      childItem['type'] = 'choice';
                    }

                    const answerOptions = [];

                    if (element.hasOwnProperty('choices')) {
                      element['choices'].forEach((option, optionIndex) => {
                        const answerOption = {
                          'valueCoding': {},
                        };

                        if (option.hasOwnProperty('value')) {
                          answerOption['valueCoding']['code'] = option['value'];

                          if (element.hasOwnProperty('defaultValue')) {
                            if (option['value'] === element['defaultValue']) {
                              answerOption['initialSelected'] = true;
                            }
                          }
                        }

                        if (option.hasOwnProperty('text')) {
                          answerOption['valueCoding']['display'] = (
                            option['text']);
                        }

                        answerOptions.push(answerOption);
                      });
                    }

                    childItem['answerOption'] = answerOptions;

                    childItems.push(childItem);
                    break;
                  case 'file':
                    childItem['type'] = 'attachment';

                    childItems.push(childItem);
                    break;
                  default:
                    console.warn(
                        'Skipping unsupported survey element type: ' +
                        element['type']);
                    break;
                }
              } else {
                console.warn(
                    'Survey elements found missing a name or type.  ' +
                    'These will be skipped.');
              }
            });
          }

          if (childItems.length > 0) {
            const itemGroup = {
              'linkId': page['name'],
              'type': 'group',
              'item': childItems,
            };

            if (page.hasOwnProperty('title')) {
              itemGroup['text'] = page['title'];
            }

            questionnaireJson['item'].push(itemGroup);
          } else {
            console.warn(
                'A page was found with no elements, so it could not be ' +
                'included in our FHIR questionnaire.');
          }
        } else {
          console.warn(
              'Survey page had no name, so it could not be included in our ' +
              'FHIR questionnaire.');
        }
      });
    } else {
      console.warn(
          'Survey in toQuestionnaire had no pages in it.  ' +
          'Returning a blank FHIR questionnaire.');
    }

    return questionnaireJson;
  } else {
    throw new Error('FHIR version not implemented: ' + fhirVersion);
  }
}

/**
 * Recursively convert a FHIR questionnaire or its child item into
 * a SurveyJS survey.
 *
 * @param {json} questionnaire JSON representing a FHIR
 *     Questionnaire or one of its child items.
 * @param {string} fhirVersion The FHIR version of the questionnaie.
 * @param {string} defaultTitle The default title to use for a SurveyJS
 *     page created if a suitable one is not found.
 *
 * @return {json} JSON representing an equivalent SurveyJS Questionnaire.
 */
function unpackItemsRecursive(questionnaire, fhirVersion, defaultTitle=null) {
  if (fhirVersion === 'R4') {
    let pages = [];

    if (questionnaire.hasOwnProperty('item')) {
      const page = {};

      // Get basic data for this page.
      let title = defaultTitle;

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

      const elements = [];
      questionnaire['item'].forEach((item, itemIndex) => {
        if (item.hasOwnProperty('item')) {
          // This is a group.  Unpack it using our current defaults.
          pages = pages.concat(unpackItemsRecursive(
              item, fhirVersion, title));
        } else {
          // This is an element.
          const element = {};

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
          // Going from FHIR to SurveyJS in this case should be much easier
          // than from SurveyJS to FHIR.

          switch (item['type']) {
            case 'decimal':
              if (item.hasOwnProperty('initial') &&
                  item['initial'].length === 1 &&
                  item['initial'][0].hasOwnProperty('valueDecimal')) {
                element['defaultValue'] = item['initial'][0]['valueDecimal'];
              }

              element['type'] = 'text';
              element['inputType'] = 'number';
              elements.push(element);
              break;
            case 'date':
              if (item.hasOwnProperty('initial') &&
                  item['initial'].length === 1 &&
                  item['initial'][0].hasOwnProperty('valueDate')) {
                element['defaultValue'] = item['initial'][0]['valueDate'];
              }

              element['type'] = 'text';
              element['inputType'] = 'date';
              elements.push(element);
              break;
            case 'dateTime':
              if (item.hasOwnProperty('initial') &&
                  item['initial'].length === 1 &&
                  item['initial'][0].hasOwnProperty('valueDateTime')) {
                element['defaultValue'] = item['initial'][0]['valueDateTime'];
              }

              element['type'] = 'text';
              element['inputType'] = 'datetime';
              elements.push(element);
              break;
            case 'time':
              if (item.hasOwnProperty('initial') &&
                  item['initial'].length === 1 &&
                  item['initial'][0].hasOwnProperty('valueTime')) {
                element['defaultValue'] = item['initial'][0]['valueTime'];
              }

              element['type'] = 'text';
              element['inputType'] = 'time';
              elements.push(element);
              break;
            case 'url':
              if (item.hasOwnProperty('initial') &&
                  item['initial'].length === 1 &&
                  item['initial'][0].hasOwnProperty('valueUri')) {
                element['defaultValue'] = item['initial'][0]['valueUri'];
              }

              element['type'] = 'text';
              element['inputType'] = 'url';
              elements.push(element);
              break;
            case 'string':
              if (item.hasOwnProperty('initial') &&
                  item['initial'].length === 1 &&
                  item['initial'][0].hasOwnProperty('valueString')) {
                element['defaultValue'] = item['initial'][0]['valueString'];
              }

              element['type'] = 'text';
              elements.push(element);
              break;
            case 'boolean':
              if (item.hasOwnProperty('initial') &&
                  item['initial'].length === 1 &&
                  item['initial'][0].hasOwnProperty('valueBoolean')) {
                element['defaultValue'] = item['initial'][0]['valueBoolean'];
              }

              element['type'] = 'boolean';
              elements.push(element);
              break;
            case 'text':
              if (item.hasOwnProperty('initial') &&
                  item['initial'].length === 1 &&
                  item['initial'][0].hasOwnProperty('valueString')) {
                element['defaultValue'] = item['initial'][0]['valueString'];
              }

              element['type'] = 'comment';
              elements.push(element);
              break;
            case 'attachment':
              element['type'] = 'file';
              // Required, but no clear place to store this in FHIR.
              element['maxSize'] = 0;
              elements.push(element);
              break;
            case 'open-choice':
              element['hasOther'] = true;
            case 'choice':
              element['type'] = 'dropdown';
              let defaultValue = null;
              const choices = [];

              if (item.hasOwnProperty('answerOption')) {
                item['answerOption'].forEach((option, optionIndex) => {
                  const choice = {};

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
                    if (option.hasOwnProperty('initialSelected')) {
                      if (option['initialSelected']) {
                        defaultValue = choice['value'];
                      }
                    }
                    choices.push(choice);
                  } else {
                    console.warn(
                        'Questionnaire dropdowns had invalid options.');
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
              console.warn('Skipping unsupported questionnaire item type: ' +
                           item['type']);
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
    throw new Error('FHIR version not implemented: ' + fhirVersion);
  }
}

/**
 * Convert a FHIR Questionnaire to a SurveyJS Questionnaire
 *
 * @param {json} questionnaire JSON representing a FHIR
 *     Questionnaire.
 * @param {string} fhirVersion The FHIR version of the questionnaie.
 *
 * @return {json} JSON representing an equivalent SurveyJS Questionnaire.
 */
function fromQuestionnaire(questionnaire, fhirVersion) {
  pages = [];

  pages = unpackItemsRecursive(questionnaire, fhirVersion);

  return {
    'pages': pages,
  };
}

/**
 * Recursively check a FHIR Questionnaire for slots that would match
 * a SurveyJS JSON Response, and create a corresponding FHIR
 * QuestionnaireResponse.
 *
 * @param {json} questionnaire JSON representing a FHIR
 *     Questionnaire being filled out, or a child item.
 * @param {json} surveyResponse JSON representing a SurveyJS response.
 * @param {string} fhirVersion The FHIR version of the questionnaie.
 *
 * @return {json} a FHIR QuestionnaireResponse or child item corresponding
 *     to the questionnaire argument filled out with the surveyResponse
 *     argument data.
 */
function packSurveyResponse(questionnaire, surveyResponse, fhirVersion) {
  if (fhirVersion === 'R4') {
    // We will traverse the questionnaire's items, matching them to a survey
    // response as possible.
    const items = [];

    // The response item's structure largely mimics that of the questionnaire
    // itself.  Thus, we will copy it and add the answers whenever applicable.
    if (questionnaire.hasOwnProperty('item')) {
      questionnaire['item'].forEach((item, itemIndex) => {
        const currentItem = {};

        if (item.hasOwnProperty('linkId')) {
          currentItem['linkId'] = item['linkId'];

          // Check the survey response for this linkId.
          if (surveyResponse.hasOwnProperty(item['linkId']) &&
              item.hasOwnProperty('type')) {
            switch (item['type']) {
              case 'decimal':
                currentItem['answer'] = [
                  {'valueDecimal': surveyResponse[item['linkId']]}];
                break;
              case 'date':
                currentItem['answer'] = [
                  {'valueDate': surveyResponse[item['linkId']]}];
                break;
              case 'dateTime':
                currentItem['answer'] = [
                  {'valueDateTime': surveyResponse[item['linkId']]}];
                break;
              case 'time':
                currentItem['answer'] = [
                  {'valueTime': surveyResponse[item['linkId']]}];
                break;
              case 'url':
                currentItem['answer'] = [
                  {'valueUri': surveyResponse[item['linkId']]}];
                break;
              case 'string':
                currentItem['answer'] = [
                  {'valueString': surveyResponse[item['linkId']]}];
                break;
              case 'boolean':
                currentItem['answer'] = [
                  {'valueBoolean': surveyResponse[item['linkId']]}];
                break;
              case 'text':
                currentItem['answer'] = [
                  {'valueString': surveyResponse[item['linkId']]}];
                break;
              case 'attachment':
                currentItem['answer'] = [];

                surveyResponse[item['linkId']].forEach(
                    (surveyAttachment, surveyAttachmentIndex) => {
                      const attachment = {};

                      if (surveyAttachment.hasOwnProperty('type')) {
                        attachment['contentType'] = surveyAttachment['type'];
                      }

                      if (surveyAttachment.hasOwnProperty('name')) {
                        attachment['title'] = surveyAttachment['name'];
                      }

                      if (surveyAttachment.hasOwnProperty('content')) {
                        // SurveyJS includes a prefix.
                        // We should take everything after the comma.
                        const commaPosition = (
                          surveyAttachment['content'].indexOf(','));
                        attachment['data'] = (
                          surveyAttachment['content'].substring(
                              commaPosition + 1));
                      }

                      currentItem['answer'].push(
                          {'valueAttachment': attachment});
                    });
                break;
              case 'choice':
                currentItem['answer'] = [
                  {'valueString': surveyResponse[item['linkId']]}];
                break;
              case 'open-choice':
                currentItem['answer'] = [
                  {'valueString': surveyResponse[item['linkId']]}];

                if (surveyResponse
                    .hasOwnProperty(item['linkId'] + '-Comment')) {
                  currentItem['answer'].push(
                      {'valueString':
                           surveyResponse[item['linkId'] + '-Comment']});
                }
                break;
              default:
                console.warn('Skipping unsupported questionnaire item type: ' +
                    item['type']);
                break;
            }
          }
        }

        if (item.hasOwnProperty('definition')) {
          currentItem['definition'] = item['definition'];
        }

        if (item.hasOwnProperty('text')) {
          currentItem['text'] = item['text'];
        }

        if (item.hasOwnProperty('item')) {
          currentItem['item'] = (
            packSurveyResponse(item, surveyResponse, fhirVersion));
        }

        items.push(currentItem);
      });
    }

    return items;
  } else {
    throw new Error('FHIR version not implemented: ' + fhirVersion);
  }
}

/**
 * Convert a SurveyJS JSON response to a FHIR QuestionnaireResponse.
 *
 * @param {json} questionnaire JSON representing a FHIR
 *     Questionnaire
 * @param {json} surveyResponse A SurveyJS JSON response
 * @param {string} fhirVersion The FHIR version of the questionnaireResponse.
 *
 * @return {json} The FHIR QuestionnaireResponse equivalent of the
 *     surveyResponse.
 */
function toQuestionnaireResponse(questionnaire, surveyResponse, fhirVersion) {
  if (fhirVersion === 'R4') {
    // We will traverse the questionnaire's items,
    // matching them to a survey response as possible.
    const questionnaireResponseJson = {
      'resourceType': 'QuestionnaireResponse',
      'status': 'completed',
    };

    // The response item's structure largely mimics that of the questionnaire
    // itself.  Thus, we will copy it and add the answers whenever applicable.
    questionnaireResponseJson['item'] = packSurveyResponse(
        questionnaire,
        surveyResponse,
        fhirVersion);

    return questionnaireResponseJson;
  } else {
    throw new Error('FHIR version not implemented: ' + fhirVersion);
  }
}

/**
 * Recursively check the items in a FHIR QuestionnaireResponse for survey
 * answers, then unpack them into a SurveyJS-style JSON survey response.
 *
 * @param {json} questionnaireResponse JSON representing a FHIR
 *     QuestionnaireResponse or one of its child items.
 * @param {string} fhirVersion The FHIR version of the questionnaireResponse.
 * @param {json} currentResult The unpacked result so far.
 *
 * @return {json} currentResult augmented with the survey response data
 *     from the questionnaireResponse argument.
 */
function unpackSurveyResponse(
    questionnaireResponse,
    fhirVersion,
    currentResult) {
  if (fhirVersion === 'R4') {
    let newResult = currentResult;

    if (questionnaireResponse.hasOwnProperty('item')) {
      questionnaireResponse['item'].forEach((item, itemIndex) => {
        if (item.hasOwnProperty('item')) {
          newResult = unpackSurveyResponse(item, fhirVersion, newResult);
        }

        // Even without the questionnaire, we can largely infer the format
        // of the result.  We will make a best-effort attempt to reconstitute
        // it under the assumption that the answers match the prescription
        // above.  This may not always be feasible and may eventually
        // need the format of the base questionnaire.
        if (item.hasOwnProperty('linkId') && item.hasOwnProperty('answer')) {
          if ((item['answer'].length === 1) &&
              (item['answer'][0].hasOwnProperty('valueBoolean'))) {
            newResult[item['linkId']] = item['answer'][0]['valueBoolean'];
          }

          if ((item['answer'].length === 1) &&
              (item['answer'][0].hasOwnProperty('valueDecimal'))) {
            newResult[item['linkId']] = item['answer'][0]['valueDecimal'];
          }

          if ((item['answer'].length === 1) &&
              (item['answer'][0].hasOwnProperty('valueInteger'))) {
            newResult[item['linkId']] = item['answer'][0]['valueInteger'];
          }

          if ((item['answer'].length === 1) &&
              (item['answer'][0].hasOwnProperty('valueDate'))) {
            newResult[item['linkId']] = item['answer'][0]['valueDate'];
          }

          if ((item['answer'].length === 1) &&
              (item['answer'][0].hasOwnProperty('valueDateTime'))) {
            newResult[item['linkId']] = item['answer'][0]['valueDateTime'];
          }

          if ((item['answer'].length === 1) &&
              (item['answer'][0].hasOwnProperty('valueTime'))) {
            newResult[item['linkId']] = item['answer'][0]['valueTime'];
          }

          if ((item['answer'].length === 1) &&
              (item['answer'][0].hasOwnProperty('valueString'))) {
            newResult[item['linkId']] = item['answer'][0]['valueString'];
          }

          if ((item['answer'].length === 1) &&
              (item['answer'][0].hasOwnProperty('valueUri'))) {
            newResult[item['linkId']] = item['answer'][0]['valueUri'];
          }

          if ((item['answer'].length === 1) &&
              (item['answer'][0].hasOwnProperty('valueCoding'))) {
            if (item['answer'][0]['valueCoding'].hasOwnProperty('code')) {
              newResult[item['linkId']] = (
                item['answer'][0]['valueCoding']['code']);
            } else if (
              item['answer'][0]['valueCoding'].hasOwnProperty('display')) {
              newResult[item['linkId']] = (
                item['answer'][0]['valueCoding']['display']);
            }
          }

          if ((item['answer'].length === 1) &&
              (item['answer'][0].hasOwnProperty('valueQuantity'))) {
            if (item['answer'][0]['valueQuantity'].hasOwnProperty('value')) {
              newResult[item['linkId']] = (
                item['answer'][0]['valueQuantity']['value']);
              if (item['answer'][0]['valueQuantity'].hasOwnProperty('unit')) {
                newResult[item['linkId']] += (
                  item['answer'][0]['valueQuantity']['unit']);
              }
            }
          }

          // Special case:  One or more file attachments.
          if ((item['answer'].length >= 1) &&
              (item['answer'][0].hasOwnProperty('valueAttachment'))) {
            newResult[item['linkId']] = [];
            item['answer'].forEach((attachment, attachmentIndex) => {
              if (attachment.hasOwnProperty('valueAttachment')) {
                const currentAttachment = {};

                if (attachment['valueAttachment'].hasOwnProperty('title')) {
                  currentAttachment['name'] = (
                    attachment['valueAttachment']['title']);
                }

                if (attachment['valueAttachment']
                    .hasOwnProperty('contentType')) {
                  currentAttachment['type'] = (
                    attachment['valueAttachment']['contentType']);

                  if (attachment['valueAttachment'].hasOwnProperty('data')) {
                    currentAttachment['content'] = (
                      'data:' + attachment['valueAttachment']['contentType'] +
                      ';base64,' + attachment['valueAttachment']['data']);
                  } else {
                    currentAttachment['content'] = (
                      'base64,' + attachment['valueAttachment']['data']);
                  }
                }

                newResult[item['linkId']].push(currentAttachment);
              }
            });
          }

          // Special case:  Two strings.
          if ((item['answer'].length === 2) &&
              (item['answer'][0].hasOwnProperty('valueString')) &&
              (item['answer'][1].hasOwnProperty('valueString'))) {
            newResult[item['linkId']] = item['answer'][0]['valueString'];
            newResult[item['linkId'] + '-Comment'] = (
              item['answer'][1]['valueString']);
          }
        }
      });
    }
    return newResult;
  } else {
    throw new Error('FHIR version not implemented: ' + fhirVersion);
  }
}

/**
 * Convert a FHIR QuestionnaireResponse to SurveyJS JSON.
 *
 * @param {json} questionnaireResponse JSON representing a FHIR
 *     QuestionnaireResponse
 * @param {string} fhirVersion The FHIR version of the questionnaireResponse.
 *
 * @return {json} The SurveyJS JSON equivalent of the questionnaireResponse
 */
function fromQuestionnaireResponse(questionnaireResponse, fhirVersion) {
  if (fhirVersion === 'R4') {
    return unpackSurveyResponse(questionnaireResponse, fhirVersion, {});
  } else {

  }
}

module.exports = {
  toQuestionnaire: toQuestionnaire,
  fromQuestionnaire: fromQuestionnaire,
  toQuestionnaireResponse: toQuestionnaireResponse,
  fromQuestionnaireResponse: fromQuestionnaireResponse,
};
