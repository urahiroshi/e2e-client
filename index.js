const process = require('process');
const parseArgs = require('minimist');
const httpClient = new (require('./libs/http-client'))();
const YamlLoader = require('./libs/yaml-loader');
const Config = require('./config');
const Project = require('./libs/project');

async function callProject(projectId, trials) {
  try {
    await httpClient.request({
      uri: `${Config.baseUri}/projects/${projectId}/iterations`,
      method: 'POST',
      body: { trials }
    });
    process.exit(0);
  } catch (ex) {
    console.log(ex);
    process.exit(1);
  }
};

const callTrial = function (trial) {
  return httpClient.request({
    uri: `${Config.baseUri}/trials`,
    method: 'POST',
    body: trial
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
    usecasesRoot, partialsRoot, paramsRoot, paramsStr
  });

  if (usecasesRoot === 'usecases') {
    console.log(`call project: ${Project.projectId}`);
    return callProject(Project.projectId, yamlLoader.toObj());
  } else {
    console.log('call trial');
    return callTrial(yamlLoader.toObj());
  }
};

main();
