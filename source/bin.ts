#!/usr/bin/env node
import esrun from "./index.js"
import { CliOption } from "./types/CliOption.js"
import { Parameter } from "./types/Parameter.js"

const { argv } = process
const nodeOptionPrefix = "--node-"

const argumentOptions: Record<string, CliOption> = {
	"--watch": "watch",
	"-w": "watch",
	"--inspect": "inspect",
	"-i": "inspect",
	"--preserveConsole": "preserveConsole",
	"--noFileConstants": "noFileConstants",
	"--tsconfig": "tsconfig",
}

const options: Record<CliOption, boolean | string[] | undefined> & {
	node: Record<string, Parameter>
} = {
	watch: false,
	inspect: false,
	preserveConsole: false,
	noFileConstants: false,
	tsconfig: undefined,
	node: {},
}

let argsOffset = 2
let argument: string

if (argv.length < argsOffset) {
	console.log("Missing typescript input file")
	process.exit(0)
}

while ((argument = argv[argsOffset]).startsWith('--')) {
	const [command, parameters] = getCommandAndParameters(argument)

	if (command in argumentOptions) {
		options[argumentOptions[command]] = parameters
		argsOffset++
	} else if (command.startsWith(nodeOptionPrefix)) {
		options.node[command.slice(nodeOptionPrefix.length)] = parameters
		argsOffset++
	} else {
		console.log(`Unknown option ${command}`)
		process.exit(9)
	}
}

esrun(argv[argsOffset], {
	args: argv.slice(argsOffset + 1),
	watch: options.watch,
	tsConfigFile:
		options.tsconfig instanceof Array
			? options.tsconfig.join(",")
			: typeof options.tsconfig == "boolean"
			? undefined
			: options.tsconfig,
	inspect: !!options.inspect,
	preserveConsole: !!options.preserveConsole,
	fileConstants: !options.noFileConstants,
	nodeOptions: options.node,
}).catch(error => {
	console.error(error)
	process.exit(1)
})


function getCommandAndParameters(argument: string): [string, Parameter] {
	let colonIndex = argument.indexOf(':')
	if (colonIndex == -1) colonIndex = Infinity
	let equalIndex = argument.indexOf('=')
	if (equalIndex == -1) equalIndex = Infinity
	const separatorIndex = Math.min(colonIndex, equalIndex)

	if (separatorIndex == Infinity) return [argument, true]
	return [argument.slice(0, separatorIndex), argument.slice(separatorIndex + 1).split(',')]
}