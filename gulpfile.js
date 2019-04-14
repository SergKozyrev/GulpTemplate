let gulp = require('gulp'),
    plumber = require('gulp-plumber'), // Отлов ошибок
    cache = require('gulp-cached'), // Кэширование файлов
    imagemin = require('gulp-imagemin'), // Минификация изображений
    imageminPngquant = require('imagemin-pngquant'), // Минификация png
    imageminJpegRecompress = require('imagemin-jpeg-recompress'), // Минификация jpeg
    fileinclude = require('gulp-file-include'), // Импорт файлов
    sass = require('gulp-sass'), // Компилятор sass
    sourcemaps = require('gulp-sourcemaps'), // Карта стилей
    autoprefixer = require('gulp-autoprefixer'), // Расстановка префиксов
    shorthand = require('gulp-shorthand'), // Короткая запись стилей
    cleanCSS = require('gulp-clean-css'), // Минификация css
    concat = require('gulp-concat'), // Обьединение файлов
    uglify = require('gulp-uglify'), // Минификация javascript
    del = require('del'); // Очистка папки 


// Работа с шрифтами

function fonts() {
    return gulp.src('./src/fonts/**/*.*')
        .pipe(plumber())
        .pipe(gulp.dest('./build/fonts'))
}

// Работа с изображениями

function img() {
    return gulp.src('src/img/**/*.*')
        .pipe(plumber())
        .pipe(cache('img'))
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.jpegtran({
                progressive: true
            }),
            imageminJpegRecompress({
                loops: 5,
                min: 65,
                max: 70,
                quality: 'medium'
            }),
            imagemin.svgo(),
            imagemin.optipng({
                optimizationLevel: 3
            }),
            imageminPngquant({
                quality: [0.7, 0.8],
                speed: 5
            })
        ], {
            verbose: true
        }))
        .pipe(gulp.dest('build/img'))
}

// Работа с html

function html() {
    return gulp.src('./src/*.html')
        .pipe(plumber())
        .pipe(fileinclude({
            prefix: '@@'
        }))
        .pipe(gulp.dest('./'));
}

// Работа со стилями

function style() {
    return gulp.src('./src/sass/**/*.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(shorthand())
        .pipe(autoprefixer({
            browsers: ['>0.1%']
        }))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/css'));
}

// Работа с скриптами

function script() {
    return gulp.src('./src/js/**/*.js')
        .pipe(plumber())
        .pipe(concat('main.js'))
        .pipe(uglify({
            toplevel: true
        }))
        .pipe(gulp.dest('./build/js'));
}

// Слежка за изменениями

function watch() {
    gulp.watch('src/fonts/**/*.*', fonts);
    gulp.watch('src/img/**/*.*', img);
    gulp.watch('src/**/*.html', html);
    gulp.watch('src/**/*.scss', style);
    gulp.watch('src/js/**/*.js', script);
}

// Очистка папки

function clean() {
    return del(['build/*', 'index.html']);
}

gulp.task("fonts", fonts); // Регистрация таска работы с шрифтами
gulp.task("img", img); // Регистрация таска работы с изображениями
gulp.task("html", html); // Регистрация таска работы с html
gulp.task("style", style); // Регистрация таска работы со стилями
gulp.task("script", script); // Регистрация таска работы с js 
gulp.task("watch", watch); // Регистрация таска слежения за изменениями
gulp.task("clean", clean); // Регистрация таска очистки папки

gulp.task("build", gulp.series(clean, gulp.parallel(fonts, img, html, style, script))); // Таск для сборки всего проекта
gulp.task("dev", gulp.series('build', 'watch')); // Таск при разработке