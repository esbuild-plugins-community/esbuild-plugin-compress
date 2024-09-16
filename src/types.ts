import { OutputFile } from 'esbuild';

export type TypeCompressionLevel = 'low' | 'high' | 'max';

export type TypeOptions = {
  gzip?: boolean;
  brotli?: boolean;
  zstd?: boolean;
  level?: TypeCompressionLevel;
  extensions?: Array<string>;
};

export type TypeCompressResult = Omit<OutputFile, 'text'>;
