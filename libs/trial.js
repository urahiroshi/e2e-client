const Config = require('../config');
const httpClient = new (require('./http-client'))();

class Trial {
  static async trackUntilEnd(trialId) {
    let currentResults = [];
    let updatedAt;
    while (true) {
      await Trial.waitInterval();
      let trial = await Trial.fetch(trialId);
      if (updatedAt === trial.updatedAt) {
        continue;
      }
      let results = await Trial.fetchResults(trialId);
      let updatedResults = Trial.updatedResults(currentResults, results);
      Trial.showUpdatedResults(trial, updatedResults);
      currentResults = results;
      if (trial.state === 'completed' || trial.state === 'failed') {
        Trial.showFinishedTrial(trial);
        break;
      }
    }
  }

  static waitInterval() {
    return new Promise(resolve => setTimeout(resolve, Config.trackInterval));
  }

  /**
   * Fetch Trial API
   */
  static fetch(trialId) {
    return httpClient.request({ uri: `${Config.baseUri}/trials/${trialId}` });
  }

  /**
   * Fetch Results API
   */
  static fetchResults(trialId) {
    return httpClient.request({
      uri: `${Config.baseUri}/results?trialId=${trialId}`
    });
  }

  /**
   * Compare results, return updated results (no updated results, it returns `[]`)
   */
  static updatedResults(current, next) {
    if (next.length === current.length) { return []; }
    const addResults = next.slice(current.length);
    return addResults.map((result, i) => {
      result.index = i + current.length;
      return result;
    });
  }

  /**
   * Show updatedResults infomations
   */
  static showUpdatedResults(trial, updatedResults) {
    if (updatedResults.length === 0) { return; }
    updatedResults.forEach(result => {
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

  static showFinishedTrial(trial) {
    console.log(`${trial.updatedAt} [${trial.id}] ${trial.state}`);
  }
}

module.exports = Trial;
