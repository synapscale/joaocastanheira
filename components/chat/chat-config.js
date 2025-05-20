"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatConfig = ChatConfig;
var jsx_runtime_1 = require("react/jsx-runtime");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var model_selector_sidebar_1 = __importDefault(require("./model-selector-sidebar"));
var tool_selector_1 = __importDefault(require("./tool-selector"));
var personality_selector_1 = __importDefault(require("./personality-selector"));
var preset_selector_1 = __importDefault(require("./preset-selector"));
function ChatConfig(_a) {
    var showConfig = _a.showConfig, onToggleConfig = _a.onToggleConfig;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [showConfig && ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap items-center gap-2 mt-3 px-2 animate-in", children: [(0, jsx_runtime_1.jsx)(model_selector_sidebar_1.default, {}), (0, jsx_runtime_1.jsx)(tool_selector_1.default, {}), (0, jsx_runtime_1.jsx)(personality_selector_1.default, {}), (0, jsx_runtime_1.jsx)(preset_selector_1.default, {})] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center mt-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "ghost", size: "sm", className: "text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full px-3", onClick: onToggleConfig, children: [showConfig ? "Ocultar" : "Mostrar", " Configura\u00E7\u00F5es", (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { className: "h-3 w-3 transition-transform duration-200 ".concat(showConfig ? "rotate-180" : "") })] }), (0, jsx_runtime_1.jsx)("div", { className: "ml-auto", children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", className: "text-xs text-primary flex items-center gap-1 hover:bg-primary/5 dark:hover:bg-primary/10 rounded-full px-3", children: "Tutorial" }) })] })] }));
}
