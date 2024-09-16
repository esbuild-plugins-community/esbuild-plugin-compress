import { TypeOptions } from '../types.js';
import { pluginName } from '../constants.js';

const validExtensions = ['.js', '.css', '.svg', '.json'];
const validLevels = ['low', 'high', 'max'];

export function validateOptions(options?: TypeOptions) {
  if (typeof options !== 'undefined') {
    if (Object.prototype.toString.call(options) !== '[object Object]') {
      throw new Error(`${pluginName}: Options must be a plain object`);
    }

    if (typeof options.extensions !== 'undefined') {
      if (!Array.isArray(options.extensions)) {
        throw new Error(`${pluginName}: The "extensions" parameter must be an array`);
      }
      if (!options.extensions.every((ext) => validExtensions.includes(ext))) {
        throw new Error(
          `${pluginName}: The "extensions" parameter must be some of ${validExtensions.join(', ')}`
        );
      }
    }

    if (typeof options.level !== 'undefined') {
      if (!validLevels.includes(options.level)) {
        throw new Error(
          `${pluginName}: The "level" parameter must be one of ${validLevels.join(' or ')}`
        );
      }
    }

    if (typeof options.gzip !== 'undefined') {
      if (typeof options.gzip !== 'boolean') {
        throw new Error(`${pluginName}: The "gzip" parameter must be a boolean`);
      }
    }

    if (typeof options.brotli !== 'undefined') {
      if (typeof options.brotli !== 'boolean') {
        throw new Error(`${pluginName}: The "brotli" parameter must be a boolean`);
      }
    }

    if (typeof options.zstd !== 'undefined') {
      if (typeof options.zstd !== 'boolean') {
        throw new Error(`${pluginName}: The "zstd" parameter must be a boolean`);
      }
    }
  }

  return options;
}
