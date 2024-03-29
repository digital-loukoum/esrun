import { existsSync, statSync, readFileSync } from "fs";
import { posix } from "path";

export default function findInputFile(path: string): string {
	if (!existsSync(path)) {
		if (existsSync(`${path}.ts`)) path = `${path}.ts`;
		else if (existsSync(`${path}.js`)) path = `${path}.js`;
		else throw `Path '${path}' does not exist`;
	}

	const stat = statSync(path);
	if (stat.isFile()) return path;
	else if (stat.isDirectory()) {
		// first we check if there is a package.json file with a `main` key
		const packageFile = posix.resolve(path, "package.json");
		if (existsSync(packageFile) && statSync(packageFile).isFile()) {
			const { main } = JSON.parse(readFileSync(packageFile, "utf8"));
			if (main) return findInputFile(posix.resolve(path, main));
		}

		// otherwise we look for a default entry point
		const name = posix.basename(path);
		for (const subpath of [
			posix.resolve(path, "index.ts"),
			posix.resolve(path, name),
			posix.resolve(path, `${name}.ts`),
			posix.resolve(path, "main.ts"),
			posix.resolve(path, "index.js"),
			posix.resolve(path, `${name}.js`),
			posix.resolve(path, "main.js"),
		])
			if (existsSync(subpath) && statSync(subpath).isFile()) return subpath;

		throw `Could not resolve an entry point in folder '${path}`;
	} else throw `Path '${path}' should be a file or a directory`;
}
