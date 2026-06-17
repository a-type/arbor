import registerColorSwatch from './ColorSwatch.js';
import registerFunctionsList from './FunctionsList.js';
import registerIntentDemos from './IntentDemos.js';
import registerMixinsList from './MixinsList.js';
import registerModeGraph from './ModeGraph.js';
import registerOutputs from './Outputs.js';
import registerSpacingScale from './SpacingScale.js';

export default function register() {
	registerModeGraph();
	registerOutputs();
	registerFunctionsList();
	registerMixinsList();
	registerIntentDemos();
	registerSpacingScale();
	registerColorSwatch();
	console.debug('Arbor Runtime components registered');
}
