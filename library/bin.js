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
    const [command, parameters] = argument.split(':');
    if (command in argumentOptions) {
        options[argumentOptions[command]] = parameters ? parameters.split(',') : true;
        argsOffset++;
    }
    else {
        console.log(`Unknown option ${command}`);
        process.exit(9);
    }
}
esrun(argv[argsOffset], argv.slice(argsOffset + 1), options.watch, !!options.inspect);
