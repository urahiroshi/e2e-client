const Config = require('../config');
const Iteration = require('./iteration');
const Trial = require('./trial');

class IterationTracker {
  constructor(projectId, iterationNumber, trials) {
    this._iteration = new Iteration(projectId, iterationNumber);
    this._trialsMap = {};
    trials.forEach(trial => {
      trial.results = [];
      this._trialsMap[trial.id] = trial;
    });
    this._finishedTrialIds = [];
  }

  /**
   * fetch iteration with regularity,
   * show results of trials until end the iteration.  
   */
  async trackUntilEnd() {
    while(this._finishedTrialIds.length < Object.keys(this._trialsMap).length) {
      await this._waitInterval();
      let updatedTrials = await this._iteration.update();
      for (let trial of updatedTrials) {
        const results = await Trial.fetchResults(trial.id);
        const updatedResults = Trial.updatedResults(
          this._trialsMap[trial.id].results, results
        );
        this._showUpdatedResults(this._trialsMap[trial.id], updatedResults);
        if (trial.state === 'completed' || trial.state === 'failed') {
          this._finishedTrialIds.push(trial.id);
          this._showFinishedTrial(trial);
        }
      }
    }
    this._finish();
  }

  _waitInterval() {
    return new Promise(resolve => setTimeout(resolve, Config.trackInterval));
  }

  _showUpdatedResults(trial, results) {
    if (results.length === 0) { return; }
    results.forEach(result => {
      const header = `${result.createdAt} [${trial.id}:${result.index}]`;
      const action = trial.usecase.actions[result.index];
      const actionParams = [action.type];
      if (action.selectors) { actionParams.push(JSON.stringify(action.selectors)); }
      if (action.value) { actionParams.push(action.value); }
      let actionResult = (result.text || result.html || result.uri);
      actionResult = actionResult ? `\n=> ${actionResult}` : '';
      console.log(`${header} ${actionParams.join(' ')}${actionResult}`);
    });
  }

  _showFinishedTrial(trial) {
    console.log(`${trial.updatedAt} [${trial.id}] ${trial.state}`);
  }

  get _iterationLabel() {
    return (
      `/projects/${this._iteration.projectId}` +
      `/iterations/${this._iteration.iterationNumber}`
    );
  }

  _finish() {
    console.log(`${this._iterationLabel} Finished.`);
  }
}

module.exports = IterationTracker;
