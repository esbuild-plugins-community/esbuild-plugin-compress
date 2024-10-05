import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, it, after } from 'node:test';
import * as assert from 'node:assert/strict';

import { createDirectoryIfNotExists } from '../src/utils.js';

void describe('check utils methods', async () => {
  after(async () => {
    fs.rmSync(path.resolve('test/tmp'), { recursive: true, force: true });
  });

  await it('dont create directory if exists', async () => {
    const dir = path.resolve('test/res');
    const result = await createDirectoryIfNotExists(dir);
    assert.equal(result, false);
  });

  await it('create directory if not exists', async () => {
    const dir = path.resolve('test/tmp');
    const result = await createDirectoryIfNotExists(dir);
    assert.equal(result, true);
  });
});
