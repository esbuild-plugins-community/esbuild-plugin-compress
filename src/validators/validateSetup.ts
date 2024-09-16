import { PluginBuild } from 'esbuild';

import { pluginName } from '../constants.js';

export function validateSetup(build: PluginBuild) {
  if (build.initialOptions.write !== false) {
    throw new Error(`${pluginName}: "write" parameter must be set to "false" in esbuild config`);
  }

  return build as PluginBuild;
}
