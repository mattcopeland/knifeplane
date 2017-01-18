var gulp = require('gulp');
var templateCache = require('gulp-angular-templatecache');

gulp.task('html', function () {
  return gulp.src('client/app/**/*.html')
    .pipe(templateCache('app.templates.js', { module: 'app'}))
    .pipe(gulp.dest('client/app'));
});

gulp.task('watch:html', ['html'], function () {
  gulp.watch('client/app/**/*.html', ['html']);
});