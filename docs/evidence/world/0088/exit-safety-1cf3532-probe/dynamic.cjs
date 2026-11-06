"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeAfterEdit = safeAfterEdit;
const exit_safety_1 = require("./exit-safety.cjs");
function safeAfterEdit(_before, after, position) {
    return (0, exit_safety_1.safeExitPosition)(after, position);
}
