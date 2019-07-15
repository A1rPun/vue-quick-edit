import vue from 'rollup-plugin-vue';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

export default {
  input: 'src/wrapper.js',
  output: {
    name: 'QuickEdit',
    exports: 'named',
  },
  plugins: [
    globals(),
    builtins(),
    commonjs(),
    vue({
      css: true,
      compileTemplate: true,
      needMap: false,
    }),
    buble(),
  ],
};
