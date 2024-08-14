import { defineConfig } from "rollup";
import esbuild from "rollup-plugin-esbuild";

export default defineConfig({
	input: "scripts/index.ts",
	output: [
		{
			file: "dist/index.cjs",
			format: "cjs",
		},
		{
			file: "dist/index.mjs",
			format: "esm",
		},
	],
	plugins: [
		esbuild({
			tsconfig: "tsconfig.json",
			include: /\.[jt]sx?$/,
			exclude: /node_modules/,
		}),
	],
});
