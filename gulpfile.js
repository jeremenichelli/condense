var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concatUtil = require('gulp-concat-util'),
    concat = require('gulp-concat'),
    package = require('./package.json');

var paths = {
        dep: 'dep/**/*.js', 
        src: 'src/' + package.name + '.js',
        dist: 'dist/' + package.name + '.js',
        output: 'dist/'
    },
    header =  '// ' + package.title + ' - ' + package.author + '\n' +
            '// ' + package.repository.url + ' - MIT License\n\n';

gulp.task('minify', ['lint'], function() {
    return gulp.src([ paths.dep, paths.src])
        .pipe(concat('condense.js'))
        .pipe(concatUtil.header(header))
        .pipe(gulp.dest(paths.output))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.output));
});

gulp.task('lint', function() {
    return gulp.src(paths.src)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('default',  [ 'minify' ]);
