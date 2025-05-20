"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageTimestamp = MessageTimestamp;
var jsx_runtime_1 = require("react/jsx-runtime");
var utils_1 = require("@/lib/utils");
var utils_2 = require("./utils");
function MessageTimestamp(_a) {
    var timestamp = _a.timestamp, className = _a.className, _b = _a.isMobile, isMobile = _b === void 0 ? false : _b;
    return ((0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)("text-xs text-gray-400", isMobile ? "mt-1 md:hidden" : "hidden md:inline-block ml-2", className), children: (0, utils_2.formatTimestamp)(timestamp) }));
}
