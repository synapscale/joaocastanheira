/**
 * ChatMessage Component
 *
 * Displays a single message in the chat interface, with support for
 * user and assistant messages, reactions, and various actions.
 */
"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChatMessage = useChatMessage;
exports.processMessageContent = processMessageContent;
exports.default = ChatMessage;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var tooltip_1 = require("@/components/ui/tooltip");
/**
 * Context provider for the ChatMessage component
 */
var ChatMessageContext = (0, react_1.createContext)(undefined);
/**
 * Hook to access the ChatMessage context
 */
function useChatMessage() {
    var context = (0, react_1.useContext)(ChatMessageContext);
    if (context === undefined) {
        throw new Error("useChatMessage must be used within a ChatMessageProvider");
    }
    return context;
}
/**
 * Process message content for display
 * @param content Raw message content
 * @returns Processed content
 */
function processMessageContent(content) {
    // Simple processing for now - could be expanded to handle markdown, code blocks, etc.
    return content;
}
/**
 * ChatMessage component
 */
function ChatMessage(_a) {
    var _b = _a.className, className = _b === void 0 ? "" : _b, style = _a.style, id = _a.id, _c = _a.disabled, disabled = _c === void 0 ? false : _c, dataAttributes = _a.dataAttributes, message = _a.message, _d = _a.showTimestamp, showTimestamp = _d === void 0 ? true : _d, _e = _a.showSender, showSender = _e === void 0 ? true : _e, _f = _a.showActions, initialShowActions = _f === void 0 ? true : _f, _g = _a.allowReactions, allowReactions = _g === void 0 ? true : _g, _h = _a.allowCopy, allowCopy = _h === void 0 ? true : _h, _j = _a.allowRegenerate, allowRegenerate = _j === void 0 ? true : _j, _k = _a.allowDelete, allowDelete = _k === void 0 ? false : _k, userAvatar = _a.userAvatar, assistantAvatar = _a.assistantAvatar, _l = _a.userName, userName = _l === void 0 ? "You" : _l, _m = _a.assistantName, assistantName = _m === void 0 ? "Assistant" : _m, contentRenderer = _a.contentRenderer, onCopy = _a.onCopy, onReaction = _a.onReaction, onRegenerate = _a.onRegenerate, onDelete = _a.onDelete;
    // SECTION: Local state
    var _o = (0, react_1.useState)(false), copied = _o[0], setCopied = _o[1];
    var _p = (0, react_1.useState)(message.reaction || null), reaction = _p[0], setReaction = _p[1];
    var _q = (0, react_1.useState)(initialShowActions), showActions = _q[0], setShowActions = _q[1];
    // SECTION: Event handlers
    /**
     * Copy message content to clipboard
     */
    var copyToClipboard = (0, react_1.useCallback)(function () {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(function () { return setCopied(false); }, 2000);
        onCopy === null || onCopy === void 0 ? void 0 : onCopy(message);
    }, [message, onCopy]);
    /**
     * Handle reaction to message
     */
    var handleReaction = (0, react_1.useCallback)(function (newReaction) {
        // Toggle reaction if clicking the same one
        var updatedReaction = reaction === newReaction ? null : newReaction;
        setReaction(updatedReaction);
        onReaction === null || onReaction === void 0 ? void 0 : onReaction(message, updatedReaction);
    }, [message, reaction, onReaction, setReaction, onReaction]);
    /**
     * Regenerate assistant response
     */
    var regenerateResponse = (0, react_1.useCallback)(function () {
        onRegenerate === null || onRegenerate === void 0 ? void 0 : onRegenerate(message);
    }, [message, onRegenerate]);
    /**
     * Delete message
     */
    var deleteMessage = (0, react_1.useCallback)(function () {
        onDelete === null || onDelete === void 0 ? void 0 : onDelete(message);
    }, [message, onDelete]);
    // SECTION: Render helpers
    /**
     * Format timestamp for display
     */
    var formattedTimestamp = (0, react_1.useMemo)(function () {
        if (!message.timestamp)
            return "";
        var date = new Date(message.timestamp);
        return new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        }).format(date);
    }, [message.timestamp]);
    // Prepare context value
    var contextValue = {
        message: message,
        copied: copied,
        setCopied: setCopied,
        reaction: reaction,
        setReaction: setReaction,
        showActions: showActions,
        setShowActions: setShowActions,
        copyToClipboard: copyToClipboard,
        regenerateResponse: regenerateResponse,
        deleteMessage: deleteMessage,
        onReaction: onReaction,
    };
    // Prepare data attributes
    var allDataAttributes = __assign({ "data-component": "ChatMessage", "data-component-path": "@/components/chat/chat-message", "data-message-role": message.role, "data-message-id": message.id }, (dataAttributes || {}));
    // SECTION: Render
    return ((0, jsx_runtime_1.jsx)(ChatMessageContext.Provider, { value: contextValue, children: (0, jsx_runtime_1.jsx)("div", __assign({ className: "flex mb-4 ".concat(message.role === "user" ? "justify-end" : "justify-start", " ").concat(className), style: style, id: id }, allDataAttributes, { children: message.role === "user" ? ((0, jsx_runtime_1.jsx)(UserMessage, { content: contentRenderer ? contentRenderer(message.content) : processMessageContent(message.content), timestamp: showTimestamp ? formattedTimestamp : undefined, senderName: showSender ? userName : undefined, avatar: userAvatar, allowCopy: allowCopy, allowDelete: allowDelete, disabled: disabled })) : ((0, jsx_runtime_1.jsx)(AssistantMessage, { content: contentRenderer ? contentRenderer(message.content) : processMessageContent(message.content), timestamp: showTimestamp ? formattedTimestamp : undefined, senderName: showSender ? assistantName : undefined, avatar: assistantAvatar, model: message.model, isError: message.isError, allowCopy: allowCopy, allowReactions: allowReactions, allowRegenerate: allowRegenerate, allowDelete: allowDelete, disabled: disabled })) })) }));
}
/**
 * UserMessage component
 */
function UserMessage(_a) {
    var content = _a.content, timestamp = _a.timestamp, senderName = _a.senderName, avatar = _a.avatar, _b = _a.allowCopy, allowCopy = _b === void 0 ? true : _b, _c = _a.allowDelete, allowDelete = _c === void 0 ? false : _c, _d = _a.disabled, disabled = _d === void 0 ? false : _d;
    var _e = useChatMessage(), copied = _e.copied, showActions = _e.showActions, copyToClipboard = _e.copyToClipboard, deleteMessage = _e.deleteMessage;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-end max-w-[80%]", children: [senderName && (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 mb-1", children: senderName }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-2", children: [showActions && ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-1 mt-2", children: [allowCopy && ((0, jsx_runtime_1.jsx)(tooltip_1.TooltipProvider, { children: (0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700", onClick: copyToClipboard, disabled: disabled, children: copied ? ((0, jsx_runtime_1.jsx)(lucide_react_1.Check, { className: "h-3 w-3 text-green-500" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { className: "h-3 w-3 text-gray-500" })) }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { side: "left", children: copied ? "Copied!" : "Copy message" })] }) })), allowDelete && ((0, jsx_runtime_1.jsx)(tooltip_1.TooltipProvider, { children: (0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700", onClick: deleteMessage, disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-3 w-3 text-gray-500" }) }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { side: "left", children: "Delete message" })] }) }))] })), (0, jsx_runtime_1.jsxs)("div", { className: "bg-primary text-primary-foreground p-3 rounded-lg shadow-sm", children: [(0, jsx_runtime_1.jsx)("div", { className: "whitespace-pre-wrap", children: content }), timestamp && (0, jsx_runtime_1.jsx)("div", { className: "text-xs opacity-70 mt-1 text-right", children: timestamp })] }), avatar || ((0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium", children: (senderName === null || senderName === void 0 ? void 0 : senderName[0]) || "U" }))] })] }));
}
/**
 * AssistantMessage component
 */
function AssistantMessage(_a) {
    var content = _a.content, timestamp = _a.timestamp, senderName = _a.senderName, avatar = _a.avatar, model = _a.model, _b = _a.isError, isError = _b === void 0 ? false : _b, _c = _a.allowCopy, allowCopy = _c === void 0 ? true : _c, _d = _a.allowReactions, allowReactions = _d === void 0 ? true : _d, _e = _a.allowRegenerate, allowRegenerate = _e === void 0 ? true : _e, _f = _a.allowDelete, allowDelete = _f === void 0 ? false : _f, _g = _a.disabled, disabled = _g === void 0 ? false : _g;
    var _h = useChatMessage(), copied = _h.copied, reaction = _h.reaction, setReaction = _h.setReaction, showActions = _h.showActions, copyToClipboard = _h.copyToClipboard, regenerateResponse = _h.regenerateResponse, deleteMessage = _h.deleteMessage, message = _h.message;
    /**
     * Handle reaction button click
     */
    var handleReaction = (0, react_1.useCallback)(function (newReaction) {
        var _a, _b;
        // Toggle reaction if clicking the same one
        var updatedReaction = reaction === newReaction ? null : newReaction;
        setReaction(updatedReaction);
        // Use the onReaction from context if available
        (_b = (_a = useChatMessage()).onReaction) === null || _b === void 0 ? void 0 : _b.call(_a, message, updatedReaction);
    }, [message, reaction, setReaction, useChatMessage, message]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-start max-w-[80%]", children: [senderName && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center text-xs text-gray-500 mb-1", children: [(0, jsx_runtime_1.jsx)("span", { children: senderName }), model && (0, jsx_runtime_1.jsxs)("span", { className: "ml-2 opacity-70", children: ["(", model, ")"] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-2", children: [avatar || ((0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-medium", children: (senderName === null || senderName === void 0 ? void 0 : senderName[0]) || "A" })), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border ".concat(isError ? "border-red-200 dark:border-red-900/50" : "border-gray-100 dark:border-gray-700"), children: [(0, jsx_runtime_1.jsx)("div", { className: "whitespace-pre-wrap", children: content }), timestamp && (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: timestamp })] }), showActions && ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-1 mt-2", children: [allowCopy && ((0, jsx_runtime_1.jsx)(tooltip_1.TooltipProvider, { children: (0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700", onClick: copyToClipboard, disabled: disabled, children: copied ? ((0, jsx_runtime_1.jsx)(lucide_react_1.Check, { className: "h-3 w-3 text-green-500" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { className: "h-3 w-3 text-gray-500" })) }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { side: "right", children: copied ? "Copied!" : "Copy message" })] }) })), allowReactions && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipProvider, { children: (0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6 rounded-full ".concat(reaction === "like"
                                                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                                            : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"), onClick: function () { return handleReaction("like"); }, disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.ThumbsUp, { className: "h-3 w-3" }) }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { side: "right", children: "Like" })] }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipProvider, { children: (0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6 rounded-full ".concat(reaction === "dislike"
                                                            ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                                            : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"), onClick: function () { return handleReaction("dislike"); }, disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.ThumbsDown, { className: "h-3 w-3" }) }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { side: "right", children: "Dislike" })] }) })] })), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipProvider, { children: (0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700", disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.MoreHorizontal, { className: "h-3 w-3 text-gray-500" }) }) }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { side: "right", children: "More options" })] }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "min-w-[160px]", children: [allowRegenerate && ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: regenerateResponse, disabled: disabled, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: "h-4 w-4 mr-2" }), "Regenerate"] })), allowDelete && ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: deleteMessage, disabled: disabled, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }), "Delete"] }))] })] })] }))] })] }));
}
