const gulp = require('gulp')
const uglify = require('gulp-uglify')
const cleanCSS = require('gulp-clean-css')
const header = require('gulp-header')
const gulpif = require('gulp-if')
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const path = require('path')

const license = "/*\nCopyright (c) [2025] Not Another™ (https://www.na.studio)\n\nThis code is part of the TPEQ project (https://www.tpeq.co/).\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including the rights to use, copy, modify,\nmerge, publish, distribute, sublicense, and/or sell copies of the Software, and\nto permit persons to whom the Software is furnished to do so, subject to the\nfollowing conditions:\n\nThe above copyright notice and this permission notice shall be preserved in\nall copies or substantial portions of the Software.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\" AND\nANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED\nWARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE\nDISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR\nANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES\n(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS\nOF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY\nOF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE\nOR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED\nOF THE POSSIBILITY OF SUCH DAMAGE.\n\n**IMPORTANT NOTICE**\n\nYou may not remove or modify any copyright notices or authorship attributions\n(i.e., \"written by\" or \"made by\" statements) from this code.\n*/\n\n"

function isJs(file) {
  return path.extname(file.path) === '.js'
}

function isCSS(file) {
  return path.extname(file.path) === '.css'
}

gulp.task('minify', function () {
  return gulp.src('src/**/*')
    .pipe(plumber())
    .pipe(gulpif(isJs, uglify({ mangle: false })))
    .pipe(gulpif(isCSS, cleanCSS()))
    .pipe(header(license))
    .pipe(gulpif(isJs, rename({ suffix: '.min' })))
    .pipe(gulpif(isCSS, rename({ suffix: '.min' })))
    .pipe(gulp.dest('dist'))
})
