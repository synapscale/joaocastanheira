"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatInput = ChatInput;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var use_textarea_1 = require("../../apps/ai-agents-sidebar/hooks/use-textarea");
function ChatInput(_a) {
    var onSendMessage = _a.onSendMessage, isLoading = _a.isLoading, disabled = _a.disabled, isDragOver = _a.isDragOver, onDragOver = _a.onDragOver, onDragLeave = _a.onDragLeave, onDrop = _a.onDrop;
    var chatAreaRef = (0, react_1.useRef)(null);
    var handleSubmit = function () {
        if (textarea.value.trim() && !isLoading && !disabled) {
            onSendMessage(textarea.value);
            textarea.resetTextarea();
        }
    };
    var textarea = (0, use_textarea_1.useTextarea)({
        onSubmit: handleSubmit,
    });
    return ((0, jsx_runtime_1.jsx)(card_1.Card, { className: "border ".concat(isDragOver ? "border-primary border-dashed bg-primary/5" : "border-gray-200 dark:border-gray-700", " rounded-xl overflow-hidden shadow-sm hover:shadow transition-shadow duration-200 bg-white dark:bg-gray-800"), onDragOver: onDragOver, onDragLeave: onDragLeave, onDrop: onDrop, ref: chatAreaRef, children: (0, jsx_runtime_1.jsx)("div", { className: "p-2", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("textarea", { ref: textarea.textareaRef, value: textarea.value, onChange: textarea.handleInput, onKeyDown: textarea.handleKeyDown, placeholder: isDragOver ? "Solte o componente aqui..." : "Digite sua mensagem aqui ou @ para chamar outro agente...", className: "w-full border-0 focus:ring-0 focus:outline-none resize-none p-3 pr-10 max-h-32 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 transition-colors duration-200 ".concat(isDragOver ? "border-2 border-dashed border-primary/50 bg-primary/5" : ""), style: { height: "auto" }, disabled: disabled, onDragOver: onDragOver, onDragLeave: onDragLeave, onDrop: onDrop }), (0, jsx_runtime_1.jsxs)("div", { className: "absolute right-2 bottom-2 flex items-center space-x-1", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Paperclip, { className: "h-5 w-5" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { size: "icon", className: "h-9 w-9 rounded-full bg-primary text-white hover:bg-primary/90 shadow-sm transition-all duration-200 hover:shadow", onClick: handleSubmit, disabled: !textarea.value.trim() || isLoading || disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Send, { className: "h-4 w-4" }) })] })] }) }) }));
}
