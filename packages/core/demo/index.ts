import { connect } from '../src/runtime/index.js';
import arbor from './arbor.js';

connect(arbor);

const demo = document.createElement('arbor-system-demo');
document.body.appendChild(demo);
