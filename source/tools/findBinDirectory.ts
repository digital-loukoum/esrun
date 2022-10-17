import { existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";

export function findBinDirectory(): string {
	const nodeModules = resolve("node_modules");
	if (!existsSync(nodeModules)) return ""
	const binDirectory = join(nodeModules, ".bin")
	if (!existsSync(binDirectory)) mkdirSync(binDirectory)
	return binDirectory
}
