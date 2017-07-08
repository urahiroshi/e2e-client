import path from 'path';
import test from 'ava';
import YamlLoader from '../libs/yaml-loader';

test('load single usecase by YamlLoader', t => {
  const yamlLoader = new YamlLoader({
    usecasesRoot: path.resolve('test/yaml-loader/usecases/hoge/search1.yml'),
    partialsRoot: path.resolve('test/yaml-loader/partials'),
    paramsRoot: path.resolve('test/yaml-loader/parameters')
  });
  t.deepEqual({
    usecase: {
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
    }
  }, yamlLoader.toObj());
});

test('load usecases directory by YamlLoader', t => {
  const yamlLoader = new YamlLoader({
    usecasesRoot: path.resolve('test/yaml-loader/usecases'),
    partialsRoot: path.resolve('test/yaml-loader/partials'),
    paramsRoot: path.resolve('test/yaml-loader/parameters')
  });
  t.deepEqual([
    {
      usecasePath: 'hoge/search1',
      usecase: {
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
      }
    }, {
      usecasePath: 'hoge/search2',
      usecase: {
        url: 'http://yahoo.com',
        actions: [
          {
            selectors: ['form[action*="/search"] [name=p]'],
            type: 'input',
            value: 'hoge'
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
      }
    }
  ], yamlLoader.toObj());
});
