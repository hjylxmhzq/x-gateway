import run from '@rollup/plugin-run';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/main.ts',
  output: {
    dir: './dist',
    format: 'esm',
    preserveModules: true,
  },
  plugins: [typescript(), run()],
};