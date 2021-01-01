const sampleSurveyjs1 = {
  'pages': [
    {
      'name': 'single-inputs-page',
      'elements': [
        {
          'type': 'text',
          'name': 'single-input-text',
          'title': 'Single Input Text',
          'defaultValue': 'default',
        },
        {
          'type': 'text',
          'name': 'single-input-date',
          'title': 'Single Input Date',
          'defaultValue': '1982-11-22',
          'inputType': 'date',
        },
        {
          'type': 'text',
          'name': 'single-input-datetime',
          'title': 'Single Input Datetime',
          'defaultValue': '11/22/1982 12:00:00',
          'inputType': 'datetime',
        },
        {
          'type': 'text',
          'name': 'single-input-time',
          'title': 'Single Input Time',
          'defaultValue': '11:22',
          'inputType': 'time',
        },
        {
          'type': 'text',
          'name': 'single-input-number',
          'title': 'Single Input Number',
          'defaultValue': 11.22,
          'inputType': 'number',
        },
        {
          'type': 'text',
          'name': 'single-input-url',
          'title': 'Single Input URL',
          'defaultValue': 'http://www.github.com',
          'inputType': 'url',
        },
      ],
      'title': 'Single Inputs Page',
    },
    {
      'name': 'special-inputs-page',
      'elements': [
        {
          'type': 'comment',
          'name': 'comment',
          'title': 'Read Only Comment',
          'defaultValue': 'Lorem Ipsum Et Cetera',
          'readOnly': true,
        },
        {
          'type': 'boolean',
          'name': 'Required Boolean',
          'defaultValue': 'true',
          'isRequired': true,
        },
        {
          'type': 'file',
          'name': 'file-uploader',
          'title': 'File Attachment',
          'maxSize': 0,
        },
      ],
      'title': 'Special Inputs Page',
    },
    {
      'name': 'dropdowns-page',
      'elements': [
        {
          'type': 'dropdown',
          'name': 'dropdown-no-other',
          'title': 'Dropdown No Other',
          'defaultValue': 'item3',
          'choices': [
            {
              'value': 'item1',
              'text': '1',
            },
            {
              'value': 'item2',
              'text': '2',
            },
            {
              'value': 'item3',
              'text': '3',
            },
          ],
        },
        {
          'type': 'dropdown',
          'name': 'dropdown-with-other',
          'title': 'Dropdown With Other',
          'choices': [
            {
              'value': 'item1',
              'text': '1',
            },
            {
              'value': 'item2',
              'text': '2',
            },
            {
              'value': 'item3',
              'text': '3',
            },
          ],
          'hasOther': true,
        },
      ],
      'title': 'Dropdowns Page',
    },
  ],
};

const sampleSurveyjs1Response = {
  'single-input-text': 'abc',
  'single-input-date': '2003-01-02',
  'single-input-datetime': '01/02/03 04:05:06',
  'single-input-time': '07:08',
  'single-input-number': 123,
  'single-input-url': 'http://www.google.com',
  'comment': 'Lorem Ipsum Et Cetera',
  'Required Boolean': false,
  'file-uploader': [
    {
      'name': 'test_file.txt',
      'type': 'text/plain',
      'content': 'data:text/plain;base64,dGVzdF9maWxlCg==',
    },
  ],
  'dropdown-no-other': 'item1',
  'dropdown-with-other': 'other',
  'dropdown-with-other-Comment': 'Other Selected!',
};

module.exports = {
  sampleSurveyjs1: sampleSurveyjs1,
  sampleSurveyjs1Response: sampleSurveyjs1Response,
};
