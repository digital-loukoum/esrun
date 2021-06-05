import Watcher from "./Watcher.js";
export default class Inspector extends Watcher {
    get mode() {
        return "inspect";
    }
}
