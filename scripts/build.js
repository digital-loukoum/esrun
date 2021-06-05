import { build } from "@digitak/tsc-esm"
import { rmSync, chmodSync } from "fs"

console.log("Cleaning library...")
rmSync("library", { recursive: true, force: true })

console.log("Compiling typescript...")
await build()

console.log("Making binary executable...")
chmodSync("library/bin.js", 0o775)
