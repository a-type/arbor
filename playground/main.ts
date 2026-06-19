import { connect } from '@arbor-css/core/runtime';
import preset from './arbor.config.js';

connect(preset);
const globalsEditor = document.createElement('arbor-live-editor');
document.body.appendChild(globalsEditor);
