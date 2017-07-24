const Config = require('../config');
const httpClient = new (require('./http-client'))();

class Trial {
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
}

module.exports = Trial;
