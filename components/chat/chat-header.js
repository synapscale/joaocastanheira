/**
 * ChatHeader Component
 *
 * Displays the header of the chat interface with conversation title and actions.
 *
 * @ai-pattern header-component
 * Header component with action buttons and conversation title
 */
"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatHeader = ChatHeader;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var icon_button_1 = require("@/components/ui/icon-button");
var lucide_react_1 = require("lucide-react");
var app_context_1 = require("@/contexts/app-context");
var conversation_header_1 = __importDefault(require("./conversation-header"));
/**
 * ChatHeader component
 * @param props Component props
 * @returns ChatHeader component
 */
function ChatHeader(_a) {
    var currentConversation = _a.currentConversation, currentConversationId = _a.currentConversationId, onNewConversation = _a.onNewConversation, onUpdateConversationTitle = _a.onUpdateConversationTitle, onDeleteConversation = _a.onDeleteConversation, onExportConversation = _a.onExportConversation, onToggleSidebar = _a.onToggleSidebar, onToggleComponentSelector = _a.onToggleComponentSelector, onToggleFocusMode = _a.onToggleFocusMode;
    var _b = (0, app_context_1.useApp)(), showConfig = _b.showConfig, setShowConfig = _b.setShowConfig, isComponentSelectorActive = _b.isComponentSelectorActive, focusMode = _b.focusMode, setFocusMode = _b.setFocusMode;
    /**
     * Handle focus mode toggle
     */
    var handleToggleFocusMode = function () {
        if (onToggleFocusMode) {
            onToggleFocusMode();
        }
        else if (setFocusMode) {
            setFocusMode(!focusMode);
        }
    };
    /**
     * Conversation title display
     */
    var conversationTitleDisplay = (0, react_1.useMemo)(function () {
        if (!currentConversation)
            return null;
        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-2 h-2 bg-green-400 rounded-full mr-2" }), (0, jsx_runtime_1.jsx)("h2", { className: "font-medium text-sm truncate ml-1 text-gray-700 dark:text-gray-200", children: currentConversation.title })] }));
    }, [currentConversation]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between p-3 sticky top-0 z-10 transition-colors duration-200", "data-component": "ChatHeader", "data-component-path": "@/components/chat/chat-header", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(icon_button_1.IconButton, { icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Menu, { className: "h-5 w-5 text-gray-600 dark:text-gray-300" }), className: "md:hidden mr-2", onClick: onToggleSidebar, "aria-label": "Toggle sidebar" }), (0, jsx_runtime_1.jsx)(icon_button_1.IconButton, { icon: (0, jsx_runtime_1.jsx)(lucide_react_1.PlusCircle, { className: "h-5 w-5 text-gray-600 dark:text-gray-300" }), tooltip: "Nova conversa", className: "md:hidden", onClick: onNewConversation, "aria-label": "New conversation" }), conversationTitleDisplay] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(icon_button_1.IconButton, { icon: focusMode ? ((0, jsx_runtime_1.jsx)(lucide_react_1.EyeOff, { className: "h-5 w-5 text-gray-600 dark:text-gray-300" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "h-5 w-5 text-gray-600 dark:text-gray-300" })), tooltip: focusMode ? "Exit Focus Mode" : "Enter Focus Mode", className: focusMode ? "bg-primary/10 text-primary" : "", onClick: handleToggleFocusMode, "aria-label": focusMode ? "Exit focus mode" : "Enter focus mode", "aria-pressed": focusMode }), onToggleComponentSelector && ((0, jsx_runtime_1.jsx)(icon_button_1.IconButton, { icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Layers, { className: "h-5 w-5 text-gray-600 dark:text-gray-300" }), tooltip: "Seletor de Componentes", className: isComponentSelectorActive ? "bg-primary/10 text-primary" : "", onClick: onToggleComponentSelector, "aria-label": "Toggle component selector", "aria-pressed": isComponentSelectorActive })), currentConversation && ((0, jsx_runtime_1.jsx)(conversation_header_1.default, { conversation: currentConversation, onUpdateTitle: onUpdateConversationTitle, onDeleteConversation: function () { return currentConversationId && onDeleteConversation(currentConversationId); }, onExportConversation: onExportConversation }))] })] }));
}
