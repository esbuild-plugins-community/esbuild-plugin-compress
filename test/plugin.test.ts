import * as fs from 'node:fs';
import * as path from 'node:path';
import * as assert from 'node:assert/strict';
import { describe, it, afterEach, before } from 'node:test';

import { build, BuildOptions } from 'esbuild';

import { pluginCompress } from '../src/index.js';

async function createDirectoryIfNotExists(dir: string) {
  try {
    await fs.promises.access(dir);
  } catch (error) {
    // @ts-ignore
    if (error.code === 'ENOENT') {
      await fs.promises.mkdir(dir, { recursive: true });
    }
  }
}

void describe('Plugin test', async () => {
  const getConfig = (plugins?: BuildOptions['plugins']): BuildOptions => ({
    entryPoints: [path.resolve('test/res/entry.ts')],
    bundle: true,
    format: 'iife',
    logLevel: 'silent',
    write: false,
    metafile: true,
    outdir: path.resolve('test/tmp'),
    target: 'node18',
    platform: 'node',
    packages: 'external',
    resolveExtensions: ['.ts'],
    plugins,
  });

  before(async () => {
    await createDirectoryIfNotExists(path.resolve('test/tmp'));
  });

  afterEach(async () => {
    const files = fs.readdirSync(path.resolve('test/tmp'));

    for (const file of files) {
      fs.unlinkSync(path.resolve('test/tmp', file));
    }
  });

  await it('valid compress js and css files', async () => {
    const result = await build(
      getConfig([
        pluginCompress({
          extensions: ['.js', '.css'],
          gzip: true,
          brotli: true,
          zstd: true,
          level: 'max',
        }),
      ])
    );

    const originalFiles = result.outputFiles!.filter((file) => {
      return !['.gz', '.br', '.zst'].includes(path.extname(file.path));
    });

    for (const file of originalFiles) {
      ['.gz', '.br', '.zst'].forEach((ext) => {
        assert.equal(
          result.outputFiles?.map((outputFile) => outputFile.path).includes(`${file.path}${ext}`),
          true
        );

        assert.equal(fs.existsSync(`${file.path}${ext}`), true);
      });

      assert.equal(fs.existsSync(file.path), true);
    }
  });

  await it('no compressing because svg files is not in the project', async () => {
    const result = await build(
      getConfig([
        pluginCompress({
          extensions: ['.svg'],
          gzip: true,
          brotli: true,
          zstd: true,
          level: 'low',
        }),
      ])
    );

    const originalFiles = result.outputFiles!.filter((file) => {
      return !['.gz', '.br', '.zst'].includes(path.extname(file.path));
    });

    for (const file of originalFiles) {
      ['.gz', '.br', '.zst'].forEach((ext) => {
        assert.equal(
          result.outputFiles?.map((outputFile) => outputFile.path).includes(`${file.path}${ext}`),
          false
        );
      });
    }
  });

  await it('write parameter must be "false" in esbuild config', async () => {
    try {
      await build({
        ...getConfig([
          pluginCompress({
            extensions: ['.js', '.css'],
            gzip: true,
            brotli: true,
            zstd: true,
            level: 'max',
          }),
        ]),
        write: true,
      });
    } catch (err) {
      assert.equal(
        (err as Error).message.includes(
          '@espcom/esbuild-plugin-compress: "write" parameter must be set to "false" in esbuild config'
        ),
        true
      );
    }
  });
});
