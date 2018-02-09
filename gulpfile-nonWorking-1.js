var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');

// Autoprefixer variables
var autoprefixerOptions = {
	browsers: ['last 2 versions', '> 5%', 'Firefox ESR', 'ie 8-9']
};

//=================================================
//================ gulp-tasks =====================
//=================================================

// Static Server + watching scss/html files
gulp.task('browserSync', function () {
	browserSync.init({
		server: {
			baseDir: 'app'
		},
		//port: 8080
	});
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function () {
	// Gets all files ending with .scss or .sass in app/scss
	return gulp.src('app/scss/**/*.+(scss|sass)')
		.pipe(sass().on('error', sass.logError)) // Passes it through a gulp-sass, log errors to console
		// Initialize sourcemap plugin
		.pipe(sourcemaps.init())
		.pipe(sass())
		// Passes it through gulp-autoprefixer
		.pipe(autoprefixer(autoprefixerOptions))
		// Writing sourcemaps
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('app/css'))
		// Reloading the stream
		.pipe(browserSync.reload({
			stream: true
		}));
});

//gulp watch
gulp.task('watch', ['browserSync', 'sass'], function () {
	gulp.watch('app/scss/**/*.+(scss|sass)', ['sass']);
	// Reloads the browser whenever HTML or JS files change
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});

// Image and SVG optimization
gulp.task('images', function () {
	gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
		.pipe(cache(imagemin([
			imagemin.gifsicle({
				interlaced: true
			}),
			imagemin.jpegtran({
				progressive: true
			}),
			imagemin.optipng({
				optimizationLevel: 5
			}),
			imagemin.svgo({
				plugins: [{
					removeViewBox: true
				},
				{
					cleanupIDs: false
				}]
			})
		])))
		.pipe(gulp.dest('dist/images'));
});

//copy fonts to dist folder
gulp.task('fonts', function () {
	return gulp.src('app/fonts/**/*.{ttf,woff,eof,svg}')
		.pipe(gulp.dest('dist/fonts'));
});

//Cleaning up generated files automatically
gulp.task('clean:dist', function () {
	return del.sync('dist/**/*');
});

//clear the caches off your local system
gulp.task('cache:clear', function (callback) {
	return cache.clearAll(callback);
});

// minify CSS and javascript files only.
/*
gulp.task('useref', function () {
	return gulp.src('app/*.html')
		.pipe(useref())
		.pipe(gulpIf('*.js', uglify()))
		// Minifies only if it's a CSS file
		.pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest('dist'));
});
*/
//task that ensures that clean:dist runs first
gulp.task('build', function (callback) {
	runSequence('clean:dist', ['sass', 'images', 'fonts'],
		callback
	);
});

//run it simply by typing the gulp command
gulp.task('default', function (callback) {
	runSequence('build', ['sass', 'browserSync', 'watch'],
		callback
	);
});