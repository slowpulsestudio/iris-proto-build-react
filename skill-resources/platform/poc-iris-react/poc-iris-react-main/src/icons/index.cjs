"use strict";
const manifest = require('./manifest.json');
exports.manifest = manifest;
exports.icons = manifest.icons;
Object.assign(exports, require('./icons/index.cjs'));
