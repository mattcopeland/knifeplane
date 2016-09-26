var gulp = require('gulp');
var stylus = require('gulp-stylus');
var autoprefixer = require('gulp-autoprefixer');
var concatCss = require('gulp-concat-css');

gulp.task('css', function () {
  gulp.src('client/css/**/*.styl')
    .pipe(stylus())
    .pipe(autoprefixer())
    .pipe(concatCss('app.css'))
    .pipe(gulp.dest('client/assets'));
});

gulp.task('watch:css', function () {
  gulp.watch('client/css/**/*.styl', ['css']);
});