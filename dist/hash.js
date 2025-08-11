"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.digest = digest;
const crypto_1 = require("crypto");
function digest(input, algo) {
    if (algo === "none") {
        return Buffer.from(input, "utf8");
    }
    return (0, crypto_1.createHash)(algo).update(input).digest();
}
