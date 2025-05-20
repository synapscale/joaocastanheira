/**
 * ConversationHeader Component
 *
 * Displays the header for a conversation with options to edit the title,
 * delete the conversation, and export the conversation data.
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
exports.default = ConversationHeader;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var input_1 = require("@/components/ui/input");
var app_context_1 = require("@/contexts/app-context");
/**
 * ConversationHeader component
 */
function ConversationHeader(_a) {
    var _b = _a.className, className = _b === void 0 ? "" : _b, style = _a.style, id = _a.id, _c = _a.disabled, disabled = _c === void 0 ? false : _c, dataAttributes = _a.dataAttributes, conversation = _a.conversation, onUpdateTitle = _a.onUpdateTitle, onDeleteConversation = _a.onDeleteConversation, onExportConversation = _a.onExportConversation, onShareConversation = _a.onShareConversation, _d = _a.allowTitleEdit, allowTitleEdit = _d === void 0 ? true : _d, _e = _a.allowDelete, allowDelete = _e === void 0 ? true : _e, _f = _a.allowExport, allowExport = _f === void 0 ? true : _f, _g = _a.allowShare, allowShare = _g === void 0 ? true : _g, _h = _a.allowFavorite, allowFavorite = _h === void 0 ? true : _h, _j = _a.maxTitleLength, maxTitleLength = _j === void 0 ? 50 : _j;
    // SECTION: Local state
    var _k = (0, react_1.useState)(false), isEditing = _k[0], setIsEditing = _k[1];
    var _l = (0, react_1.useState)(conversation.title), title = _l[0], setTitle = _l[1];
    // SECTION: References
    var inputRef = (0, react_1.useRef)(null);
    // SECTION: Application context
    var toggleFavoriteConversation = (0, app_context_1.useApp)().toggleFavoriteConversation;
    // SECTION: Effects
    /**
     * Focus the input when editing starts
     */
    (0, react_1.useEffect)(function () {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);
    /**
     * Update local title when conversation changes
     */
    (0, react_1.useEffect)(function () {
        setTitle(conversation.title);
    }, [conversation.title]);
    // SECTION: Event handlers
    /**
     * Start editing the title
     */
    var handleStartEditing = (0, react_1.useCallback)(function () {
        if (!allowTitleEdit || disabled)
            return;
        setIsEditing(true);
    }, [allowTitleEdit, disabled]);
    /**
     * Save the edited title
     */
    var handleSaveTitle = (0, react_1.useCallback)(function () {
        if (!title.trim()) {
            setTitle(conversation.title);
        }
        else if (title !== conversation.title) {
            onUpdateTitle === null || onUpdateTitle === void 0 ? void 0 : onUpdateTitle(title);
        }
        setIsEditing(false);
    }, [title, conversation.title, onUpdateTitle]);
    /**
     * Cancel editing the title
     */
    var handleCancelEditing = (0, react_1.useCallback)(function () {
        setTitle(conversation.title);
        setIsEditing(false);
    }, [conversation.title]);
    /**
     * Handle key press in the title input
     */
    var handleKeyDown = (0, react_1.useCallback)(function (e) {
        if (e.key === "Enter") {
            handleSaveTitle();
        }
        else if (e.key === "Escape") {
            handleCancelEditing();
        }
    }, [handleSaveTitle, handleCancelEditing]);
    /**
     * Toggle favorite status
     */
    var handleToggleFavorite = (0, react_1.useCallback)(function () {
        toggleFavoriteConversation(conversation.id);
    }, [conversation.id, toggleFavoriteConversation]);
    // Prepare data attributes
    var allDataAttributes = __assign({ "data-component": "ConversationHeader", "data-component-path": "@/components/chat/conversation-header" }, (dataAttributes || {}));
    // SECTION: Render
    return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "flex items-center ".concat(className), style: style, id: id }, allDataAttributes, { children: [isEditing ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { ref: inputRef, value: title, onChange: function (e) { return setTitle(e.target.value.slice(0, maxTitleLength)); }, onKeyDown: handleKeyDown, className: "h-8 text-sm", disabled: disabled }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center ml-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700", onClick: handleSaveTitle, disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Check, { className: "h-3.5 w-3.5 text-green-500" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700", onClick: handleCancelEditing, disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-3.5 w-3.5 text-red-500" }) })] })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-medium text-sm truncate max-w-[200px] text-gray-700 dark:text-gray-200", onClick: handleStartEditing, children: title }), allowTitleEdit && ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ml-1", onClick: handleStartEditing, disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit2, { className: "h-3.5 w-3.5 text-gray-500 dark:text-gray-400" }) }))] })), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ml-2", disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.MoreHorizontal, { className: "h-4 w-4 text-gray-500 dark:text-gray-400" }) }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-48", children: [allowFavorite && ((0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuItem, { onClick: handleToggleFavorite, disabled: disabled, children: conversation.isFavorite ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.StarOff, { className: "h-4 w-4 mr-2" }), "Remove from favorites"] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Star, { className: "h-4 w-4 mr-2" }), "Add to favorites"] })) })), allowExport && ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: onExportConversation, disabled: disabled, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { className: "h-4 w-4 mr-2" }), "Export conversation"] })), allowShare && ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: onShareConversation, disabled: disabled, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Share2, { className: "h-4 w-4 mr-2" }), "Share conversation"] })), allowDelete && ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: onDeleteConversation, disabled: disabled, className: "text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }), "Delete conversation"] }))] })] })] })));
}
