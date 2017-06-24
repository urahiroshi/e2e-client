const Mustache = require('mustache');
const crypto = require('crypto');
const yaml = require('js-yaml');

class Template {
  constructor(template) {
    this.raw = template;
    this.template = null;
    this.id = crypto.randomBytes(8).toString('hex');
  }

  findDependencies() {
    const dependencies = [];
    const templateLines = [];
    const lines = this.raw.replace(/\r\n/g, '\n').split('\n');
    lines.forEach((line) => {
      const parsedArray = Mustache.parse(line);
      const dependency = Template.findDependency(parsedArray);
      let replacedLine = line;
      if (dependency) {
        dependency.id = `${dependency.partial}.${this.id}.${dependencies.length}`;
        dependencies.push(dependency);
        replacedLine = line.replace(dependency.raw, dependency.id);
      } else {
        // replace {{ }} to {{{ }}} not to use HTML escape
        let diff = 0;
        parsedArray.forEach(parsed => {
          if (parsed[0] === 'name') {
            const escapedParam = `{{{ ${parsed[1]} }}}`;
            replacedLine = (
              replacedLine.slice(0, parsed[2] + diff) +
              escapedParam +
              replacedLine.slice(parsed[3] + diff)
            );
            diff = escapedParam.length - (parsed[3] - parsed[2]);
          }
        });
      }
      templateLines.push(replacedLine);
    });
    this.template = templateLines.join('\n');
    return dependencies;
  }

  render(view, partials) {
    if (!this.template) {
      this.findDependencies();
    }
    return Mustache.render(this.template, view, partials);
  }

  static findDependency(parsedArray) {
    let found = false;
    let result = null;
    parsedArray.forEach((parsed) => {
      if (parsed[0] === '>') {
        let m = /\((.+?)\) *$/.exec(parsed[1]);
        const paramsStr = m ? m[1] : null;
        const partial = paramsStr ? parsed[1].replace(`(${paramsStr})`, '') : parsed[1];
        if (found) { throw new Error('only one partial on one line'); }
        result = {
          partial,
          indent: parsed[2],
          params: Template.getParameters(paramsStr),
          raw: parsed[1]
        };
        found = true;
      }
    });
    return result;
  }

  // example:
  //   getParameters('hoge, fuga') === {1: 'hoge', 2: 'fuga'}
  static getParameters(paramsStr) {
    return yaml.safeLoad(`[${paramsStr}]`).reduce((result, param, i) => {
      result[i + 1] = param;
      return result;
    }, {});
  }

  static renderPartial(partial, { indent, params, partials }) {
    const noIndentRes = Mustache.render(partial, params, partials);
    let indentSpaces = '';
    for (let i = 0; i < indent; i++) {
      indentSpaces += ' ';
    }
    // Current mustache don't keep indent on first line
    return noIndentRes.replace(/^/mg, indentSpaces).replace(/^ +$/mg, '');
  }
}

module.exports = Template;
