const Config = require('../config');
const httpClient = new (require('./http-client'))();

class Iteration {
  constructor(projectId, iterationNumber) {
    this._projectId = projectId;
    this._iterationNumber = iterationNumber;
    // { [trialId]: trial }
    this.trials = {};
  }

  get projectId() {
    return this._projectId;
  }

  get iterationNumber() {
    return this._iterationNumber;
  }

  /**
   * Fetch Iteration API and update properties, return updated trials.
   */
  async update() {
    const iteration = await Iteration.fetch(this._projectId, this._iterationNumber);
    const updatedTrials = iteration.trials.reduce((previous, trial) => {
      if (
        this.trials[trial.id] == undefined ||
        this.trials[trial.id].updatedAt !== trial.updatedAt ||
        this.trials[trial.id].state !== trial.state
      ) {
        this.trials[trial.id] = trial;
        return previous.concat(trial);
      }
      return previous;
    }, []);
    return updatedTrials;
  }

  /**
   * Fetch Iteration API
   */
  static fetch(projectId, iterationNumber) {
    return httpClient.request({
      uri: `${Config.baseUri}/projects/${projectId}/iterations/${iterationNumber}`
    });
  }
}

module.exports = Iteration;
