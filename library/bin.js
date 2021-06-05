#!/usr/bin/env node
import esrun from "./main.js";
const { argv } = process;
const options = {
    "--watch": "watch",
    "-w": "watch",
    "--inspect": "inspect",
    "-i": "inspect",
};
let mode = "default";
let argsOffset = 2;
if (argv[argsOffset] in options) {
    mode = options[argv[argsOffset]];
    argsOffset++;
}
esrun(argv[argsOffset], argv.slice(argsOffset + 1), mode);
