// LAST EDIT: 30/11/2015
//GULP 4
var gulp = require('gulp');
//var merge = require('merge2');
//var source = require('vinyl-source-stream');
//var uglify = require("gulp-uglify");
//var buffer = require('vinyl-buffer');
var notify = require('gulp-notify');
var nodemon = require('gulp-nodemon');
var typescript = require('gulp-typescript'),
  pjson = require('./package.json');
var concat = require("gulp-concat");
var livereload = require('gulp-livereload');
var vulcanize = require('gulp-vulcanize');
var wct = require('web-component-tester');
var tsProject = typescript.createProject('tsconfig.json', {
  declaration: false,
});

/* BACKEND */

gulp.task('backendSrc', function() {
  var tsResult = gulp.src(['server/**/*.ts', 'server/**/**/*.ts'])
    .pipe(typescript(tsProject))

  return tsResult.js.pipe(gulp.dest('./build'));

});

gulp.task('serverAssets', function() {

  return gulp.src('./server/**/*.json')
    .pipe(gulp.dest('./build'));
});


/* FINISH BACKEND */

/* FRONTEND */

gulp.task('frontendSrc', function() {
  var tsResult = gulp.src(['client/components/*.ts', 'client/components/**/*.ts'])
    .pipe(typescript(tsProject))

  return tsResult.js.pipe(gulp.dest('./build/public/components'));
});

gulp.task('frontendSharedSrc', function() {
  var tsResult = gulp.src(['shared/*.ts'])
    .pipe(typescript(tsProject))

  return tsResult.js.pipe(gulp.dest('./build/public/shared'));
});


gulp.task('frontendAssetsFolder', function() {

  return gulp.src('./client/assets/**/**/**')
    .pipe(gulp.dest('./build/public/assets'));
});

gulp.task('frontendHtml', function() {
  return gulp.src('./client/**/*.html')
    .pipe(gulp.dest('./build/public'));
});

gulp.task('frontendJs', function() {
  return gulp.src('./client/**/*.js')
    .pipe(gulp.dest('./build/public'));
});


/*
// Basic usage
gulp.task('runBrowserify', function() {
  // Single entry point to browserify
  var entry = browserify({
    //do your config here
    entries: ['./build/public/entry.js'],
    global: true,
    debug: true
  });


  //entry.external(dependencies || []);

  return entry.bundle()
    .pipe(source('entry.js')) //this converts to stream
    .pipe(buffer()) // <----- convert from streaming to buffered vinyl file object
    .pipe(uglify())
    //do all processing here.
    //like uglification and so on.
    .pipe(gulp.dest('./build/public/bundle'))
    .pipe(notify('Frontend finished.'))
    .pipe(livereload());

});*/


gulp.task('runVulcanize', function() {
  return gulp.src('build/public/index.html')
  .pipe(vulcanize({
    abspath: '',
    excludes: [],
    inlineScripts: true,
    inlineCss: true,
    stripExcludes: false
  }))
  .pipe(gulp.dest('build/public/'))
  .pipe(livereload());
})


gulp.task("frontend", gulp.series(['frontendSrc', 'frontendSharedSrc', 'frontendAssetsFolder', 'frontendJs', 'frontendHtml', 'runVulcanize']), function() {

});

/* FRONTEND TESTS */
//wct.gulp.init(gulp);

/* FINISH FRONTEND */

gulp.task('watch', function() {
  livereload.listen();

  gulp.watch(['client/**/*.ts', 'client/**/**/*.ts', './client/assets/**/**/**','./client/**/*.html', 'shared/*.ts'],
    gulp.series('frontend'));

  //be care my friends, here nodemon runs from the current gulpfile's directory, because of this the: ext: 'ts'
  nodemon({
    // the script to run the app
    script: './build/server.js',
    tasks: ['backendSrc', 'serverAssets'],
    ext: 'ts json', //den vazw ext: ts json .js gt exoume ts isws gia json to xreiastoume alla 9a exei confict me to serverAssets 9a dw.
    ignore: ['public/', 'build/','frontend/','gulpfile.js', 'package.json', 'tsconfig.json']
  }).on('restart', function() {
    // when the app has restarted, run livereload.
    gulp.src('./build/server.js')
      .pipe(livereload())
      .pipe(notify('Server restarted, reloading page...'));
  });

});

gulp.task('build', gulp.series(['frontend', 'backendSrc', 'serverAssets']), function() {});

gulp.task('default', gulp.series(['frontend', 'backendSrc', 'serverAssets', 'watch']), function() {});
