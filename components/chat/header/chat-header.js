"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatHeader = ChatHeader;
var jsx_runtime_1 = require("react/jsx-runtime");
var conversation_title_1 = require("./conversation-title");
var header_actions_1 = require("./header-actions");
var conversation_header_1 = __importDefault(require("../conversation-header"));
function ChatHeader(_a) {
    var currentConversation = _a.currentConversation, currentConversationId = _a.currentConversationId, onNewConversation = _a.onNewConversation, onUpdateConversationTitle = _a.onUpdateConversationTitle, onDeleteConversation = _a.onDeleteConversation, onExportConversation = _a.onExportConversation, onToggleSidebar = _a.onToggleSidebar, showComponentSelector = _a.showComponentSelector, onToggleComponentSelector = _a.onToggleComponentSelector;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between p-3 sticky top-0 z-10 transition-colors duration-200", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center", children: currentConversation && (0, jsx_runtime_1.jsx)(conversation_title_1.ConversationTitle, { title: currentConversation.title }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(header_actions_1.HeaderActions, { onNewChat: onNewConversation, onToggleSidebar: onToggleSidebar, showComponentSelector: showComponentSelector, onToggleComponentSelector: onToggleComponentSelector, isMobile: true }), currentConversation && ((0, jsx_runtime_1.jsx)("div", { className: "mr-4", children: (0, jsx_runtime_1.jsx)(conversation_header_1.default, { conversation: currentConversation, onUpdateTitle: onUpdateConversationTitle, onDeleteConversation: function () { return currentConversationId && onDeleteConversation(currentConversationId); }, onExportConversation: onExportConversation }) }))] })] }));
}
