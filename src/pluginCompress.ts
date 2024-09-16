import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Buffer } from 'node:buffer';
import * as zlib from 'node:zlib';

import * as zstd from '@mongodb-js/zstd';
import { OutputFile, Plugin, PluginBuild } from 'esbuild';

import { TypeCompressResult, TypeOptions } from './types.js';
import { pluginName } from './constants.js';
import { validateOptions } from './validators/validateOptions.js';
import { validateSetup } from './validators/validateSetup.js';
import { getCompressionLevel } from './utils.js';

const gzipCompress = async (file: OutputFile, level?: number): Promise<TypeCompressResult> => {
  const ext = '.gz';
  const compressOptions = { level };

  return new Promise((resolve, reject) => {
    zlib.gzip(file.contents, compressOptions, async (err, contents) => {
      /* c8 ignore next */
      if (err) reject(err);

      resolve({
        path: `${file.path}${ext}`,
        hash: file.hash,
        contents,
      });
    });
  });
};

const brotliCompress = async (file: OutputFile, level: number): Promise<TypeCompressResult> => {
  const ext = '.br';
  const compressOptions = {
    params: {
      [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
      [zlib.constants.BROTLI_PARAM_QUALITY]: level,
      [zlib.constants.BROTLI_PARAM_SIZE_HINT]: file.contents.length,
    },
  };

  return new Promise((resolve, reject) => {
    zlib.brotliCompress(file.contents, compressOptions, (err, contents) => {
      /* c8 ignore next */
      if (err) reject(err);

      resolve({
        path: `${file.path}${ext}`,
        hash: file.hash,
        contents,
      });
    });
  });
};

const zstdCompress = async (file: OutputFile, level?: number): Promise<TypeCompressResult> => {
  const ext = '.zst';
  const compressOptions = { level };

  const contents = await zstd.compress(Buffer.from(file.contents), compressOptions.level);

  return {
    path: `${file.path}${ext}`,
    hash: file.hash,
    contents,
  };
};

export const pluginCompress = (optionsRaw?: TypeOptions): Plugin => {
  const options = validateOptions(optionsRaw);

  const opts = {
    gzip: Boolean(options?.gzip),
    brotli: Boolean(options?.brotli),
    zstd: Boolean(options?.zstd),
    level: options?.level ?? 'max',
    extensions: options?.extensions ?? ['.js', '.css'],
  };

  return {
    name: pluginName,

    setup(buildRaw: PluginBuild) {
      const build = validateSetup(buildRaw);

      build.onEnd(async (result) => {
        /* c8 ignore next */
        if (!result.outputFiles) return;

        const tasks: Array<Promise<TypeCompressResult>> = [];
        const {
          gzip: gzipLevel,
          brotli: brotliLevel,
          zstd: zstdLevel,
        } = getCompressionLevel(opts.level);

        for (const file of result.outputFiles) {
          if (!opts.extensions.some((ext) => ext === path.extname(file.path))) continue;

          if (opts.gzip) {
            tasks.push(gzipCompress(file, gzipLevel));
          }

          if (opts.brotli) {
            tasks.push(brotliCompress(file, brotliLevel));
          }

          if (opts.zstd) {
            tasks.push(zstdCompress(file, zstdLevel));
          }
        }

        const files = await Promise.all(tasks);

        // write output files because write: false
        for (const outputFile of result.outputFiles) {
          // eslint-disable-next-line no-await-in-loop
          await fs.writeFile(outputFile.path, outputFile.contents);
        }

        for (const file of files) {
          // eslint-disable-next-line no-await-in-loop
          await fs.writeFile(file.path, file.contents);

          result.outputFiles.push({
            path: file.path,
            hash: file.hash,
            contents: new Uint8Array(file.contents),
            text: '',
          });
        }
      });
    },
  };
};
