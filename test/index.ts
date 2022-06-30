import Zabu from "~/samples/Zabu"
import coco from "~/samples/coco"
import ts from "typescript"
import fsevents from "fsevents"
import { bunker } from "@digitak/bunker"
import { bunkerFile } from "@digitak/bunker/io"
import start from "fartest"
import print from "cute-print"
import Runner from "../source/runners/Runner"
import dotImport from "./samples/dotImport/dotImport"
import doubleDotImport from "./samples/dotImport/doubleDotImport"
import { foo } from "alias/foo"

start(async ({ stage, same, test }) => {
	stage("CLI arguments received")
	same(process.argv[3], "coco")

	stage("CLI arguments received [--watch is passed as argument]")
	same(process.argv[2], "--watch")

	stage("Import typescript library")
	same(ts.SyntaxKind.EndOfFileToken, 1)

	stage("Import fsevents")
	same(!!fsevents.watch, true)

	stage("Import CJS library")
	same(typeof print, "function")

	stage("Import ESM library")
	same(bunker(3), Uint8Array.of(5, 3))

	stage("Import specific file in library")
	same(typeof bunkerFile, "function")

	stage("Import custom typescript file")
	same(new Zabu().yell(), "ZABU")

	stage("Import another custom typescript file")
	same(coco, 11)

	stage("import '.' syntax")
	same(dotImport, 12)

	stage("import '..' syntax")
	same(doubleDotImport, 12)

	stage("File constants")
	{
		const runner = new Runner("test/samples/fileConstants")
		await runner.build()
		test(
			runner.outputCode.includes(
				`["/Users/Lepzulnag/Code/esrun/test/samples", "/Users/Lepzulnag/Code/esrun/test/samples/fileConstants.ts", "__dirname", "__filename"]`
			),
			"__filename and __dirname are transformed"
		)
	}

	stage("Use transformer")
	{
		const runner = new Runner("test/samples/coco")
		await runner.build()
		await runner.transform(content => content.replace("11", "12"))
		test(runner.outputCode.includes("12"), "Should export 12")
	}

	stage("Inter process communication")
	{
		const runner = new Runner("test/samples/ipc/child", {
			interProcessCommunication: true,
		})
		await runner.build()
		await runner.execute()
		same(runner.output, "Hello", "process.send")
	}

	stage("Build events")
	{
		const messages = <string[]>[]
		const runner = new Runner("test/samples/coco", {
			beforeRun: () => messages.push("beforeRun"),
			afterRun: () => messages.push("afterRun"),
		})
		await runner.build()
		await runner.execute()
		same(messages, ["beforeRun", "afterRun"])
	}

	stage("alias")
	{
		same(foo, "foo", "resolved alias not treated as a dependency")
	}
})
