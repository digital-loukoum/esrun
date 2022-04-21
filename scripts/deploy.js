import { execSync } from "child_process"
import { bumpVersion } from "./utilities/bumpVersion.js"

console.log("Bumping version...")
const version = bumpVersion()

execSync(`git add .`)
execSync(`git commit -m "📌 Version ${version}"`)
execSync(`git push`)

import "./build"

console.log(`Starting deploy...`)

try {
	execSync(`npm publish`, { cwd: "./package" })
} catch (error) {
	console.log(`[－－－ An error occured during deploy －－－]`)
	console.log(error, "\n")
	process.exit(1)
}

console.log(`\nDeploy done 🎉\n`)
