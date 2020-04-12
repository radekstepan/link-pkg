#!/usr/bin/env node
const {promises: fs} = require('fs');
const path = require('path');

const cwd = process.cwd();
const {root: rootDir} = path.parse(cwd);

// Recursively yield files up to root directory.
async function* yieldFiles(dir) {
  if (dir === rootDir) {
    return;
  }

  const entries = await fs.readdir(dir, {withFileTypes: true});
  for (const entry of entries) {
    const res = path.resolve(dir, entry.name);
    if (!entry.isDirectory()) {
      yield res;
    }
  }

  yield* yieldFiles(path.resolve(dir, '../'));
}

(async function run() {
  try {
    // Check that we are in a Node.js package path.
    let hostDir;
    for await (const f of yieldFiles(cwd)) {
      if (f.endsWith('package.json')) {
        hostDir = path.dirname(f);
        break;
      }
    }

    try {
      await !hostDir;
    } catch {
      throw new Error(`"${cwd}" is not in the path of a Node.js project to link to`);
    }

    // Check that Node.js package path has been provided as an argument.
    const [pkgDir] = process.argv.slice(2);
    if (!pkgDir) {
      throw new Error('Provide a path to a Node.js package as an argument');
    }

    let remoteJson;
    try {
      const json = await fs.readFile(path.resolve(pkgDir, 'package.json'), 'utf-8');
      remoteJson = JSON.parse(await fs.readFile(json));
    } catch {
      throw new Error(`Node.js package in path "${pkgDir}" does not exist`);
    }

    // Check for breaking version changes.
    try {
      const f = await fs.readFile(path.resolve(hostDir, 'package.json'), 'utf-8');
      const localJson = JSON.parse(f);
      const [localVer, remoteVer] = [localJson, remoteJson].map(json => parseInt(json.version.split('.')[0], 10))
      if (remoteVer > localVer) {
        console.log(`${remoteJson.name} version ${remoteVer} > ${localVer}; make sure all dependencies are installed`);
      }
    } catch (_err) {}

    // TODO recursively create the path structure.

    // TODO remove any existing directory/link.

    // TODO symlink itself.

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
