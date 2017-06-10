const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

class YamlLoader {
  constructor(loadingPath) {
    const absPath = path.resolve(loadingPath);
    this.obj = {};
    if (fs.statSync(absPath).isDirectory()) {
      this.basePath = absPath;
      this.obj = { trials: [] };
      this.recursiveLoad(absPath);
    } else {
      Object.assign(
        this.obj,
        yaml.safeLoad(fs.readFileSync(absPath, { encoding: 'utf-8' }))
      );
    }
  }

  recursiveLoad(directory) {
    const filePathes = fs.readdirSync(directory).map(
      (fileName) => { return path.join(directory, fileName); }
    );
    filePathes.forEach((filePath) => {
      if (fs.statSync(filePath).isDirectory()) {
        this.recursiveLoad(filePath);
      } else if (YamlLoader.isYaml(filePath)) {
        const usecase = yaml.safeLoad(fs.readFileSync(filePath, { encoding: 'utf-8' }));
        this.obj.trials.push({
          usecase,
          usecasePath: YamlLoader.toUsecasePath(this.basePath, filePath)
        });
      }
    });
  }

  toObj() {
    return this.obj;
  }

  static toUsecasePath(basePath, filePath) {
    return (
      filePath
      .replace(this.basePath, '')
      .replace(new RegExp(path.extname(filePath) + '$'), '')
    );
  }

  static isYaml(filePath) {
    const extname = path.extname(filePath).toLowerCase();
    return (extname === '.yml' || extname === '.yaml');
  }
}

module.exports = YamlLoader;
