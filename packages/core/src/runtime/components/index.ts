import registerFunctionsList from './FunctionsList.js';
import registerMixinsList from './MixinsList.js';
import registerModeGraph from './ModeGraph.js';
import registerOutputs from './Outputs.js';

export default function register() {
	registerModeGraph();
	registerOutputs();
	registerFunctionsList();
	registerMixinsList();
	console.debug('Arbor Runtime components registered');
}
