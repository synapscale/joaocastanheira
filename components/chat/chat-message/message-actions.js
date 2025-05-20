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
exports.MessageActions = MessageActions;
var jsx_runtime_1 = require("react/jsx-runtime");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var tooltip_1 = require("@/components/ui/tooltip");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var _1 = require(".");
function MessageActions(_a) {
    var visible = _a.visible;
    var _b = (0, _1.useChatMessage)(), copied = _b.copied, liked = _b.liked, setLiked = _b.setLiked, copyToClipboard = _b.copyToClipboard, regenerateResponse = _b.regenerateResponse, focusMode = _b.focusMode;
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center ".concat(focusMode ? "justify-start" : "justify-end", " space-x-1 transition-opacity duration-200 ").concat(visible ? "opacity-100" : "opacity-0"), children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipProvider, { children: (0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150", onClick: copyToClipboard, children: copied ? ((0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "h-3.5 w-3.5 text-green-500" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { className: "h-3.5 w-3.5 text-gray-500 dark:text-gray-400" })) }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { children: copied ? "Copiado!" : "Copiar" })] }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipProvider, { children: (0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-7 w-7 rounded-full transition-colors duration-150 ".concat(liked === true
                                        ? "text-green-500 bg-green-50 dark:bg-green-900/30"
                                        : "hover:bg-gray-100 dark:hover:bg-gray-700"), onClick: function () { return setLiked(true); }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.ThumbsUp, { className: "h-3.5 w-3.5" }) }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { children: "Curtir" })] }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipProvider, { children: (0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-7 w-7 rounded-full transition-colors duration-150 ".concat(liked === false
                                        ? "text-red-500 bg-red-50 dark:bg-red-900/30"
                                        : "hover:bg-gray-100 dark:hover:bg-gray-700"), onClick: function () { return setLiked(false); }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.ThumbsDown, { className: "h-3.5 w-3.5" }) }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { children: "N\u00E3o curtir" })] }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipProvider, { children: (0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150", onClick: regenerateResponse, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Repeat, { className: "h-3.5 w-3.5 text-gray-500 dark:text-gray-400" }) }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { children: "Regenerar resposta" })] }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150", children: (0, jsx_runtime_1.jsx)(lucide_react_1.MoreVertical, { className: "h-3.5 w-3.5 text-gray-500 dark:text-gray-400" }) }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { align: "start", className: "w-48 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700", children: [(0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: copyToClipboard, className: "text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { className: "h-3.5 w-3.5 mr-2" }), " Copiar texto"] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: regenerateResponse, className: "text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Repeat, { className: "h-3.5 w-3.5 mr-2" }), " Regenerar resposta"] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: "text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20", children: [(0, jsx_runtime_1.jsx)(X, { className: "h-3.5 w-3.5 mr-2" }), " Descartar resposta"] })] })] })] }) }));
}
// Adicione o ícone X que está faltando
function X(props) {
    return ((0, jsx_runtime_1.jsxs)("svg", __assign({ xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, props, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M18 6 6 18" }), (0, jsx_runtime_1.jsx)("path", { d: "m6 6 12 12" })] })));
}
