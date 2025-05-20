"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesArea = MessagesArea;
var jsx_runtime_1 = require("react/jsx-runtime");
var lucide_react_1 = require("lucide-react");
var chat_message_1 = __importDefault(require("./chat-message"));
function MessagesArea(_a) {
    var messages = _a.messages, isLoading = _a.isLoading, _b = _a.showTimestamps, showTimestamps = _b === void 0 ? true : _b, _c = _a.showSenders, showSenders = _c === void 0 ? true : _c, _d = _a.focusMode, focusMode = _d === void 0 ? false : _d, theme = _a.theme, chatBackground = _a.chatBackground, messagesEndRef = _a.messagesEndRef;
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex-1 overflow-y-auto p-4 scrollbar-thin", style: {
            backgroundImage: chatBackground
                ? typeof chatBackground === "string"
                    ? chatBackground
                    : undefined
                : theme === "light"
                    ? "radial-gradient(circle at center, rgba(243, 244, 246, 0.6) 0%, rgba(249, 250, 251, 0.3) 100%)"
                    : "radial-gradient(circle at center, rgba(31, 41, 55, 0.6) 0%, rgba(17, 24, 39, 0.3) 100%)",
            backgroundSize: "cover",
        }, children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-3xl mx-auto", children: [messages.map(function (message) { return ((0, jsx_runtime_1.jsx)(chat_message_1.default, { message: message, showTimestamp: showTimestamps, showSender: showSenders, focusMode: focusMode }, message.id)); }), isLoading && ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center mt-4 text-gray-500 animate-pulse", children: (0, jsx_runtime_1.jsx)("div", { className: "ml-12 bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-70 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Sparkles, { className: "h-4 w-4 text-primary" }), (0, jsx_runtime_1.jsx)("span", { className: "dark:text-gray-300", children: "Generating response..." })] }) }) })), (0, jsx_runtime_1.jsx)("div", { ref: messagesEndRef })] }) }));
}
