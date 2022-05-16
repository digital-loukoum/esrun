import { Plugin } from "esbuild"

export type MakePackagesExternalPluginOptions = Record<never, never>

export const makePackagesExternalPlugin = (
	options: MakePackagesExternalPluginOptions = {}
): Plugin => ({
	name: "makePackagesExternal",
	setup: build => {
		const filter = /^[^.\/~$@]|^@[^\/]/ // Must not start with "/", ".", "~", "$" or "@/"
		build.onResolve({ filter }, args => {
			return {
				path: args.path,
				external: true,
			}
		})
	},
})
