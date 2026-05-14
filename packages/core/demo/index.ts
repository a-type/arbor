import { connect } from '../src/runtime/index.js';
import arbor from './arbor.js';
import './MainColorRangeDebug.js';

connect(arbor);

const debug = document.createElement('main-color-range-debug');
document.body.appendChild(debug);
const debugAlt = document.createElement('main-color-range-debug');
debugAlt.setAttribute('color', 'alt');
document.body.appendChild(debugAlt);
const debugGreen = document.createElement('main-color-range-debug');
debugGreen.setAttribute('color', 'green');
document.body.appendChild(debugGreen);

const demo = document.createElement('arbor-system-demo');
document.body.appendChild(demo);
