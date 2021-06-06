"use strict";
process.on("message", (message) => {
    console.log("Received", message);
});
console.log("ZABU");
setTimeout(() => console.log("Process timeout"), 15000);
