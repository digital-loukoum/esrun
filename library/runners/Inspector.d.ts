import type { Mode } from "../Mode.js";
import Watcher from "./Watcher.js";
export default class Inspector extends Watcher {
    get mode(): Mode;
}
