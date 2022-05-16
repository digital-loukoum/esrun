export type Options = {
	args?: string[]
	watch?: boolean | string[]
	preserveConsole?: boolean
	inspect?: boolean
	interProcessCommunication?: boolean
	makeAllPackagesExternal?: boolean
	exitAfterExecution?: boolean
	fileConstants?: boolean
	tsConfigFile?: string
	beforeRun?: () => unknown
	afterRun?: () => unknown
}
