import { connect } from '@arbor-css/core/runtime';
import preset from './arbor.config.js';

connect(preset);
const globalsEditor = document.createElement('arbor-globals-editor');
document.body.appendChild(globalsEditor);
