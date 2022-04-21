import fs from "fs"

export function bumpVersion() {
	const file = "package.json"
	const packageInfos = JSON.parse(fs.readFileSync(file, "utf8"))
	const version = packageInfos.version.split(".").map(value => +value)
	version[2]++
	packageInfos.version = version.join(".")
	fs.writeFileSync(file, JSON.stringify(packageInfos, null, "\t"))

	const newVersion = version.join(".")

	return newVersion
}
