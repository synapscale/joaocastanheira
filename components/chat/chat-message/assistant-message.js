"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantMessage = AssistantMessage;
var jsx_runtime_1 = require("react/jsx-runtime");
var avatar_1 = require("@/components/ui/avatar");
var _1 = require(".");
var message_actions_1 = require("./message-actions");
function AssistantMessage(_a) {
    var content = _a.content;
    var _b = (0, _1.useChatMessage)(), message = _b.message, showActions = _b.showActions, setShowActions = _b.setShowActions;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex my-4 group", onMouseEnter: function () { return setShowActions(true); }, onMouseLeave: function () { return setShowActions(false); }, "data-component": "ChatMessage", "data-component-path": "@/components/chat/chat-message", children: [(0, jsx_runtime_1.jsx)(avatar_1.Avatar, { className: "h-8 w-8 mr-3 bg-gradient-to-br from-primary to-purple-500 shadow-sm", children: (0, jsx_runtime_1.jsx)("span", { children: "AI" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center mb-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium text-sm text-gray-700 dark:text-gray-300", children: "Tess AI v5" }), message.model && ((0, jsx_runtime_1.jsx)("span", { className: "ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full transition-colors duration-200", children: message.model }))] }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white dark:bg-gray-800 rounded-2xl p-4 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200", children: content }), (0, jsx_runtime_1.jsx)(message_actions_1.MessageActions, { visible: showActions })] })] }));
}
