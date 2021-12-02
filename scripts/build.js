import { compile, patch } from "@digitak/tsc-esm"
import { rmSync, chmodSync } from "fs"

console.log("Cleaning library...")
rmSync("library", { recursive: true, force: true })

console.log("Compiling typescript...")
compile()

console.log("Patching imports...")
patch([
	{ find: /^chokidar$/, replacement: null },
])

console.log("Making binary executable...")
chmodSync("library/bin.js", 0o775)

