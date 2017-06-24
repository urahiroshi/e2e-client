import path from 'path';
import test from 'ava';
import YamlLoader from '../libs/yaml-loader';

test('YamlLoader', t => {
  const yamlLoader = new YamlLoader({
    usecasesRoot: path.resolve('test/yaml-loader/usecases/hoge/search1.yml'),
    partialsRoot: path.resolve('test/yaml-loader/partials'),
    parametersRoot: path.resolve('test/yaml-loader/parameters')
  });
  t.deepEqual({
    url: 'http://yahoo.com',
    actions: [
      {
        selectors: ['form[action*="/search"] [name=p]'],
        type: 'input',
        value: 'fuga'
      }, {
        selectors: ['form[action*="/search"] [type=submit]'],
        type: 'click'
      }, {
        selectors: ['.title'],
        type: 'getHtml'
      }, {
        selectors: ['.title'],
        type: 'getText'
      }
    ]
  }, yamlLoader.toObj());
});
