const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const httpClient = new (require('./http-client'))();
const Config = require('../config');

const projectConfig = path.join(__dirname, '../project.yml');

class Project {
  static get() {
    const projectString = fs.readFileSync(projectConfig, { encoding: 'utf-8' });
    return yaml.safeLoad(projectString);
  }

  static async create() {
    if (fs.existsSync(projectConfig)) {
      throw new Error('Project already exists');
    }
    const project = await httpClient.request({
      uri: `${Config.baseUri}/projects`,
      method: 'POST',
      body: {}
    });
    const projectYaml = yaml.safeDump(project);
    fs.writeFileSync(projectConfig, projectYaml, { encoding: 'utf-8' });
    return project;
  }
}

module.exports = Project;
