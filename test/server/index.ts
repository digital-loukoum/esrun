import polka from "polka"
import { message } from "./message"

const port = 3000

polka()
	.get("/", (_, response) => response.end(message))
	.listen(port, (error: Error) => {
		if (error) throw error
		console.log(`> Running on localhost:${port}`)
	})
