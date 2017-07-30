const process = require('process');
const parseArgs = require('minimist');
const httpClient = new (require('./libs/http-client'))();
const UsecaseLoader = require('./libs/usecase-loader');
const Config = require('./config');
const Project = require('./libs/project');
const IterationTracker = require('./libs/iteration-tracker');
const Trial = require('./libs/trial');

async function callProject(projectId, trials) {
  try {
    const iteration = await httpClient.request({
      uri: `${Config.baseUri}/projects/${projectId}/iterations`,
      method: 'POST',
      body: { trials }
    });
    console.log(
      `/projects/${projectId}/iterations/${iteration.iterationNumber} Created.`
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

async function callTrial(trial) {
  try {
    const res = await httpClient.request({
      uri: `${Config.baseUri}/trials`,
      method: 'POST',
      body: trial
    });
    const trialId = res.id;
    console.log(`/trials/${trialId} Created.`);
    await Trial.trackUntilEnd(trialId);
    process.exit(0);
  } catch (ex) {
    console.log(ex);
    process.exit(1);
  }
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
  const projectId = Project.get().id;
  if (usecasesRoot === 'usecases') {
    console.log(`call project: ${projectId}`);
    console.log(usecaseLoader.toYaml());
    return callProject(projectId, usecaseLoader.toObj());
  } else {
    console.log('call trial');
    console.log(usecaseLoader.toYaml());
    return callTrial(usecaseLoader.toObj());
  }
};

main();
