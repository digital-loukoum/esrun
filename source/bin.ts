#!/usr/bin/env node
import esrun from "./main.js"
import type { Mode } from "./Mode"

const { argv } = process

const options: Record<string, Mode> = {
	"--watch": "watch",
	"-w": "watch",
	"--inspect": "inspect",
	"-i": "inspect",
}

let mode: Mode = "default"
let argsOffset = 2

if (argv[argsOffset] in options) {
	mode = options[argv[argsOffset]]
	argsOffset++
}

esrun(argv[argsOffset], argv.slice(argsOffset + 1), mode)
