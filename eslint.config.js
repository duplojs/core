import duploLint from "@duplojs/eslint";

export default [
	{
		...duploLint,
		files: ["**/*.{ts,js}"],
	},
];
