const preprocessor = 'sass',
		  fileswatch   = 'html,htm,txt,json,md,woff2',
      baseDir      = 'app',
      hostName     = 'http://localhost/'

const { src, dest, parallel, series, watch } = require('gulp');
const browserSync  = require('browser-sync').create();
const bssi         = require('browsersync-ssi');
const ssi          = require('ssi');
const webpack      = require('webpack-stream');
const sass         = require('gulp-sass')(require('sass'));
const sassglob     = require('gulp-sass-glob');
const sourcemaps   = require('gulp-sourcemaps');
const cleancss     = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const rename       = require('gulp-rename');
const imagemin     = require('gulp-imagemin');
const newer        = require('gulp-newer');
const rsync        = require('gulp-rsync');
const concat       = require('gulp-concat');
const uglify       = require('gulp-uglify-es').default;
const terser 			 = require('gulp-terser')
const del          = require('del');


function browsersync() {
  if(hostName != 'http://localhost/'){
    browserSync.init({
      proxy: {
        target: hostName,
      },
      notify: false,
      online: true,
    })
  }else{
    browserSync.init({
      server: {
        baseDir: baseDir,
        middleware: bssi({ baseDir, ext: '.html' })
      },
      ghostMode: { clicks: false },
      notify: false,
      online: true,
    })
  }
}
function assets() {
	return src([ // Берём файлы из источников
		'node_modules/jquery/dist/jquery.min.js',
		])
		.pipe(newer(`${baseDir}/assets/js/libs.min.js`))
		.pipe(concat('libs.min.js')) // Конкатенируем в один файл
		.pipe(uglify()) // Сжимаем JavaScript
		// .pipe(babel({presets: ["@babel/preset-env"]}))
		.pipe(terser())
		.pipe(dest(`${baseDir}/assets/js/`)) // Выгружаем готовый файл в папку назначения
		.pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}
function scripts() {
	return src([`${baseDir}/js/*.js`, `!app/js/*.min.js`])
		.pipe(webpack({
			mode: 'production',
			performance: { hints: false },
			module: {
				rules: [
					{
						test: /\.(js)$/,
						exclude: /(node_modules)/,
						loader: 'babel-loader',
						query: {
							presets: ['@babel/env'],
							plugins: ['babel-plugin-root-import']
						}
					}
				]
			}
		})).on('error', function handleError() {
			this.emit('end')
		})
		.pipe(rename('index.min.js'))
		.pipe(dest(`${baseDir}/js`))
		.pipe(browserSync.stream())
}

function styles() {
	return src([`${baseDir}/${preprocessor}/*.*`, `!${baseDir}/${preprocessor}/_*.*`])
    .pipe(eval(`${preprocessor}glob`)())
    .pipe(sourcemaps.init())       // активируем gulp-sourcemaps 
    .pipe(sass({
        outputStyle: 'compressed'      // вложенный (по умолчанию) 
    }).on('error', sass.logError)) // уведомление об ошибках 
		.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
		.pipe(cleancss({ level: { 1: { specialComments: 0 } },/* format: 'beautify' */ }))
		.pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write('.'))   // создание карты css.map в текущей папке
		.pipe(dest(`${baseDir}/css`))
		.pipe(browserSync.stream())
}

function images() {
	return src([`${baseDir}/images/src/**/*`])
		.pipe(newer(`${baseDir}/images/dist`))
		.pipe(imagemin())
		.pipe(dest(`${baseDir}/images/dist`))
		.pipe(browserSync.stream())
}

function buildcopy() {
	return src([
		`{${baseDir}/js,app/css}/*.min.*`,
		`${baseDir}/images/**/*.*`,
		`!${baseDir}/images/src/**/*`,
		`${baseDir}/fonts/**/*`
	], { base: `${baseDir}/` })
	.pipe(dest('dist'))
}

async function buildhtml() {
	let includes = new ssi(`${baseDir}/`, 'dist/', '/**/*.html')
	includes.compile()
	del('dist/parts', { force: true })
}

function cleandist() {
	return del('dist/**/*', { force: true })
}

function deploy() {
	return src('dist/')
		.pipe(rsync({
			root: 'dist/',
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			// clean: true, // Mirror copy with file deletion
			include: [/* '*.htaccess' */], // Included files to deploy,
			exclude: [ '**/Thumbs.db', '**/*.DS_Store' ],
			recursive: true,
			archive: true,
			silent: false,
			compress: true
		}))
}

function startwatch() {
	watch(`${baseDir}/sass/**/*`, { usePolling: true }, styles)
	watch([`${baseDir}/js/**/*.js`, `!${baseDir}/js/**/*.min.js`], { usePolling: true }, scripts)
	watch(`${baseDir}/images/src/**/*.{jpg,jpeg,png,webp,svg,gif}`, { usePolling: true }, images)
	watch(`${baseDir}/**/*.{${fileswatch}}`, { usePolling: true }).on('change', browserSync.reload)
}

exports.scripts = scripts
exports.styles  = styles
exports.assets  = assets
exports.images  = images
exports.deploy  = deploy
exports.assets  = series(scripts, assets, styles, images)
exports.build   = series(cleandist, scripts, assets, styles, images, buildcopy, buildhtml)
exports.default = series(scripts, assets, styles, images, parallel(browsersync, startwatch))