const gulp = require(`gulp`);
const mocha = require(`gulp-mocha`);
const { GulpHelper } = require(`./gulp.helper`);

const GulpBuild = require(`./build.gulp`);

module.exports = GulpHelper.combineGulpFiles(
  GulpBuild,
);
exports = module.exports;

const distFolder = `../dist`;
const srcFolder = `../src`;
const specFolder = `../spec`;

/**
 * Tests
 */

exports[`test:start`] = function test () {
  return gulp.src(`${distFolder}/**/*.spec.js`)
    .pipe(mocha({ reporter: 'spec', exit: true }))
    .once('error', (error) => {
      console.error(error);
    });
};

exports[`test:watch`] = gulp.series(
  exports[`build:test`],
  exports[`build:pkg`],
  exports[`test:start`],
  gulp.parallel(
    function buildSpecWatch () {
      return gulp.watch([
        `${specFolder}/**/*.ts`,
      ], gulp.series(exports[`build:test`]));
    },
    function buildSrcWatch () {
      return gulp.watch([
        `${srcFolder}/**/*.ts`,
      ], gulp.series(exports[`build:pkg`]));
    },
    function testStartWatch () {
      return gulp.watch([
        `${distFolder}/**/*.js`,
      ], gulp.series(exports[`test:start`]));
    },
  ),
);
