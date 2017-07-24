const process = require('process');
const parseArgs = require('minimist');
const httpClient = new (require('./libs/http-client'))();
const UsecaseLoader = require('./libs/usecase-loader');
const Config = require('./config');
const Project = require('./libs/project');
const IterationTracker = require('./libs/iteration-tracker');

async function callProject(projectId, trials) {
  try {
    const iteration = await httpClient.request({
      uri: `${Config.baseUri}/projects/${projectId}/iterations`,
      method: 'POST',
      body: { trials }
    });
    console.log(
      `/projects/${projectId}/iterations/${iteration.iterationNumber} created.`
    );
    const iterationTrials = iteration.trials;
    const iterationTracker = new IterationTracker(
      projectId, iteration.iterationNumber, iterationTrials
    );
    await iterationTracker.trackUntilEnd();
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
  const usecaseLoader = new UsecaseLoader({
    usecasesRoot, partialsRoot, paramsRoot, paramsStr
  });

  if (usecasesRoot === 'usecases') {
    console.log(`call project: ${Project.projectId}`);
    console.log(usecaseLoader.toYaml());
    return callProject(Project.projectId, usecaseLoader.toObj());
  } else {
    console.log('call trial');
    console.log(usecaseLoader.toYaml());
    return callTrial(usecaseLoader.toObj());
  }
};

main();
