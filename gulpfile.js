'use strict';

var gulp = require('gulp');

var config = {
  root: __dirname,
  src: ['**/*.js', '!node_modules/**', '!docs/**', '!bin/**'],
  watch: ['lib/**/*.js', '!node_modules/**', '!docs/**', '!bin/**'],
  statementsThreshold: 75,
  functionsThreshold: 70,
  branchesThreshold: 60,
  linesThreshold: 70
};

require('gulp-module')(gulp, config);
