var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');

gulp.task('js', function () {
  gulp.src(['client/app/app.module.js', 'client/app/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('client/assets'));
});

gulp.task('watch:js', ['js'], function () {
  gulp.watch('client/app/**/*.js', ['js']);
});