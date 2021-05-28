#!/usr/bin/env node
import esrun from "./main.js"

const watch = process.argv[2] == "--watch" || process.argv[2] == "-w"
const argsOffset = watch ? 3 : 2

esrun(process.argv[argsOffset], process.argv.slice(argsOffset + 1), watch)
