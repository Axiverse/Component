const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const csscomb = require('gulp-csscomb');
const gulp = require('gulp');
const merge = require('merge-stream');
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const sass = require('gulp-sass');

const {dest, parallel, series, src, task, watch} = gulp;
const {logError} = sass;

const globs = {
	source: './src/*.scss',
	dist: './dist/*.css',

	docs: {
		styles: './docs/src/styles/*.scss',
		pages: 'docs/src/**/!(_)*.pug',
	},
};

const paths = {
	dist: './dist/',

	docs: {
		styles: './docs/dist/styles/',
		dist: './docs/dist',
	},
};

task('build', () => 
	src(globs.source)
		.pipe(sass({outputStyle: 'compact', precision: 10}).on('error', logError))
		.pipe(autoprefixer())
		.pipe(csscomb())
		.pipe(dest(paths.dist))
		.pipe(cleancss())
		.pipe(rename({suffix: '.min'}))
		.pipe(dest(paths.dist)));

task('docs:copy', () => 
	src(globs.dist)
		.pipe(dest(paths.docs.styles)));

task('docs:styles', () => 
	src(globs.docs.styles)
		.pipe(sass({outputStyle: 'compact', precision: 10}).on('error', logError))
		.pipe(autoprefixer())
		.pipe(csscomb())
		.pipe(dest(paths.docs.styles))
		.pipe(cleancss())
		.pipe(rename({suffix: '.min'}))
		.pipe(dest(paths.docs.styles)));

task('docs:pages', () => 
	src(globs.docs.pages)
		.pipe(pug({pretty: true}))
		.pipe(dest(paths.docs.dist)));

task('docs',
	parallel(
		series('build', 'docs:copy'),
		'docs:styles',
		'docs:pages')); 

task('watch:mark', (cb) => {
	console.log('==========');
	cb();
});

task('watch:watch', () => {
	watch('./**/*.scss', series('build', 'watch:mark'));
	watch(['./**/*.scss', './**/*.pug'], series('docs', 'watch:mark'));
});

task('watch', series('docs', 'watch:mark', 'watch:watch'));

task('default', series('build'));