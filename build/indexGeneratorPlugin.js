const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const manifest = require('../manifest.json')

const buildDir = path.resolve(__dirname);
const destManifest = path.resolve(buildDir, '_manifest.js');
const hasDuplicates = (a) => {
    return _.uniq(a).length !== a.length;
}

const generateIndex = () => {
    console.info('generating index...');
    console.debug('manifest ->', manifest);
    let areas = manifest.areas ? manifest.areas : [];

    if (!areas) {
        console.error('ERROR: At least one area must be defined in manifest!');
        throw new Error('No areas defined in manifest!');
    }

    let areaIDs = (areas.map(value => value.id));
    checkForDupAreaIDs(areaIDs);
    let areaTitles = (areas.map(value => value.title));
    checkForDupAreaTitles(areaTitles);
    writeExportManifestConst();
}

const writeExportManifestConst = () => {
    let jsToWrite = 'export const _manifest = ' +
        JSON.stringify(manifest) + ';';
    fs.writeFileSync(destManifest, jsToWrite);
    console.debug('wrote', jsToWrite, "to", destManifest);
}

const checkForDupAreaIDs = (IDs) => {
    if (hasDuplicates(IDs)) {
        console.error('');
        console.error('ERROR: Manifest has areas with duplicate IDs!');
        console.error(IDs);
        throw new Error('Duplicate IDs!');
    }
}

const checkForDupAreaTitles = (titles) => {
    if (hasDuplicates(titles)) {
        console.error('');
        console.error('ERROR: Manifest has areas with duplicate titles!');
        console.error(titles);
        throw new Error('Duplicate titles!');
    }
}

/**
 * Deletes temporary build resources!
 */
const deleteBuildTempResources = () => {
    deleteTempResource(destManifest);
    console.info('deleted build temp resources!');
}

/**
 * Deletes resource, if exists.
 */
const deleteTempResource = (res) => {
    console.info('Deleting ' + res);

    if (fs.existsSync(res)) {
        fs.unlinkSync(res);
        console.info('Deleted ' + res);
    }
}

/**
 * The plugin class!
 */
class IndexGeneratorPlugin {
    // Default options
    constructor(options) {
        this.options = _.extend({
            manifest: manifest,
            minify: true,
            showErrors: true,
            title: 'Index Generator'
        }, options);
    }

    apply(compiler) {
        let initRun = true,
            watching = false;

        compiler.plugin("before-compile", function (compilationParams, callback) {
                if (initRun) {
                    generateIndex();
                    initRun = !initRun;
                }

                callback();
            }),
            compiler.plugin('watch-run', (compilation, callback) => {
                watching = true;
                callback();
            }),
            compiler.plugin('done', () => {
                // Exit when in "watch" mode
                if (!watching) {
                    deleteBuildTempResources();
                }
            }),
            compiler.plugin('watch-close', () => {
                deleteBuildTempResources();
            });
    };
}

module.exports = IndexGeneratorPlugin;