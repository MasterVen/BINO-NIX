const gulp = require('gulp');
const sass = require('gulp-sass');
sass.compiler = require('sass');
const Fiber = require('fibers');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const sourceMaps = require('gulp-sourcemaps');
const imagemin = require("gulp-imagemin");
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const pngquant = require('imagemin-pngquant');
const run = require("run-sequence");
const del = require("del");
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const {src, dest, series, watch} = gulp

function taskSass(cb) {
  return src('scss/style.scss')
      .pipe(plumber())
      .pipe(sourceMaps.init())
      .pipe(
        sass(
          {
            includePaths: ['./node_modules'],
            fiber: Fiber
          })
          .on('error', sass.logError)
        )
      .pipe(autoprefixer({
        browsers: ['last 2 version']
      }))
      .pipe(sourceMaps.write())
      .pipe(dest('build/css'))
      .pipe(browserSync.reload({stream: true}));
      cb();
};

function html(cb) {
  return src('*.html')
      .pipe(dest('build'))
      .pipe(browserSync.reload({stream: true}));
      cb();
};

function js(cb) {
  return src('js/**/*.js')
      .pipe(dest('build/js'))
      .pipe(browserSync.reload({stream: true}));
      cb();
};

function css(cb) {
  return src('css/**/*.css')
      .pipe(dest('build/css'))
      .pipe(browserSync.reload({stream: true}));
      cb();
};

function allimg(cb) {
  return src('img/**/*.{png,jpg}')
      .pipe(dest('build/img'))
      .pipe(browserSync.reload({stream: true}));
      cb();
};

function images(cb) {
  return src('build/img/**/*.{png,jpg}')
      .pipe(imagemin([
        imagemin.jpegtran({progressive: true}),
        imageminJpegRecompress({
          loops: 5,
          min: 65,
          max: 70,
          quality: 'medium'
        }),
        imagemin.optipng({optimizationLevel: 3}),
        pngquant({quality: '65-70', speed: 5})
      ]))
      .pipe(dest('build/img'));
      cb();
};

function svg(cb) {
  return src('img/**/*.svg')
      .pipe(svgmin({
        js2svg: {
          pretty: true
        }
      }))
      .pipe(cheerio({
        run: function ($) {
          $('[fill]').removeAttr('fill');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
        },
        parserOptions: {xmlMode: true}
      }))
      .pipe(replace('&gt;', '>'))
      // build svg sprite
      .pipe(svgSprite({
        mode: {
          symbol: {
            sprite: "sprite.svg"
          }
        }
      }))
      .pipe(dest('build/img'));
      cb();
};

function copy(cb) {
  return src([
    'img/**',
    'js/**',
    'css/**',
    '*.html'
  ], {
    base: '.'
  })
      .pipe(dest('build'));
  cb();
};

function clean(cb) {
  return del('build');
  cb();
};

exports.build = series(clean, copy, taskSass, images, svg);

exports.default = function () {
  browserSync.init({
    server: "build"
  });

  watch("scss/**/*.scss", taskSass);
  watch("*.html", html);
  watch("js/**/*.js", js);
  watch("css/**/*.css", css);
  watch("img/**/*.{png,jpg}", allimg);
  watch("img/**/*.{svg}", svg);
  // cb();
}


// function serve(cb) {
//   browserSync.init({
//     server: "build"
//   });
//
//   watch("scss/**/*.scss", taskSass, cb);
//   watch("*.html", html, cb);
//   watch("js/**/*.js", js, cb);
//   watch("css/**/*.css", css, cb);
//   watch("img/**/*.{png,jpg}", allimg, cb);
//   watch("img/**/*.{svg}", svg, cb);
//   // cb();
// };

