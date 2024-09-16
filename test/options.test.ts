import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';

import { pluginCompress } from '../src/index.js';

const nonObjects = [0, true, null, '', [], () => false];
const nonStrings = [0, true, null, [], () => false, {}];
const nonBooleans = [0, '', null, [], () => false, {}];
const nonArrays = [0, true, null, '', () => false, {}];

void describe('Validate options', async () => {
  await it('options should be an object or undefined', () => {
    assert.doesNotThrow(() => pluginCompress());
    assert.doesNotThrow(() => pluginCompress({}));

    nonObjects.forEach((value: any) => {
      assert.throws(() => pluginCompress(value), {
        message: '@espcom/esbuild-plugin-compress: Options must be a plain object',
      });
    });
  });

  await it('options.extensions should be some of valid or undefined', () => {
    assert.doesNotThrow(() => pluginCompress({ extensions: undefined }));
    assert.doesNotThrow(() => pluginCompress({ extensions: [] }));
    assert.doesNotThrow(() => pluginCompress({ extensions: ['.css'] }));

    assert.throws(
      () => pluginCompress({ extensions: ['.png'] }),
      {
        message:
          '@espcom/esbuild-plugin-compress: The "extensions" parameter must be some of .js, .css, .svg, .json',
      },
      `options.extensions .png SHOULD THROW`
    );

    nonArrays.forEach((value: any) => {
      assert.throws(
        () => pluginCompress({ extensions: value }),
        {
          message: '@espcom/esbuild-plugin-compress: The "extensions" parameter must be an array',
        },
        `options.extensions ${value} SHOULD THROW`
      );
    });
  });

  await it('options.level should be one of valid or undefined', () => {
    assert.doesNotThrow(() => pluginCompress({ level: undefined }));
    assert.doesNotThrow(() => pluginCompress({ level: 'low' }));
    assert.doesNotThrow(() => pluginCompress({ level: 'high' }));
    assert.doesNotThrow(() => pluginCompress({ level: 'max' }));

    assert.throws(
      // @ts-ignore
      () => pluginCompress({ level: '' }),
      {
        message:
          '@espcom/esbuild-plugin-compress: The "level" parameter must be one of low or high or max',
      },
      'options.level EMPTY STRING SHOULD THROW'
    );

    nonStrings.forEach((value: any) => {
      assert.throws(
        () => pluginCompress({ level: value }),
        {
          message:
            '@espcom/esbuild-plugin-compress: The "level" parameter must be one of low or high or max',
        },
        `options.level ${value} SHOULD THROW`
      );
    });
  });

  await it('options.gzip should be boolean or undefined', () => {
    assert.doesNotThrow(() => pluginCompress({ gzip: undefined }));
    assert.doesNotThrow(() => pluginCompress({ gzip: true }));
    assert.doesNotThrow(() => pluginCompress({ gzip: false }));

    nonBooleans.forEach((value: any) => {
      assert.throws(
        () => pluginCompress({ gzip: value }),
        {
          message: '@espcom/esbuild-plugin-compress: The "gzip" parameter must be a boolean',
        },
        `options.gzip ${value} SHOULD THROW`
      );
    });
  });

  await it('options.brotli should be boolean or undefined', () => {
    assert.doesNotThrow(() => pluginCompress({ brotli: undefined }));
    assert.doesNotThrow(() => pluginCompress({ brotli: true }));
    assert.doesNotThrow(() => pluginCompress({ brotli: false }));

    nonBooleans.forEach((value: any) => {
      assert.throws(
        () => pluginCompress({ brotli: value }),
        {
          message: '@espcom/esbuild-plugin-compress: The "brotli" parameter must be a boolean',
        },
        `options.brotli ${value} SHOULD THROW`
      );
    });
  });

  await it('options.zstd should be boolean or undefined', () => {
    assert.doesNotThrow(() => pluginCompress({ zstd: undefined }));
    assert.doesNotThrow(() => pluginCompress({ zstd: true }));
    assert.doesNotThrow(() => pluginCompress({ zstd: false }));

    nonBooleans.forEach((value: any) => {
      assert.throws(
        () => pluginCompress({ zstd: value }),
        {
          message: '@espcom/esbuild-plugin-compress: The "zstd" parameter must be a boolean',
        },
        `options.zstd ${value} SHOULD THROW`
      );
    });
  });
});
