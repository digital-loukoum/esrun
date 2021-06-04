declare function esrun(
	inputFile?: string,
	args?: string[],
	watch?: boolean,
	inspect?: boolean
): Promise<any>
export default esrun
