import test from 'node:test';
import { strict as assert } from 'node:assert';
import { test as lib } from '../lib/index';

test('synchronous passing test', () => {
  const result = lib('World');
  assert.strictEqual(result, 'Hello World');
});
