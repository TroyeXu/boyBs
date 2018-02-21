var gulp = require('gulp');
// var jade = require('gulp-jade');
// var sass = require('gulp-sass');
// var plumber = require('gulp-plumber');
// var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var $ = require('gulp-load-plugins')(); //要()
var mainBowerFiles = require('main-bower-files');
var minimist = require('minimist')
var browserSync = require('browser-sync').create();
var gulpSequence = require('gulp-sequence')

//輸出環境設定
var envOptions = {
    string: 'env',
    default: { env: 'develop' }
} //傳入關鍵詞 預設develop
var options = minimist(process.argv.slice(2), envOptions);//預設內容 利用minimist紀錄參數
console.log(options);
//清除暫存與public
gulp.task('clean', function () {
    return gulp.src(['./.tmp', './public'], { read: false })
        .pipe($.clean());
});
//輸出build
gulp.task('build', gulpSequence('clean', 'jade', 'babel', 'sass', 'vendorsJs', 'sasshover'))
//部屬  watch browser 不用 /gulp build --env production 輸出才會壓縮
gulp.task('default', ['jade', 'babel', 'sass', 'vendorsJs', 'sasshover', 'browser-sync', 'imagemin', 'watch']);
//任務合併

//輸出html
gulp.task('copyHTML', function () {
    return gulp.src('./sourse/**/*.html')
        .pipe($.plumber())
        .pipe($.uglify())
        .pipe(gulp.dest('./public'))
        .pipe(browserSync.stream());
})

//輸出jade
gulp.task('jade', function () {
    return gulp.src('./sourse/**/*.jade')
        .pipe($.plumber())
        .pipe($.jade({
            pretty: true
        }))
        .pipe(gulp.dest('./public'))
        .pipe(browserSync.stream());
});

//輸出sass
gulp.task('sass', function () {
    // PostCSS AutoPrefixer
    var processors = [
        autoprefixer({
            browsers: ['last 3 version']
        })
    ];
    return gulp.src('./sourse/scss/**/*.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init()) //方便後續除錯
        .pipe($.sass({
            outputStyle: 'nested',
            includePaths: ['./node_modules/bootstrap/scss/'],

        }).on('error', $.sass.logError))
        //上方程式編譯完成
        .pipe($.postcss(processors))
        .pipe($.if(options.env === 'production', $.minifyCss()))
        .pipe($.sourcemaps.write('.'))//方便後續除錯
        .pipe(gulp.dest('./public/css'))
        .pipe(browserSync.stream());
});
//輸出sass
gulp.task('sasshover', function () {
    // PostCSS AutoPrefixer
    var processors = [
        autoprefixer({
            browsers: ['last 3 version']
        })
    ];
    return gulp.src('./bower_components/hover/**/*.scss', )
        .pipe($.plumber())
        .pipe($.sourcemaps.init()) //方便後續除錯
        .pipe($.sass({
        }).on('error', $.sass.logError))
        //上方程式編譯完成
        .pipe($.postcss(processors))
        .pipe($.if(options.env === 'production', $.minifyCss()))
        .pipe($.sourcemaps.write('.'))//方便後續除錯
        .pipe(gulp.dest('./public/css/hover'))
        .pipe(browserSync.stream());
});

//輸出js
gulp.task('babel', () => {
    return gulp.src('./sourse/js/**/*.js')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel({
            presets: ['es2015'] //es版本
        }))
        .pipe($.concat('all.js')) //可以合併JS檔案
        .pipe($.if(options.env === 'production', $.uglify()))//省略console
        .pipe($.sourcemaps.write('.'))//方便後續除錯
        .pipe(gulp.dest('./public/js'))
        .pipe(browserSync.stream());
});

//bower
gulp.task('bower', function () {
    return gulp.src(mainBowerFiles())
        .pipe(gulp.dest('./.tmp/vendors'));
});

//bower
gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: "./public"
        },
        reloadDebounce: 1000
    });
});

//合併js
gulp.task('vendorsJs', ['bower'], function () {
    return gulp.src([
        './.tmp/vendors/jquery.js',
        './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'
    ])
        .pipe($.plumber())
        .pipe($.concat('vendors.js'))
        .pipe($.if(options.env === 'production', $.uglify()))
        .pipe(gulp.dest('./public/js'));
});
//bower 優先執行 在執行 vendorsjs

gulp.task('watch', function () {
    gulp.watch('./sourse/**/*.scss', ['sass']);
    gulp.watch('./sourse/**/*.jade', ['jade']);
    gulp.watch('./sourse/**/*.js', ['babel']);
});
//監聽



gulp.task('imagemin', () =>
    gulp.src('sourse/images/*')
        .pipe($.if(options.env === 'production', $.imagemin()))
        .pipe(gulp.dest('./public/img'))
);
//壓縮圖片

gulp.task('deploy', function () {
    return gulp.src('./public/**/*')
        .pipe($.ghPages());
});
//發部githubpage

