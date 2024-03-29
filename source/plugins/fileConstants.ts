import { Plugin, Loader } from "esbuild";
import { posix } from "path";
import process from "process";
import fs from "fs";
import { grub } from "@digitak/grubber";

export type FileConstantsPluginOptions = Record<never, never>;

export const fileConstantsPlugin = (
	options: FileConstantsPluginOptions = {},
): Plugin => ({
	name: "fileConstants",
	setup(build) {
		build.onLoad(
			{ filter: /.\.(c|m)?(js|ts)x?$/, namespace: "file" },
			async (options) => {
				const isWindows = /^win/.test(process.platform);
				const escapeBackslashes = (path: string) =>
					isWindows ? path.replace(/\\/g, "/") : path;

				const filename = escapeBackslashes(options.path);
				const dirname = posix.dirname(options.path);
				const fileContent = fs.readFileSync(options.path, "utf8");

				const contents = grub(fileContent).replace(
					{ from: "__dirname", to: `"${dirname}"` },
					{ from: "__filename", to: `"${filename}"` },
				);

				let loader = posix.extname(options.path).slice(1) as Loader;
				if (["m", "c"].includes(loader[0])) loader = loader.slice(1) as Loader;

				return {
					contents,
					loader,
				};
			},
		);
	},
});
