import { BuildOptions } from "esbuild";
import { Parameter } from "./Parameter.js";
import { SendCodeMode } from "./SendCodeMode.js";

export type Options = {
	args?: string[];
	watch?: boolean | string[];
	preserveConsole?: boolean;
	inspect?: boolean;
	interProcessCommunication?: boolean;
	makeAllPackagesExternal?: boolean;
	exitAfterExecution?: boolean;
	fileConstants?: boolean;
	tsConfigFile?: string;
	sendCodeMode?: SendCodeMode;
	sudo?: boolean;
	beforeRun?: () => unknown;
	afterRun?: () => unknown;
	nodeOptions?: Record<string, Parameter>;
	esbuildOptions?: BuildOptions;
};
