const process = require('process');

const Project = require('../libs/project');
Project.create().then(project => {
  console.log(`Project ${project.id} created.`);
  process.exit(0);
}).catch(err => {
  console.log(err);
  process.exit(1);
});
