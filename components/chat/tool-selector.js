/**
 * ToolSelector Component
 *
 * A component for selecting tools to use with the AI assistant.
 * Displays available tools in categories and allows searching and selecting from recent tools.
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
exports.CATEGORY_NAMES = exports.DEFAULT_TOOLS = void 0;
exports.default = ToolSelector;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var popover_1 = require("@/components/ui/popover");
var scroll_area_1 = require("@/components/ui/scroll-area");
var tabs_1 = require("@/components/ui/tabs");
var input_1 = require("@/components/ui/input");
var app_context_1 = require("@/contexts/app-context");
/**
 * Default tools available in the selector
 */
exports.DEFAULT_TOOLS = [
    // Main tools
    {
        id: "no-tools",
        name: "No Tools",
        description: "Basic interaction without external tools",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { className: "h-4 w-4" }),
        type: "custom",
        category: "main",
    },
    {
        id: "gpt-search",
        name: "GPT Search",
        description: "Search the web using GPT",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "h-4 w-4" }),
        type: "search",
        category: "main",
    },
    {
        id: "internet",
        name: "Internet",
        description: "Access to real-time web searches",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Globe, { className: "h-4 w-4" }),
        type: "search",
        category: "main",
    },
    {
        id: "image-generation",
        name: "Image Generation",
        description: "Generate images from text descriptions",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.ImageIcon, { className: "h-4 w-4" }),
        type: "custom",
        isNew: true,
        isPaid: true,
        category: "main",
    },
    {
        id: "manage-files",
        name: "Manage Files",
        description: "Upload and analyze files",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { className: "h-4 w-4" }),
        type: "file",
        isNew: true,
        category: "main",
    },
    {
        id: "deep-analysis",
        name: "Deep Analysis",
        description: "In-depth analysis of data and text",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.BarChart2, { className: "h-4 w-4" }),
        type: "custom",
        isTrial: true,
        category: "main",
    },
    // Social media and websites
    {
        id: "twitter",
        name: "Twitter",
        description: "Access Twitter/X data",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Twitter, { className: "h-4 w-4" }),
        type: "api",
        category: "social",
    },
    {
        id: "wikipedia",
        name: "Wikipedia",
        description: "Search and query Wikipedia",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.BookOpen, { className: "h-4 w-4" }),
        type: "api",
        category: "social",
    },
    {
        id: "quora",
        name: "Quora",
        description: "Access Quora questions and answers",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.MessageCircle, { className: "h-4 w-4" }),
        type: "api",
        category: "social",
    },
    {
        id: "reddit",
        name: "Reddit",
        description: "Access Reddit content and discussions",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.MessageSquare, { className: "h-4 w-4" }),
        type: "api",
        category: "social",
    },
    {
        id: "medium",
        name: "Medium",
        description: "Access Medium articles",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Newspaper, { className: "h-4 w-4" }),
        type: "api",
        category: "social",
    },
    {
        id: "linkedin",
        name: "LinkedIn",
        description: "Access LinkedIn data",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Briefcase, { className: "h-4 w-4" }),
        type: "api",
        category: "social",
    },
    {
        id: "instagram",
        name: "Instagram",
        description: "Access Instagram content",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Instagram, { className: "h-4 w-4" }),
        type: "api",
        category: "social",
    },
    {
        id: "facebook",
        name: "Facebook",
        description: "Access Facebook data",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Facebook, { className: "h-4 w-4" }),
        type: "api",
        category: "social",
    },
];
/**
 * Category display names
 */
exports.CATEGORY_NAMES = {
    main: "Main Tools",
    social: "Social Media",
    productivity: "Productivity",
    development: "Development",
    other: "Other Tools",
};
/**
 * ToolSelector component
 */
function ToolSelector(_a) {
    var _b = _a.className, className = _b === void 0 ? "" : _b, style = _a.style, id = _a.id, _c = _a.disabled, disabled = _c === void 0 ? false : _c, dataAttributes = _a.dataAttributes, _d = _a.tools, tools = _d === void 0 ? exports.DEFAULT_TOOLS : _d, onToolSelect = _a.onToolSelect, _e = _a.size, size = _e === void 0 ? "sm" : _e, _f = _a.contentWidth, contentWidth = _f === void 0 ? "64" : _f, _g = _a.maxHeight, maxHeight = _g === void 0 ? "80" : _g, _h = _a.showSearch, showSearch = _h === void 0 ? true : _h, _j = _a.showTabs, showTabs = _j === void 0 ? true : _j, _k = _a.showDescriptions, showDescriptions = _k === void 0 ? true : _k, _l = _a.showBadges, showBadges = _l === void 0 ? true : _l, _m = _a.groupByCategory, groupByCategory = _m === void 0 ? true : _m, _o = _a.defaultTab, defaultTab = _o === void 0 ? "all" : _o, _p = _a.searchPlaceholder, searchPlaceholder = _p === void 0 ? "Search tools..." : _p, _q = _a.emptyStateText, emptyStateText = _q === void 0 ? "No tools found" : _q, _r = _a.noRecentToolsText, noRecentToolsText = _r === void 0 ? "No recent tools" : _r, buttonIcon = _a.buttonIcon, buttonLabel = _a.buttonLabel;
    // SECTION: Local state
    var _s = (0, react_1.useState)(false), isOpen = _s[0], setIsOpen = _s[1];
    var _t = (0, react_1.useState)(""), searchQuery = _t[0], setSearchQuery = _t[1];
    var _u = (0, react_1.useState)(defaultTab), activeTab = _u[0], setActiveTab = _u[1];
    // SECTION: Application context
    var _v = (0, app_context_1.useApp)(), selectedTool = _v.selectedTool, setSelectedTool = _v.setSelectedTool, userPreferences = _v.userPreferences;
    // SECTION: Derived data
    /**
     * Find the currently selected tool object
     */
    var selectedToolObj = (0, react_1.useMemo)(function () {
        return tools.find(function (tool) { return tool.name === selectedTool; }) || tools[0];
    }, [tools, selectedTool]);
    /**
     * Filter tools based on search query
     */
    var filteredTools = (0, react_1.useMemo)(function () {
        if (!searchQuery.trim())
            return tools;
        var query = searchQuery.toLowerCase();
        return tools.filter(function (tool) {
            return tool.name.toLowerCase().includes(query) ||
                (tool.description && tool.description.toLowerCase().includes(query)) ||
                (tool.category && tool.category.toLowerCase().includes(query));
        });
    }, [tools, searchQuery]);
    /**
     * Group tools by category
     */
    var toolsByCategory = (0, react_1.useMemo)(function () {
        if (!groupByCategory) {
            return { all: filteredTools };
        }
        return filteredTools.reduce(function (acc, tool) {
            var category = tool.category || "other";
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(tool);
            return acc;
        }, {});
    }, [filteredTools, groupByCategory]);
    /**
     * Check if there are recent tools
     */
    var hasRecentTools = (userPreferences === null || userPreferences === void 0 ? void 0 : userPreferences.recentTools) && userPreferences.recentTools.length > 0;
    /**
     * Get recent tools
     */
    var recentTools = (0, react_1.useMemo)(function () {
        if (!hasRecentTools)
            return [];
        return userPreferences.recentTools
            .map(function (toolName) { return tools.find(function (t) { return t.name === toolName; }); })
            .filter(function (tool) { return !!tool; });
    }, [tools, userPreferences.recentTools, hasRecentTools]);
    // SECTION: Event handlers
    /**
     * Handle tool selection
     */
    var handleSelectTool = (0, react_1.useCallback)(function (tool) {
        setSelectedTool(tool.name);
        onToolSelect === null || onToolSelect === void 0 ? void 0 : onToolSelect(tool);
        setIsOpen(false);
    }, [setSelectedTool, onToolSelect]);
    /**
     * Handle tab change
     */
    var handleTabChange = (0, react_1.useCallback)(function (value) {
        setActiveTab(value);
        setSearchQuery("");
    }, []);
    // Prepare data attributes
    var allDataAttributes = __assign({ "data-component": "ToolSelector", "data-component-path": "@/components/chat/tool-selector" }, (dataAttributes || {}));
    // SECTION: Render
    return ((0, jsx_runtime_1.jsxs)(popover_1.Popover, { open: isOpen, onOpenChange: setIsOpen, children: [(0, jsx_runtime_1.jsx)(popover_1.PopoverTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, __assign({ variant: "outline", size: size, className: "text-xs flex items-center gap-1 ".concat(size === "sm" ? "h-8" : size === "md" ? "h-9" : "h-10", " bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors duration-200 rounded-full ").concat(className), style: style, id: id, disabled: disabled }, allDataAttributes, { children: [buttonIcon || (selectedToolObj.icon && (0, jsx_runtime_1.jsx)("span", { className: "mr-1", children: selectedToolObj.icon })), buttonLabel || selectedTool, (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { className: "h-3 w-3 ml-1 text-gray-500 dark:text-gray-400" })] })) }), (0, jsx_runtime_1.jsx)(popover_1.PopoverContent, { className: "w-".concat(contentWidth, " p-0 border border-gray-100 dark:border-gray-700 shadow-lg rounded-xl bg-white dark:bg-gray-800 transition-colors duration-200"), align: "start", sideOffset: 4, children: showTabs ? ((0, jsx_runtime_1.jsxs)(tabs_1.Tabs, { defaultValue: defaultTab, value: activeTab, onValueChange: handleTabChange, children: [(0, jsx_runtime_1.jsxs)("div", { className: "border-b border-gray-100 dark:border-gray-700 px-3 py-2", children: [showSearch && ((0, jsx_runtime_1.jsxs)("div", { className: "relative mb-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: searchPlaceholder, value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9 h-9 text-sm rounded-full bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 focus:border-primary/30 focus:ring-primary/20" })] })), (0, jsx_runtime_1.jsxs)(tabs_1.TabsList, { className: "w-full grid grid-cols-2 h-9 rounded-full bg-gray-100 dark:bg-gray-700 p-1", children: [(0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "all", className: "rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm", children: "All" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "recent", className: "rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm", children: "Recent" })] })] }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "all", className: "mt-0", children: (0, jsx_runtime_1.jsx)(scroll_area_1.ScrollArea, { className: "h-".concat(maxHeight, " scrollbar-thin"), children: Object.keys(toolsByCategory).length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "p-4 text-center text-gray-500 dark:text-gray-400", children: emptyStateText })) : (Object.keys(toolsByCategory).map(function (category) { return ((0, jsx_runtime_1.jsxs)("div", { className: "py-2", children: [groupByCategory && ((0, jsx_runtime_1.jsx)("div", { className: "px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: exports.CATEGORY_NAMES[category] || category })), (0, jsx_runtime_1.jsx)("div", { className: "space-y-0.5", children: toolsByCategory[category].map(function (tool) { return ((0, jsx_runtime_1.jsxs)("button", { className: "w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors duration-200 ".concat(tool.name === selectedTool ? "bg-primary/5 dark:bg-primary/10" : ""), onClick: function () { return handleSelectTool(tool); }, disabled: disabled, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 mr-2", children: tool.icon }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-800 dark:text-gray-200 block", children: tool.name }), showDescriptions && tool.description && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs text-gray-500 dark:text-gray-400 block truncate max-w-[180px]", children: tool.description }))] })] }), showBadges && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-1", children: [tool.isNew && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full", children: "New" })), tool.isPaid && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full", children: "$" })), tool.isTrial && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full", children: "Trial" }))] }))] }, tool.id)); }) })] }, category)); })) }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "recent", className: "mt-0", children: (0, jsx_runtime_1.jsx)(scroll_area_1.ScrollArea, { className: "h-".concat(maxHeight, " scrollbar-thin"), children: !hasRecentTools ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center text-gray-500 dark:text-gray-400 py-12 flex flex-col items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" }), (0, jsx_runtime_1.jsx)("p", { children: noRecentToolsText }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs mt-1 max-w-[250px]", children: "Tools you use will appear here for quick access" })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "py-2 space-y-0.5", children: recentTools.map(function (tool) { return ((0, jsx_runtime_1.jsxs)("button", { className: "w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors duration-200 ".concat(tool.name === selectedTool ? "bg-primary/5 dark:bg-primary/10" : ""), onClick: function () { return handleSelectTool(tool); }, disabled: disabled, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 mr-2", children: tool.icon }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-800 dark:text-gray-200 block", children: tool.name }), showDescriptions && tool.description && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs text-gray-500 dark:text-gray-400 block truncate max-w-[180px]", children: tool.description }))] })] }), showBadges && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-1", children: [tool.isNew && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full", children: "New" })), tool.isPaid && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full", children: "$" })), tool.isTrial && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full", children: "Trial" }))] }))] }, tool.id)); }) })) }) })] })) : (
                // Simple view without tabs
                (0, jsx_runtime_1.jsxs)("div", { children: [showSearch && ((0, jsx_runtime_1.jsxs)("div", { className: "relative px-3 py-2 border-b border-gray-100 dark:border-gray-700", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: searchPlaceholder, value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9 h-9 text-sm rounded-full bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 focus:border-primary/30 focus:ring-primary/20" })] })), (0, jsx_runtime_1.jsx)(scroll_area_1.ScrollArea, { className: "h-".concat(maxHeight, " scrollbar-thin"), children: Object.keys(toolsByCategory).length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "p-4 text-center text-gray-500 dark:text-gray-400", children: emptyStateText })) : (Object.keys(toolsByCategory).map(function (category) { return ((0, jsx_runtime_1.jsxs)("div", { className: "py-2", children: [groupByCategory && ((0, jsx_runtime_1.jsx)("div", { className: "px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: exports.CATEGORY_NAMES[category] || category })), (0, jsx_runtime_1.jsx)("div", { className: "space-y-0.5", children: toolsByCategory[category].map(function (tool) { return ((0, jsx_runtime_1.jsxs)("button", { className: "w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors duration-200 ".concat(tool.name === selectedTool ? "bg-primary/5 dark:bg-primary/10" : ""), onClick: function () { return handleSelectTool(tool); }, disabled: disabled, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 mr-2", children: tool.icon }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-800 dark:text-gray-200 block", children: tool.name }), showDescriptions && tool.description && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs text-gray-500 dark:text-gray-400 block truncate max-w-[180px]", children: tool.description }))] })] }), showBadges && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-1", children: [tool.isNew && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full", children: "New" })), tool.isPaid && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full", children: "$" })), tool.isTrial && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full", children: "Trial" }))] }))] }, tool.id)); }) })] }, category)); })) })] })) })] }));
}
