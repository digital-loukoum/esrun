import { createRequire } from "module"

const require = createRequire(process.cwd())

export default (dependency: string) =>
	require.resolve(dependency, { paths: [process.cwd()] })
