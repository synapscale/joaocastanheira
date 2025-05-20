"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMessage = UserMessage;
var jsx_runtime_1 = require("react/jsx-runtime");
var avatar_1 = require("@/components/ui/avatar");
function UserMessage(_a) {
    var content = _a.content;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end my-4 group", "data-component": "ChatMessage", "data-component-path": "@/components/chat/chat-message", children: [(0, jsx_runtime_1.jsx)("div", { className: "max-w-3xl bg-primary/10 dark:bg-primary/20 rounded-2xl p-4 text-gray-800 dark:text-gray-200 shadow-sm border border-primary/5 dark:border-primary/10 transition-all duration-200", children: content }), (0, jsx_runtime_1.jsx)(avatar_1.Avatar, { className: "h-8 w-8 ml-3 bg-teal-600 text-white shadow-sm", children: (0, jsx_runtime_1.jsx)("span", { children: "J" }) })] }));
}
