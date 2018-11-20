'use strict';
//init gulp module
var gulp = require('gulp'),
    // init plugins autoload from package.json
    plugins = require('gulp-load-plugins')({
        overridePattern: true,
        pattern: ['gulp-*', 'gulp.*', '@*/gulp{-,.}*', 'browser-sync', 'imagemin-*', 'rimraf'],
        rename: {
            'gulp-autoprefixer' : 'prefixer',
            'gulp-minify-css' : 'cssmin',
            'imagemin-pngquant' : 'pngquant',
            'imagemin-zopfli' : 'zopfli',
            'imagemin-mozjpeg' : 'mozjpeg',
            'imagemin-giflossy' : 'giflossy',
        },
    }),
    // Last run task time
    taskLasRun = plugins.gulp3LastRun( gulp ),
    // init reload function
    reload = plugins.browserSync.reload,
    //setup project paths
    path = {
        // build paths
          build: {
            js: 'js/',
            css: './',
            img: 'images/',
            fonts: 'fonts/'
          },
          // source paths
          source: {
            js: 'source/js/**/*.js',
            style: 'source/scss/style.scss',
            img: 'source/images/**/*.*',
            fonts: 'source/fonts/**/*.*'
          },
          //which files are watching
          watch: {
            php: './**/*.php',
            js: 'source/js/**/*.js',
            style: 'source/scss/**/*.scss',
            img: 'source/images/**/*.*',
            fonts: 'source/fonts/**/*.*'
          },
        },
        // server setups
        config = {
            port: 9100,
            hostname: '0.0.0.0',
            livereload: true,
            debug: true
        };
      


gulp.task( 'js:build', function () {
    gulp.src( path.source.js )
        .pipe( plugins.plumber() )
        .pipe( plugins.jsImport({hideConsole: true}) )
        .pipe( plugins.rigger() )
        .pipe( plugins.sourcemaps.init() )
        .pipe( plugins.uglify() )
        .pipe( plugins.sourcemaps.write( '.' ) )
        .pipe( gulp.dest(path.build.js) )
        .pipe( reload({stream: true}) );
});

gulp.task( 'style:build', function () {
    gulp.src( path.source.style )
        .pipe( plugins.plumber() )
        .pipe( plugins.sourcemaps.init() )
        .pipe( plugins.sass() )
        .pipe( plugins.prefixer() )
        .pipe( plugins.cleanCss() )
        .pipe( plugins.cssmin() )
        .pipe( plugins.sourcemaps.write( '.' ) )
        .pipe( gulp.dest(path.build.css) )
        .pipe( reload({stream: true}) );
});

gulp.task('image:build', function () {
    const lastImageTask = taskLasRun.retrieveThenCapture( 'image:build' );
    gulp.src( path.source.img )
        // .pipe( plugins.filterSince( lastImageTask ))
        .pipe( plugins.plumber() )
        .pipe( plugins.image({
            pngquant: true,
            optipng: false,
            zopflipng: true,
            jpegRecompress: false,
            mozjpeg: true,
            guetzli: false,
            gifsicle: true,
            svgo: true,
            concurrent: 10,
            quiet: true // defaults to false
        }) )
        .pipe( gulp.dest(path.build.img) )
        .pipe( reload({stream: true}) )
});

gulp.task( 'fonts:build', function() {
    const lastFontTask = taskLasRun.retrieveThenCapture( 'fonts:build' );
    gulp.src(path.source.fonts )
        .pipe( plugins.filterSince( lastFontTask ))
        .pipe( plugins.plumber() )
        .pipe( gulp.dest( path.build.fonts ) )
});

gulp.task('build', [
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);

gulp.task('watch', function(){
    plugins.watch([path.watch.php], function(event, cb) {
        reload();
    });
    plugins.watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    plugins.watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    plugins.watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    plugins.watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('webserver', function () {
    plugins.browserSync(config);
});


gulp.task('default', ['build', 'webserver', 'watch']);