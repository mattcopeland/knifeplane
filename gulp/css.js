var gulp = require('gulp');
var stylus = require('gulp-stylus');
var autoprefixer = require('gulp-autoprefixer');
var concatCss = require('gulp-concat-css');
var less = require('gulp-less');

gulp.task('css', function () {
  gulp.src('client/css/**/*.styl')
    .pipe(stylus())
    .pipe(autoprefixer())
    .pipe(concatCss('app.css'))
    .pipe(gulp.dest('client/assets'));
});

gulp.task('less', function () {
  gulp.src('client/less/combined.less')
    .pipe(less())
    //.pipe(autoprefixer())
    .pipe(gulp.dest('client/assets'));
});

gulp.task('watch:less', function () {
  gulp.watch('client/less/**/*.less', ['less']);
});