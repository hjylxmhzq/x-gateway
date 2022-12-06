import gulp from 'gulp';
import gulpTs from 'gulp-typescript';
import { spawn } from 'child_process';

const { createProject } = gulpTs;
const { src, dest, watch: watchFn, series } = gulp;

const tsProject = createProject('tsconfig.json');

function kill(cb) {
  if (child) {
    console.log('kill')
    child.kill('SIGKILL');
  }
  cb();
}

export function build () {
  return src('src/**/*.ts')
    .pipe(tsProject())
    .pipe(dest('dist'));
}

let child = undefined;

function startServer(cb) {
  child = spawn('node', ['--experimental-loader', './nodejs/loader.js', './dist/main.js'], { stdio: 'inherit' });
  cb();
}

const buldAndRun = series(kill, build, startServer);

export async function watch() {
  buldAndRun()
  return watchFn('src/**/*.ts', buldAndRun);
};