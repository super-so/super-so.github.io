'use strict';
const { series } = require('gulp');
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const gulpIgnore = require('gulp-ignore');
const cleanCSS = require('gulp-clean-css');
const concatCss = require('gulp-concat-css');
const rename = require('gulp-rename');

const buildStyles = () => {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpIgnore.exclude('mixins.css'))
    .pipe(gulp.dest('./css'));
};

const concatStyles = () => {
  return gulp.src('./css/**/*.css')
    .pipe(gulpIgnore.exclude('style.css'))
    .pipe(gulpIgnore.exclude('bundle.css'))
    .pipe(concatCss("bundle.css"))
    .pipe(gulp.dest('./css'));
}

const minify = () => {
  return gulp.src('./css/**/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./min-css'));
}

const tasks = [buildStyles, concatStyles, minify]

const build = () => series(...tasks)
const watch = () => gulp.watch('./scss/**/*.scss', series(...tasks));

exports.watch = watch
exports.default = build