import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const LOCAL_PERL_LIB = path.join(process.env.HOME || '', 'perl5', 'lib', 'perl5');
const LOCAL_PERL_ARCH_LIB = path.join(LOCAL_PERL_LIB, 'darwin-thread-multi-2level');

function isCiEnv() {
  return process.env.CI === '1' || process.env.CI === 'true';
}

function withPerlLibEnv() {
  const env = { ...process.env };
  const libs = [];
  if (fs.existsSync(LOCAL_PERL_LIB)) {
    libs.push(LOCAL_PERL_LIB);
  }
  if (fs.existsSync(LOCAL_PERL_ARCH_LIB)) {
    libs.push(LOCAL_PERL_ARCH_LIB);
  }
  if (libs.length > 0) {
    env.PERL5LIB = [...libs, env.PERL5LIB].filter(Boolean).join(':');
  }
  return env;
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: withPerlLibEnv(),
  });
  return result.status ?? 1;
}

function hasPerlModule(moduleName) {
  const result = spawnSync('perl', ['-M' + moduleName, '-e', '1'], {
    stdio: 'ignore',
    env: withPerlLibEnv(),
  });
  return result.status === 0;
}

function main() {
  if (isCiEnv()) {
    console.log('mode=skip');
    console.log('reason=CI environment');
    process.exit(0);
  }

  if (!hasPerlModule('HTML::Parser')) {
    console.error('fatal: Perl module HTML::Parser is required for linkchecker.');
    console.error('install example: cpanm --local-lib-contained ~/perl5 HTML::Parser');
    process.exit(2);
  }

  // linkchecker is for HTML files. Run against public HTML tree.
  const status = run('perl', ['./linkchecker/linkchecker.pl', './public']);
  process.exit(status);
}

main();
