const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const Template = require('./template');

class YamlLoader {
  constructor({
      usecasesRoot,
      partialsRoot,
      paramsRoot,
      paramsStr
    }) {
    this._usecasesRoot = path.resolve(usecasesRoot);
    let params = null;
    if (paramsStr && paramsStr.length > 0) {
      params = yaml.safeLoad(paramsStr);
    }
    if (partialsRoot && partialsRoot.length > 0) {
      this._partialsRoot = path.resolve(partialsRoot);
    }
    this._rawPartials = {};
    this._partials = {};
    this._parameters = {};
    this.trials = [];
    if (paramsRoot && paramsRoot.length > 0) {
      const absParametersRoot = path.resolve(paramsRoot);
      this.walk(absParametersRoot, this.assignParameterFile.bind(this));
    }
    if (typeof params === 'object' && !Array.isArray(params)) {
      Object.assign(this._parameters, params);
    }
    if (fs.statSync(this._usecasesRoot).isDirectory()) {
      this.walk(this._usecasesRoot, this.pushUsecaseFile.bind(this));
    } else {
      this.pushUsecaseFile(this._usecasesRoot, { containsPath: false });
    }
  }

  getTemplate(partialPath) {
    const template = new Template(fs.readFileSync(partialPath, { encoding: 'utf-8' }));
    const dependencies = template.findDependencies();
    dependencies.forEach((dependency) => {
      const partialKey = dependency.partial;
      if (!this._rawPartials[partialKey]) {
        const partialTemplate = this.getTemplate(
          `${this._partialsRoot}/${partialKey}.yml`
        );
        this._rawPartials[partialKey] = partialTemplate.template;
      }
      this._partials[dependency.id] = Template.renderPartial(
        this._rawPartials[partialKey],
        {
          indent: dependency.indent,
          params: Object.assign({}, this._parameters, dependency.params),
          // TODO: this is too redundant...
          partials: this._partials
        }
      );
    });
    return template;
  }

  walk(directory, onYaml) {
    const filePathes = fs.readdirSync(directory).map(
      (fileName) => { return path.join(directory, fileName); }
    );
    filePathes.forEach((filePath) => {
      if (fs.statSync(filePath).isDirectory()) {
        this.walk(filePath, onYaml);
      } else if (YamlLoader.isYaml(filePath)) {
        onYaml(filePath);
      }
    });
  }

  toObj() {
    if (this.trials.length === 1) {
      return this.trials[0];
    }
    return this.trials;
  }

  assignParameterFile(paramFilePath) {
    const paramsYaml = fs.readFileSync(paramFilePath, { encoding: 'utf-8' });
    const params = yaml.safeLoad(paramsYaml);
    YamlLoader.assignParameters(this._parameters, params);
  }

  pushUsecaseFile(absPath, options) {
    const containsPath = options && options.containsPath;
    const template = this.getTemplate(absPath);
    const usecaseYaml = template.render(this._parameters, this._partials);
    const trial = { usecase: yaml.safeLoad(usecaseYaml) };
    if (containsPath !== false) {
      const extLen = path.extname(absPath).length;
      const rootLen = this._usecasesRoot.length;
      const absPathLen = absPath.length;
      let usecasePath = absPath.slice(rootLen, absPathLen - extLen);
      if (usecasePath[0] === '/') {
        usecasePath = usecasePath.slice(1);
      }
      trial.usecasePath = usecasePath;
    }
    this.trials.push(trial);
  }

  static assignParameters(parentObj, params) {
    Object.keys(params).forEach((paramKey) => {
      if (Array.isArray(params[paramKey])) {
        parentObj[paramKey] = JSON.stringify(params[paramKey]);
      } else if (typeof params[paramKey] === 'object') {
        parentObj[paramKey] = {};
        YamlLoader.assignParameters(parentObj[paramKey], params[paramKey]);
      } else {
        parentObj[paramKey] = params[paramKey];
      }
    });
  }

  // (ex)
  // toRelativePath('/usecases/hoge/sample1.yml', '/usecases') === 'hoge/sample'
  static toRelativePath(basePath, filePath) {
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
