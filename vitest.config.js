import { defineConfig } from "vitest/config";
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
	test: {
		watch: false,
		globals: true,
		include: [
			"scripts/**/*.test.ts", 
			"test/spec/**/*.test.ts", 
			"test/integration/src/**/*.test.ts"
		],
		coverage: {
			provider: "istanbul",
			reporter: ["text", "json", "html", "json-summary"],
			reportsDirectory: "coverage",
			exclude: [
				"**/*.test.ts", 
				"bin", 
				"dist", 
				"test/utils", 
				"test/integration/src/providers",
				"test/integration/src/main.ts",
				"test/overridesTypes",
				"test/spec",
			],
		},
	},
	plugins: [tsconfigPaths()],
});
