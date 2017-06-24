const process = require('process');
const parseArgs = require('minimist');
const httpClient = new (require('./libs/http-client'))();
const YamlLoader = require('./libs/yaml-loader');
const Config = require('./config');
const Project = require('./libs/project');

const callProject = function (projectId, bodyObj) {
  return httpClient.request({
    uri: `${Config.baseUri}/projects/${projectId}/iterations`,
    method: 'POST',
    body: bodyObj
  })
  .then(() => {
    process.exit(0);
  });
};

const callTrial = function (bodyObj) {
  return httpClient.request({
    uri: `${Config.baseUri}/trials`,
    method: 'POST',
    body: bodyObj
  })
  .then(() => {
    process.exit(0);
  });
};

const main = function () {
  const argv = parseArgs(process.argv.slice(2));
  const usecasesRoot = argv._[0] || 'usecases';
  const paramsStr = argv.params || '';
  const partialsRoot = argv.partialsRoot || 'partials';
  const paramsRoot = argv.paramsRoot || 'parameters';
  const yamlLoader = new YamlLoader({
    usecasesRoot, partialsRoot, parameters, paramsStr
  });

  if (usecasesRoot === 'usecases') {
    return callTrial(yamlLoader.toObj);
  } else {
    return callProject(Project.projectId, yamlLoader.toObj);
  }
};

main();
