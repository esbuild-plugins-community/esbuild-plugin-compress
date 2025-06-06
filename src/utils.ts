import * as path from 'node:path';
import * as fs from 'node:fs/promises';

import { TypeCompressionLevel } from './types.js';

/*
compression levels:
  gzip: 1 - 9; default: -1
  brotli: 1 - 11; default: 11
  zstd: 1 - 22; default: 3
*/
export const getCompressionLevel = (level: TypeCompressionLevel) => {
  const levels = {
    low: {
      gzip: 3,
      brotli: 4,
      zstd: 5,
    },
    high: {
      gzip: 7,
      brotli: 9,
      zstd: 16,
    },
    max: {
      gzip: 9,
      brotli: 11,
      zstd: 20,
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
