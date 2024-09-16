import { TypeCompressionLevel } from './types.js';

export const getCompressionLevel = (level: TypeCompressionLevel) => {
  const levels = {
    low: {
      brotli: 1,
      gzip: 1,
      zstd: 3,
    },
    high: {
      brotli: 8,
      gzip: 8,
      zstd: 18,
    },
    max: {
      brotli: 9,
      gzip: 9,
      zstd: 19,
    },
  };
  return levels[level];
};
