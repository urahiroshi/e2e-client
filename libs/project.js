const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const projectConfig = path.join(__dirname, '../project.yaml');
const projectString = fs.readFileSync(projectConfig, { encoding: 'utf-8' });
const project = yaml.safeLoad(projectString);

module.exports = project;
