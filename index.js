#!/usr/bin/env node
const {promises: {readdir, mkdir, rmdir, readFile, unlink, symlink}} = require('fs');
const {parse, resolve, dirname} = require('path');

const cwd = process.cwd();
const {root: rootDir} = parse(cwd);

// Recursively yield files up to root directory.
async function* yieldFiles(dir) {
  if (dir === rootDir) {
    return;
  }

  const entries = await readdir(dir, {withFileTypes: true});
  for (const entry of entries) {
    const res = resolve(dir, entry.name);
    if (!entry.isDirectory()) {
      yield res;
    }
  }

  yield* yieldFiles(resolve(dir, '../'));
}

(async function run() {
  try {
    // Check that we are in a Node.js package path.
    let hostDir;
    for await (const f of yieldFiles(cwd)) {
      if (f.endsWith('package.json')) {
        hostDir = dirname(f);
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
      const json = await readFile(resolve(pkgDir, 'package.json'), 'utf-8');
      remoteJson = JSON.parse(json);
    } catch {
      throw new Error(`Node.js package in path "${pkgDir}" does not exist`);
    }
    const {name: pkgName} = remoteJson;
    const [scope, name] = pkgName.split('/');

    // Check for breaking version changes.
    try {
      const f = await readFile(resolve(hostDir, `node_modules/${pkgName}/package.json`), 'utf-8');
      const localJson = JSON.parse(f);
      const [localVer, remoteVer] = [localJson, remoteJson].map(json => parseInt(json.version.split('.')[0], 10))
      if (remoteVer > localVer) {
        console.log(`${pkgName} ${remoteJson.version} > ${localJson.version}; make sure all dependencies are installed`);
      }
    } catch (_err) {}

    // Create the path structure.
    try {
      await mkdir(resolve(hostDir, name ? `node_modules/${scope}` : 'node_modules'), {recursive: true});
    } catch (_err) {}

    const pkgPath = resolve(hostDir, `node_modules/${pkgName}`);

    // Cleanup.
    try {
      await rmdir(pkgPath, {recursive: true});
      await unlink(pkgPath);
    } catch (_err) {}

    // Symlink itself.
    await symlink(resolve(pkgDir), pkgPath);

    console.log(`${pkgName}@${remoteJson.version} linked`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
