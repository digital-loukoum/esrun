#!/usr/bin/env node
import esrun from "./main.js";
const { argv } = process;
const argumentOptions = {
    "--watch": "watch",
    "-w": "watch",
    "--inspect": "inspect",
    "-i": "inspect",
};
const options = {
    watch: false,
    inspect: false,
};
let argsOffset = 2;
let argument;
while ((argument = argv[argsOffset]).startsWith("-")) {
    if (argument in argumentOptions) {
        options[argumentOptions[argument]] = true;
        argsOffset++;
    }
    else {
        console.log(`Unknown option ${argv[argsOffset]}`);
        process.exit(9);
    }
}
console.log("Options:", options);
esrun(argv[argsOffset], argv.slice(argsOffset + 1), options.watch, options.inspect);
