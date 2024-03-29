export function importRequire(code: string, location: string) {
	// return `import { createRequire } from "module";\nconst require = createRequire("${location}");\n` + code
	return `
		import __esrun_url from 'url';\n
		import { createRequire as __esrun_createRequire } from "module";\n
		const __esrun_fileUrl = __esrun_url.pathToFileURL("${location}");\n
		const require = __esrun_createRequire(__esrun_fileUrl);\n${code}
	`
}
