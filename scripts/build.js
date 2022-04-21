import { execSync } from "child_process"
import { rmSync, chmodSync, copyFileSync } from "fs"

console.log("Cleaning library...")
rmSync("package", { recursive: true, force: true })

console.log("Compiling typescript...")
execSync("tsc", { stdio: "inherit" })

console.log("Copying configuration files...")
copyFileSync("./README.md", "./package/README.md")
copyFileSync("./package.json", "./package/package.json")

console.log("Making binary executable...")
chmodSync("package/bin.js", 0o775)

console.log("✨ Build done\n")
