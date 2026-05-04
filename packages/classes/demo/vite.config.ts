import pluginReact from '@vitejs/plugin-react';
import pluginUno from 'unocss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [pluginReact(), pluginUno()],
});
