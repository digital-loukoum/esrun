import type { Mode } from "../Mode"
import Watcher from "./Watcher"

export default class Inspector extends Watcher {
	get mode(): Mode {
		return "inspect"
	}
}
