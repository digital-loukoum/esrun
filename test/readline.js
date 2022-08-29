// test/readline.ts
import readline from "readline"
async function input(msg) {
	return new Promise(resolve => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		})
		rl.question(msg, answer => {
			rl.close()
			resolve(answer)
		})
	})
}
try {
	console.log(await input("test"))
} catch (error) {
	console.log("error", error)
}
