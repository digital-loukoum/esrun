export function importRequire(code: string, location: string) {
	// return `import { createRequire } from "module";\nconst require = createRequire("${location}");\n` + code
	return `
		import url from 'url';\n
		import { createRequire } from "module";\n
		const fileUrl = url.pathToFileURL("${location}");\n
		const require = createRequire(fileUrl);\n${code}
	`;
}
