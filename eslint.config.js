import duploLint from "@duplojs/eslint";

export default [
	{
		...duploLint,
		languageOptions: {
			...duploLint.languageOptions,
			globals: {
				vi: true,
				describe: true,
				it: true,
				expect: true,
				beforeEach: true,
				afterEach: true,
				beforeAll: true,
				afterAll: true,
			},
		},
		rules: {
			...duploLint.rules,
			"no-magic-numbers": "off",
			"no-unused-vars": "off",
		},
		files: ["**/*.test.ts", "test/**/*.ts"],
	},
	{
		...duploLint,
		files: ["**/*.{ts,js}"],
		ignores: ["**/*.test.ts", "test/**/*.ts"],
	},
];
