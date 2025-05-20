/**
 * HeaderActions Component
 *
 * Displays action buttons in the chat header for creating new chats,
 * accessing settings, and other global actions.
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
exports.default = HeaderActions;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var tooltip_1 = require("@/components/ui/tooltip");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var app_context_1 = require("@/contexts/app-context");
/**
 * HeaderActions component
 */
function HeaderActions(_a) {
    var _b = _a.className, className = _b === void 0 ? "" : _b, style = _a.style, id = _a.id, _c = _a.disabled, disabled = _c === void 0 ? false : _c, dataAttributes = _a.dataAttributes, onNewChat = _a.onNewChat, onOpenSettings = _a.onOpenSettings, onOpenHelp = _a.onOpenHelp, onToggleSidebar = _a.onToggleSidebar, _d = _a.showNewChatButton, showNewChatButton = _d === void 0 ? true : _d, _e = _a.showSettingsButton, showSettingsButton = _e === void 0 ? true : _e, _f = _a.showHelpButton, showHelpButton = _f === void 0 ? true : _f, _g = _a.showThemeToggle, showThemeToggle = _g === void 0 ? true : _g, _h = _a.showSidebarToggle, showSidebarToggle = _h === void 0 ? true : _h, _j = _a.size, size = _j === void 0 ? "sm" : _j, _k = _a.newChatButtonVariant, newChatButtonVariant = _k === void 0 ? "default" : _k, _l = _a.newChatButtonText, newChatButtonText = _l === void 0 ? "New Chat" : _l, _m = _a.showTooltips, showTooltips = _m === void 0 ? true : _m;
    // SECTION: Application context
    var _o = (0, app_context_1.useApp)(), theme = _o.theme, setTheme = _o.setTheme, isSidebarOpen = _o.isSidebarOpen, setIsSidebarOpen = _o.setIsSidebarOpen;
    // SECTION: Event handlers
    /**
     * Toggle between light and dark themes
     */
    var toggleTheme = (0, react_1.useCallback)(function () {
        setTheme(theme === "light" ? "dark" : "light");
    }, [theme, setTheme]);
    /**
     * Toggle sidebar visibility
     */
    var toggleSidebar = (0, react_1.useCallback)(function () {
        setIsSidebarOpen(!isSidebarOpen);
        onToggleSidebar === null || onToggleSidebar === void 0 ? void 0 : onToggleSidebar();
    }, [isSidebarOpen, setIsSidebarOpen, onToggleSidebar]);
    // SECTION: Size mappings
    var sizeClasses = {
        sm: "h-8",
        md: "h-9",
        lg: "h-10",
    };
    var iconSizes = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
    };
    // Prepare data attributes
    var allDataAttributes = __assign({ "data-component": "HeaderActions", "data-component-path": "@/components/chat/header-actions" }, (dataAttributes || {}));
    // SECTION: Render
    return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "flex items-center space-x-2 ".concat(className), style: style, id: id }, allDataAttributes, { children: [showNewChatButton &&
                (showTooltips ? ((0, jsx_runtime_1.jsx)(tooltip_1.TooltipProvider, { children: (0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: newChatButtonVariant, size: size, className: "".concat(sizeClasses[size], " ").concat(newChatButtonVariant === "default" ? "bg-primary hover:bg-primary/90" : ""), onClick: onNewChat, disabled: disabled, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.PlusCircle, { className: "".concat(iconSizes[size], " ").concat(newChatButtonText ? "mr-2" : "") }), newChatButtonText] }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { children: "Start a new chat" })] }) })) : ((0, jsx_runtime_1.jsxs)(button_1.Button, { variant: newChatButtonVariant, size: size, className: "".concat(sizeClasses[size], " ").concat(newChatButtonVariant === "default" ? "bg-primary hover:bg-primary/90" : ""), onClick: onNewChat, disabled: disabled, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.PlusCircle, { className: "".concat(iconSizes[size], " ").concat(newChatButtonText ? "mr-2" : "") }), newChatButtonText] }))), showThemeToggle &&
                (showTooltips ? ((0, jsx_runtime_1.jsx)(tooltip_1.TooltipProvider, { children: (0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "".concat(sizeClasses[size], " rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"), onClick: toggleTheme, disabled: disabled, children: theme === "light" ? (0, jsx_runtime_1.jsx)(lucide_react_1.Moon, { className: iconSizes[size] }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Sun, { className: iconSizes[size] }) }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { children: theme === "light" ? "Dark mode" : "Light mode" })] }) })) : ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "".concat(sizeClasses[size], " rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"), onClick: toggleTheme, disabled: disabled, children: theme === "light" ? (0, jsx_runtime_1.jsx)(lucide_react_1.Moon, { className: iconSizes[size] }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Sun, { className: iconSizes[size] }) }))), showHelpButton &&
                (showTooltips ? ((0, jsx_runtime_1.jsx)(tooltip_1.TooltipProvider, { children: (0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "".concat(sizeClasses[size], " rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"), onClick: onOpenHelp, disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.HelpCircle, { className: iconSizes[size] }) }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { children: "Help" })] }) })) : ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "".concat(sizeClasses[size], " rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"), onClick: onOpenHelp, disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.HelpCircle, { className: iconSizes[size] }) }))), showSettingsButton && ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [showTooltips ? ((0, jsx_runtime_1.jsx)(tooltip_1.TooltipProvider, { children: (0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "".concat(sizeClasses[size], " rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"), disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { className: iconSizes[size] }) }) }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { children: "Settings" })] }) })) : ((0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "".concat(sizeClasses[size], " rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"), disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { className: iconSizes[size] }) }) })), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-48", children: [(0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: onOpenSettings, disabled: disabled, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { className: "h-4 w-4 mr-2" }), "Settings"] }), (0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuItem, { onClick: toggleTheme, disabled: disabled, children: theme === "light" ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Moon, { className: "h-4 w-4 mr-2" }), "Dark mode"] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Sun, { className: "h-4 w-4 mr-2" }), "Light mode"] })) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: onOpenHelp, disabled: disabled, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.HelpCircle, { className: "h-4 w-4 mr-2" }), "Help & FAQ"] })] })] })), showSidebarToggle &&
                (showTooltips ? ((0, jsx_runtime_1.jsx)(tooltip_1.TooltipProvider, { children: (0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "".concat(sizeClasses[size], " rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"), onClick: toggleSidebar, disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Menu, { className: iconSizes[size] }) }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { children: "Toggle sidebar" })] }) })) : ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "".concat(sizeClasses[size], " rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"), onClick: toggleSidebar, disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Menu, { className: iconSizes[size] }) })))] })));
}
