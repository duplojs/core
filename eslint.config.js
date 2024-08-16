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
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-magic-numbers": "off",
			"@typescript-eslint/no-unnecessary-type-parameters": "off",
		},
		files: ["**/*.test.ts", "test/**/*.ts"],
	},
	{
		...duploLint,
		rules: {
			...duploLint.rules,
			"@typescript-eslint/no-unnecessary-type-parameters": "off",
			"@typescript-eslint/strict-boolean-expressions": "off",
		},
		files: ["**/*.ts"],
		ignores: ["**/*.test.ts", "test/**/*.ts"],
	},
];
