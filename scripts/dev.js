const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const angularCli = path.join(rootDir, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');

const processes = [
  start('backend', process.execPath, [path.join(rootDir, 'backend', 'server.js')], path.join(rootDir, 'backend')),
  start('frontend', process.execPath, [
    angularCli,
    'serve',
    '--host',
    '127.0.0.1',
    '--port',
    '4201',
    '--proxy-config',
    'frontend/proxy.conf.json'
  ], rootDir)
];

function start(name, command, args, cwd) {
  const child = spawn(command, args, processOptions(cwd));

  child.on('error', (error) => {
    console.error(`${name} failed to start: ${error.message}`);
    stopAll(child);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      return;
    }

    console.log(`${name} stopped with exit code ${code}`);
    stopAll(child);
  });

  return child;
}

function processOptions(cwd) {
  return {
    cwd,
    stdio: 'inherit',
    shell: false
  };
}

function stopAll(exitingProcess) {
  for (const child of processes) {
    if (child !== exitingProcess && !child.killed) {
      child.kill();
    }
  }

  process.exit(1);
}

process.on('SIGINT', () => {
  for (const child of processes) {
    child.kill('SIGINT');
  }

  process.exit(0);
});
