import { TypeCompressionLevel } from './types.js';

/*
compression levels:
  gzip: 1 - 9
  brotli: 1 - 11
  zstd: (-7) - 22
*/
export const getCompressionLevel = (level: TypeCompressionLevel) => {
  const levels = {
    low: {
      gzip: 3,
      brotli: 3,
      zstd: 3,
    },
    high: {
      gzip: 7,
      brotli: 9,
      zstd: 19,
    },
    max: {
      gzip: 9,
      brotli: 11,
      zstd: 22,
    },
  };
  return levels[level];
};
