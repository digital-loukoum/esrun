import { existsSync, mkdirSync } from "fs";
import { posix } from "path";

export function findBinDirectory(): string {
	const nodeModules = posix.resolve("node_modules");
	if (!existsSync(nodeModules)) return "";
	const binDirectory = posix.join(nodeModules, ".bin");
	if (!existsSync(binDirectory)) mkdirSync(binDirectory);
	return binDirectory;
}
