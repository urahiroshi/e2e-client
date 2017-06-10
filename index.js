const process = require('process');
const parseArgs = require('minimist');
const httpClient = new (require('./libs/http-client'))();
const YamlLoader = require('./libs/yaml-loader');
const Config = require('./config');
const Project = require('./libs/project');

const callProject = function (projectId) {
  const yamlLoader = new YamlLoader('usecases');
  return httpClient.request({
    uri: `${Config.baseUri}/projects/${projectId}/iterations`,
    method: 'POST',
    body: yamlLoader.toObj()
  })
  .then(() => {
    process.exit(0);
  });
};

const callTrial = function (path) {
  const yamlLoader = new YamlLoader(path);
  return httpClient.request({
    uri: `${Config.baseUri}/trials`,
    method: 'POST',
    body: yamlLoader.toObj()
  })
  .then(() => {
    process.exit(0);
  });
};

const main = function () {
  const argv = parseArgs(process.argv.slice(2));
  const path = argv._[0];
  if (path) {
    return callTrial(path);
  } else {
    return callProject(Project.projectId);
  }
};

main();
