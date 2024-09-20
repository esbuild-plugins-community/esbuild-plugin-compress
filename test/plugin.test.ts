import * as fs from 'node:fs';
import * as path from 'node:path';
import * as assert from 'node:assert/strict';
import { describe, it, afterEach, before, after } from 'node:test';

import { build, BuildOptions, context } from 'esbuild';

import { pluginCompress } from '../src/index.js';
import { createDirectoryIfNotExists, unlinkFile } from '../src/utils.js';

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
      // eslint-disable-next-line no-await-in-loop
      await unlinkFile(path.resolve('test/tmp', file));
    }
  });

  after(async () => {
    fs.rmSync(path.resolve('test/tmp'), { recursive: true, force: true });
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

  await it('works in rebuild mode', async () => {
    await fs.promises.copyFile(
      path.resolve('test/res/entry.ts'),
      path.resolve('test/tmp/entry.ts')
    );
    await fs.promises.copyFile(
      path.resolve('test/res/global.css'),
      path.resolve('test/tmp/global.css')
    );

    const ctx = await context({
      ...getConfig([
        pluginCompress({
          extensions: ['.js', '.css'],
          gzip: true,
          level: 'low',
        }),
      ]),
      entryPoints: [path.resolve('test/tmp/entry.ts')],
    });

    const results: Record<string, Date> = {};

    const { outputFiles: outputFilesBefore } = await ctx.rebuild();
    for (const outputFile of outputFilesBefore!) {
      // eslint-disable-next-line no-await-in-loop
      const { mtime } = await fs.promises.stat(outputFile.path);
      results[outputFile.path] = mtime;
    }

    await fs.promises.writeFile(
      path.resolve('test/tmp/entry.ts'),
      `import './global.css';`,
      'utf-8'
    );

    const { outputFiles: outputFilesAfter } = await ctx.rebuild();
    for (const outputFile of outputFilesAfter!) {
      // eslint-disable-next-line no-await-in-loop
      const { mtime } = await fs.promises.stat(outputFile.path);
      assert.notEqual(mtime, results[outputFile.path], path.basename(outputFile.path));
    }

    await ctx.dispose();
  });

  await it('check with dynamic folder', async () => {
    try {
      await build({
        ...getConfig([
          pluginCompress({
            extensions: ['.js'],
            zstd: true,
            level: 'low',
          }),
        ]),
        entryNames: '[ext]/[name]',
        assetNames: '[ext]/[name]',
      });
    } catch (err) {
      assert.equal((err as Error).message.includes('ENOENT'), false);
    }
  });
});
