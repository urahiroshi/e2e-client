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
        Trial.showUpdatedResults(this._trialsMap[trial.id], updatedResults);
        this._trialsMap[trial.id].results = results;
        if (trial.state === 'completed' || trial.state === 'failed') {
          this._finishedTrialIds.push(trial.id);
          Trial.showFinishedTrial(trial);
        }
      }
    }
    this._finish();
  }

  _waitInterval() {
    return new Promise(resolve => setTimeout(resolve, Config.trackInterval));
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
