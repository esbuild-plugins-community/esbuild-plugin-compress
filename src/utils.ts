import * as path from 'node:path';
import * as fs from 'node:fs/promises';

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

export async function createDirectoryIfNotExists(dir: string) {
  try {
    await fs.access(dir);
    return false;
  } catch (e) {
    // @ts-ignore
    if (e.code === 'ENOENT') {
      await fs.mkdir(dir, { recursive: true });
    }
    return true;
  }
}

export const writeFile = async (filepath: string, contents: any) => {
  const dir = path.dirname(filepath);
  await createDirectoryIfNotExists(dir);
  await fs.writeFile(filepath, contents, 'utf-8');
};

export const unlinkFile = async (filePath: string) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
};
