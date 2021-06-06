process.on("message", (message: string) => {
	console.log("Received", message)
})

console.log("ZABU")

setTimeout(() => console.log("Process timeout"), 15_000)
