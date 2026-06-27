import registerColorSwatch from './ColorSwatch.js';
import registerFunctionsList from './FunctionsList.js';
import registerIntentDemos from './IntentDemos.js';
import registerLiveEditor from './LiveEditor.js';
import registerMixinsList from './MixinsList.js';
import registerModeGraph from './ModeGraph.js';
import registerOutputs from './Outputs.js';
import registerShadowScale from './ShadowScale.js';
import registerSpacingScale from './SpacingScale.js';
import registerSystemDemo from './SystemDemo.js';

export default function register() {
	registerModeGraph();
	registerOutputs();
	registerFunctionsList();
	registerMixinsList();
	registerIntentDemos();
	registerSpacingScale();
	registerShadowScale();
	registerColorSwatch();
	registerSystemDemo();
	registerLiveEditor();
	console.debug('Arbor Runtime components registered');
}
