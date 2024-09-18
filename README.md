## @espcom/esbuild-plugin-compress

[![npm](https://img.shields.io/npm/v/@espcom/esbuild-plugin-compress)](https://www.npmjs.com/package/@espcom/esbuild-plugin-compress)
![coverage](https://github.com/esbuild-plugins-community/esbuild-plugin-compress/blob/main/assets/coverage.svg)
![size-esm](https://github.com/esbuild-plugins-community/esbuild-plugin-compress/blob/main/assets/esm.svg)
![size-cjs](https://github.com/esbuild-plugins-community/esbuild-plugin-compress/blob/main/assets/cjs.svg)

An `esbuild` plugin that compresses your output files using gzip, brotli, or zstd compression algorithms.

## Installation

You can install this plugin via npm:

```bash
npm install @espcom/esbuild-plugin-compress
```


## Usage

To use the plugin, import it and add it to your `esbuild` configuration.

> [!WARNING]  
> Make sure to set `write: false` in your esbuild configuration, so the plugin can handle file writing after compression.


```javascript
import esbuild from 'esbuild';
import { pluginCompress } from '@espcom/esbuild-plugin-compress';

esbuild.build({
  entryPoints: ['app.js'],
  bundle: true,
  write: false, // important for now
  outfile: 'out.js',
  plugins: [
    pluginCompress({
      gzip: true,  // Enable gzip compression
      brotli: true,  // Enable brotli compression
      zstd: true,  // Enable zstd compression
      level: 'high',  // Compression level: low, high, max
      extensions: ['.js', '.css']  // File extensions to compress
    })
  ],
});
```

## Options

The plugin accepts the following options:

- **gzip** (boolean): Enable gzip compression.
- **brotli** (boolean): Enable brotli compression.
- **zstd** (boolean): Enable zstd compression.
- **level** ('low' | 'high' | 'max'): Set the compression level (`low`, `high`, `max`). Default is `max`.
- **extensions** (Array<'.js' | '.css' | '.svg' | '.json'>): File extensions to compress. Default is `['.js', '.css']`.

## Compression Levels

The plugin provides three compression levels:

- **low**: Fastest compression with lower ratio.
- **high**: Balanced compression ratio and speed.
- **max**: Highest compression ratio, but slower.
