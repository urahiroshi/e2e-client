import path from 'path';
import test from 'ava';
import UsecaseLoader from '../libs/usecase-loader';

test('load single usecase by UsecaseLoader', t => {
  const usecaseLoader = new UsecaseLoader({
    usecasesRoot: path.resolve('test/usecase-loader/usecases/hoge/search1.yml'),
    partialsRoot: path.resolve('test/usecase-loader/partials'),
    paramsRoot: path.resolve('test/usecase-loader/parameters')
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
  }, usecaseLoader.toObj());
});

test('load usecases directory by UsecaseLoader', t => {
  const usecaseLoader = new UsecaseLoader({
    usecasesRoot: path.resolve('test/usecase-loader/usecases'),
    partialsRoot: path.resolve('test/usecase-loader/partials'),
    paramsRoot: path.resolve('test/usecase-loader/parameters')
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
  ], usecaseLoader.toObj());
});
