import test from 'ava';
import Template from '../libs/template';

test('partial', t => {
  const template = new Template('    {{> hoge(abc, def) }}');
  const dependencies = template.findDependencies();
  const d = dependencies[0];
  t.is(d.partial, 'hoge');
  t.is(d.indent, 4);
  t.deepEqual(d.params, {1: 'abc', 2: 'def'});
  t.is(/^hoge\.[0-9a-f]{16}\.\d+$/.test(d.id), true);
});
