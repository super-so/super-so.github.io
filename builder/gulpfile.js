const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const concat = require('gulp-concat');
const minifyCss = require('gulp-clean-css');
const del = require('del');

function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function(file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

const build = (done) => {
    var folders = getFolders('./themes');
    if (folders.length === 0) return done();
    var tasks = folders.map(function(folder) {
        return gulp.src([
                './themes/' + folder + '/*.css',
                './builder-base.css'
            ], { base: './themes' })
            // concat into foldername.js
            .pipe(concat(folder + '.min.css'))
            // minify the CSS
            .pipe(minifyCss())
            // write to output
            .pipe(gulp.dest('./themes/' + folder))
    });
    done();
};

const watch = () => {
    gulp.watch('./themes', build);
}

const clean = () => {
    console.log('Deleting all "min.css" files')
    return del(['themes/*/*.min.css']);
}

exports.build = build;
exports.clean = clean;
exports.watch = watch;