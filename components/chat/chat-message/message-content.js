"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageContent = MessageContent;
var jsx_runtime_1 = require("react/jsx-runtime");
var utils_1 = require("@/lib/utils");
function MessageContent(_a) {
    var message = _a.message, children = _a.children, className = _a.className;
    var isUserMessage = message.role === "user";
    var isError = message.isError;
    return ((0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)("rounded-2xl p-4 shadow-sm border transition-colors duration-200", isUserMessage
            ? "bg-primary/10 dark:bg-primary/20 text-gray-800 dark:text-gray-200 border-primary/5 dark:border-primary/10"
            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-100 dark:border-gray-700", isError && "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30", className), children: children }));
}
