
// When using readline or any other command line input library (I tested prompt-sync, cli-select, inquirer, prompts and readline) the program instantly exits without any errors

// here's some code that results in the issue

// main.ts
import readline from 'readline'

async function input(msg: string): Promise<string> {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })
        rl.question(msg, (answer) => {
            rl.close()
            resolve(answer)
        } )
    } )
}

try {
	console.log(await input("test"))
} catch (error) {
	console.log("error", error)
}

// input("test").then(() => {
// 	console.log("This line will never be printed")
// })

