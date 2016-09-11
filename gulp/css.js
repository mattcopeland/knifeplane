var gulp = require('gulp');
var stylus = require('gulp-stylus');
var concatCss = require('gulp-concat-css');

gulp.task('css', function () {
  gulp.src('client/css/**/*.styl')
    .pipe(stylus())
    .pipe(concatCss('app.css'))
    .pipe(gulp.dest('client/assets'));
});

gulp.task('watch:css', function () {
  gulp.watch('client/css/**/*.styl', ['css']);
});