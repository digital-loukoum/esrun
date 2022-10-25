export function importRequire(code: string, location: string) {
	return `import { createRequire } from "module";\nconst require = createRequire("${location}");\n` + code
}