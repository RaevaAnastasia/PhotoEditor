const gulp = require('gulp'),
   sass = require('gulp-sass'),
   concat = require('gulp-concat'),
   autoprefixer = require('gulp-autoprefixer'),
   cleanCSS = require('gulp-clean-css'),
   terser = require('gulp-terser'),
   del = require('del'),
   imagemin = require('gulp-imagemin'),
   htmlmin = require('gulp-htmlmin'),
   imageminJpegRecompress = require('imagemin-jpeg-recompress'),
   browserSync = require('browser-sync').create(),
   uglify = require('gulp-uglify'),
   csscomb = require('gulp-csscomb');

const stylesFiles = [
   './src/style/**/*.scss'
];

const jsFiles = [
   './src/scripts/**/*.js',
];

const imgFiles = [
   './src/img/**/*.png',
   './src/img/**/*.jpg',
   './src/img/**/*.gif',
   './src/img/**/*.svg'
];

function styles() {
   return gulp.src(stylesFiles)
      .pipe(sass({
         includePaths: require('node-normalize-scss').includePaths
      }))
      .pipe(csscomb())  
      .pipe(concat('styles.css'))
      .pipe(autoprefixer({
         browserslistrc: ['last 2 versions'],
         cascade: false
      }))
      .pipe(cleanCSS({
         level: 2
      }))
      .pipe(gulp.dest('./build/css'))
      .pipe(browserSync.stream());
   }


function scripts() {
   return gulp.src(jsFiles)
      .pipe(uglify({ mangle: true }))
      .pipe(concat('script.js'))
      .pipe(gulp.dest('./build/scripts'))
      .pipe(browserSync.stream());
}

function minhtml() {
   return gulp.src('./src/*.html')
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest('./build'));
}

function minimg() {
   return gulp.src(imgFiles)
      .pipe(
         imagemin([
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imageminJpegRecompress({
               loops: 3,
               min: 65,
               max: 75,
               quality: 'high'
            }),
            imagemin.svgo(),
         ]),
      )
      .pipe(gulp.dest('./build/img'));
}

function clean() {
   return del(['build/css/**/*.css']);
}

function watch() {
   browserSync.init({
      server: {
         baseDir: "./build/",
         index: "index.html"
      }
   });

   gulp.watch('./src/style/**/*.scss', styles);
   gulp.watch('./src/style/css/**/*.css').on('change', browserSync.reload);
   gulp.watch('./src/scripts/**/*.js', scripts);
   gulp.watch('./src/*.html').on('change', gulp.series(minhtml, browserSync.reload));
}

exports.styles = styles;
exports.scripts = scripts;
exports.delcss = clean;
exports.html = minhtml;
exports.watch = watch;
exports.build = gulp.series(clean, gulp.parallel(minhtml, styles, scripts, minimg));
exports.dev = gulp.series(exports.build, watch);
