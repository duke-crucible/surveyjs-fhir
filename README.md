# surveyjs-fhir
Node.js tools to convert SurveyJS JSON to FHIR JSON, and vice-versa.

## Installing

### From NPM

You can install this package using `npm` with
```
npm install surveyjs-fhir
```

You will also need to install one of the [SurveyJS](https://github.com/surveyjs/survey-library) packages survey-angular, survey-jquery, survey-knockout, survey-react or survey-vue.
For development and testing we use survey-angular, but in production you will clearly use the version appropriate for your framework of choice.

### From Source

First, clone the repo from GitHub:
```
git clone https://github.com/duke-crucible/surveyjs-fhir.git
```

Next, make sure you have the needed dependencies:
```
npm install
```

You can run unit tests with:
```
npm test
```

## Developing

You can run our linter to check your style using:
```
npx eslint src/*.mjs test/*.mjs
```

## Releasing

Releases are automatically run from the main branch.  
In order to release a new version, simply update the version in package.json before pulling into main.
The GitHub action will take care of the rest.

TODO:  [TheGOTOGuy](https://www.github.com/TheGOTOGuy) currently controls the repository, and the token is attached to his GitHub account.
We need to switch control of the repository to a duke-crucible user.
