/**
 * PersonalitySelector Component
 *
 * A component for selecting AI assistant personalities.
 * Displays available personalities and allows searching and selecting from recent personalities.
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
exports.DEFAULT_PERSONALITIES = void 0;
exports.default = PersonalitySelector;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var popover_1 = require("@/components/ui/popover");
var tabs_1 = require("@/components/ui/tabs");
var input_1 = require("@/components/ui/input");
var app_context_1 = require("@/contexts/app-context");
var scroll_area_1 = require("@/components/ui/scroll-area");
/**
 * Default personalities available in the selector
 */
exports.DEFAULT_PERSONALITIES = [
    {
        id: "systematic",
        name: "Systematic",
        description: "Structured and methodical responses, focused on clear processes and steps.",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Brain, { className: "h-4 w-4" }),
        systemPrompt: "You are a systematic assistant that provides structured and methodical responses. Organize your answers in clear steps and use numbered lists when appropriate. Be precise and detailed in your explanations.",
    },
    {
        id: "objective",
        name: "Objective",
        description: "Direct and factual responses, without opinions or unnecessary elaboration.",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Compass, { className: "h-4 w-4" }),
        systemPrompt: "You are an objective assistant that provides direct and factual responses. Avoid personal opinions and unnecessary elaboration. Be concise and to the point, prioritizing verifiable facts.",
    },
    {
        id: "natural",
        name: "Natural",
        description: "Conversational and balanced tone.",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Sparkles, { className: "h-4 w-4" }),
        systemPrompt: "You are an assistant with a natural conversational tone. Communicate in a friendly and accessible way, as in a normal conversation between people. Maintain a balance between being informative and conversational.",
    },
    {
        id: "creative",
        name: "Creative",
        description: "Responses with innovative approaches and lateral thinking.",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Lightbulb, { className: "h-4 w-4" }),
        systemPrompt: "You are a creative assistant that offers innovative approaches and lateral thinking. Explore unconventional possibilities, make unexpected connections, and offer original perspectives. Encourage creative thinking in your responses.",
    },
    {
        id: "imaginative",
        name: "Imaginative",
        description: "Expansive and exploratory responses, with hypothetical scenarios and analogies.",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Palette, { className: "h-4 w-4" }),
        systemPrompt: "You are an imaginative assistant that provides expansive and exploratory responses. Use hypothetical scenarios, vivid analogies, and illustrative examples. Explore possibilities and help the user visualize concepts in a rich and detailed manner.",
    },
    {
        id: "technical",
        name: "Technical",
        description: "Detailed responses with focus on technical aspects and precision.",
        icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Zap, { className: "h-4 w-4" }),
        systemPrompt: "You are a technical assistant that provides detailed responses with focus on technical aspects and precision. Use specific terminology, cite sources when relevant, and provide in-depth explanations. Prioritize technical accuracy in all your responses.",
    },
];
/**
 * PersonalitySelector component
 */
function PersonalitySelector(_a) {
    var _b = _a.className, className = _b === void 0 ? "" : _b, style = _a.style, id = _a.id, _c = _a.disabled, disabled = _c === void 0 ? false : _c, dataAttributes = _a.dataAttributes, _d = _a.personalities, personalities = _d === void 0 ? exports.DEFAULT_PERSONALITIES : _d, onPersonalitySelect = _a.onPersonalitySelect, _e = _a.size, size = _e === void 0 ? "sm" : _e, _f = _a.contentWidth, contentWidth = _f === void 0 ? "64" : _f, _g = _a.maxHeight, maxHeight = _g === void 0 ? "80" : _g, _h = _a.showSearch, showSearch = _h === void 0 ? true : _h, _j = _a.showTabs, showTabs = _j === void 0 ? true : _j, _k = _a.showDescriptions, showDescriptions = _k === void 0 ? true : _k, _l = _a.defaultTab, defaultTab = _l === void 0 ? "all" : _l, _m = _a.searchPlaceholder, searchPlaceholder = _m === void 0 ? "Search personalities..." : _m, _o = _a.emptyStateText, emptyStateText = _o === void 0 ? "No personalities found" : _o, _p = _a.noRecentPersonalitiesText, noRecentPersonalitiesText = _p === void 0 ? "No recent personalities" : _p, _q = _a.buttonIcon, buttonIcon = _q === void 0 ? (0, jsx_runtime_1.jsx)(lucide_react_1.Sparkles, { className: "h-3.5 w-3.5 text-amber-500 dark:text-amber-400 mr-0.5" }) : _q, buttonLabel = _a.buttonLabel;
    // SECTION: Local state
    var _r = (0, react_1.useState)(false), isOpen = _r[0], setIsOpen = _r[1];
    var _s = (0, react_1.useState)(""), searchQuery = _s[0], setSearchQuery = _s[1];
    var _t = (0, react_1.useState)(defaultTab), activeTab = _t[0], setActiveTab = _t[1];
    // SECTION: Application context
    var _u = (0, app_context_1.useApp)(), selectedPersonality = _u.selectedPersonality, setSelectedPersonality = _u.setSelectedPersonality, userPreferences = _u.userPreferences;
    // SECTION: Derived data
    /**
     * Filter personalities based on search query
     */
    var filteredPersonalities = (0, react_1.useMemo)(function () {
        if (!searchQuery.trim())
            return personalities;
        var query = searchQuery.toLowerCase();
        return personalities.filter(function (personality) {
            return personality.name.toLowerCase().includes(query) || personality.description.toLowerCase().includes(query);
        });
    }, [personalities, searchQuery]);
    /**
     * Find the currently selected personality object
     */
    var selectedPersonalityObj = (0, react_1.useMemo)(function () {
        return (personalities.find(function (p) { return p.name === selectedPersonality; }) ||
            personalities.find(function (p) { return p.id === "natural"; }) ||
            personalities[2]); // Default to Natural or the third item
    }, [personalities, selectedPersonality]);
    /**
     * Check if there are recent personalities
     */
    var hasRecentPersonalities = (userPreferences === null || userPreferences === void 0 ? void 0 : userPreferences.recentPersonalities) && userPreferences.recentPersonalities.length > 0;
    /**
     * Get recent personalities
     */
    var recentPersonalities = (0, react_1.useMemo)(function () {
        if (!hasRecentPersonalities)
            return [];
        return userPreferences.recentPersonalities
            .map(function (personalityName) { return personalities.find(function (p) { return p.name === personalityName; }); })
            .filter(function (personality) { return !!personality; });
    }, [personalities, userPreferences.recentPersonalities, hasRecentPersonalities]);
    // SECTION: Event handlers
    /**
     * Handle personality selection
     */
    var handleSelectPersonality = (0, react_1.useCallback)(function (personality) {
        setSelectedPersonality(personality.name);
        onPersonalitySelect === null || onPersonalitySelect === void 0 ? void 0 : onPersonalitySelect(personality);
        setIsOpen(false);
    }, [setSelectedPersonality, onPersonalitySelect]);
    /**
     * Handle tab change
     */
    var handleTabChange = (0, react_1.useCallback)(function (value) {
        setActiveTab(value);
        setSearchQuery("");
    }, []);
    // Prepare data attributes
    var allDataAttributes = __assign({ "data-component": "PersonalitySelector", "data-component-path": "@/components/chat/personality-selector" }, (dataAttributes || {}));
    // SECTION: Render
    return ((0, jsx_runtime_1.jsxs)(popover_1.Popover, { open: isOpen, onOpenChange: setIsOpen, children: [(0, jsx_runtime_1.jsx)(popover_1.PopoverTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, __assign({ variant: "outline", size: size, className: "text-xs flex items-center gap-1 ".concat(size === "sm" ? "h-8" : size === "md" ? "h-9" : "h-10", " bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors duration-200 rounded-full ").concat(className), style: style, id: id, disabled: disabled }, allDataAttributes, { children: [buttonIcon, buttonLabel || selectedPersonality, (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { className: "h-3 w-3 ml-1 text-gray-500 dark:text-gray-400" })] })) }), (0, jsx_runtime_1.jsx)(popover_1.PopoverContent, { className: "w-".concat(contentWidth, " p-0 border border-gray-100 dark:border-gray-700 shadow-lg rounded-xl bg-white dark:bg-gray-800 transition-colors duration-200"), align: "start", sideOffset: 4, children: showTabs ? ((0, jsx_runtime_1.jsxs)(tabs_1.Tabs, { defaultValue: defaultTab, value: activeTab, onValueChange: handleTabChange, children: [(0, jsx_runtime_1.jsxs)("div", { className: "border-b border-gray-100 dark:border-gray-700 px-3 py-2", children: [showSearch && ((0, jsx_runtime_1.jsxs)("div", { className: "relative mb-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: searchPlaceholder, value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9 h-9 text-sm rounded-full bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 focus:border-primary/30 focus:ring-primary/20" })] })), (0, jsx_runtime_1.jsxs)(tabs_1.TabsList, { className: "w-full grid grid-cols-2 h-9 rounded-full bg-gray-100 dark:bg-gray-700 p-1", children: [(0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "all", className: "rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm", children: "All" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "recent", className: "rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm", children: "Recent" })] })] }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "all", className: "mt-0", children: (0, jsx_runtime_1.jsx)(scroll_area_1.ScrollArea, { className: "max-h-".concat(maxHeight, " scrollbar-thin"), children: filteredPersonalities.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "p-4 text-center text-gray-500 dark:text-gray-400", children: emptyStateText })) : ((0, jsx_runtime_1.jsx)("div", { className: "py-2 space-y-0.5", children: filteredPersonalities.map(function (personality) { return ((0, jsx_runtime_1.jsx)("button", { className: "w-full px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg ".concat(personality.name === selectedPersonality ? "bg-primary/5 dark:bg-primary/10" : ""), onClick: function () { return handleSelectPersonality(personality); }, disabled: disabled, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [personality.icon && ((0, jsx_runtime_1.jsx)("span", { className: "w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 mr-2", children: personality.icon })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "font-medium text-gray-800 dark:text-gray-200", children: personality.name }), showDescriptions && ((0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: personality.description }))] })] }) }, personality.id)); }) })) }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "recent", className: "mt-0", children: (0, jsx_runtime_1.jsx)(scroll_area_1.ScrollArea, { className: "max-h-".concat(maxHeight, " scrollbar-thin"), children: !hasRecentPersonalities ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center text-gray-500 dark:text-gray-400 py-12 flex flex-col items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" }), (0, jsx_runtime_1.jsx)("p", { children: noRecentPersonalitiesText }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs mt-1 max-w-[250px]", children: "Personalities you use will appear here for quick access" })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "py-2 space-y-0.5", children: recentPersonalities.map(function (personality) { return ((0, jsx_runtime_1.jsx)("button", { className: "w-full px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg ".concat(personality.name === selectedPersonality ? "bg-primary/5 dark:bg-primary/10" : ""), onClick: function () { return handleSelectPersonality(personality); }, disabled: disabled, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [personality.icon && ((0, jsx_runtime_1.jsx)("span", { className: "w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 mr-2", children: personality.icon })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "font-medium text-gray-800 dark:text-gray-200", children: personality.name }), showDescriptions && ((0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: personality.description }))] })] }) }, personality.id)); }) })) }) })] })) : (
                // Simple view without tabs
                (0, jsx_runtime_1.jsxs)("div", { children: [showSearch && ((0, jsx_runtime_1.jsxs)("div", { className: "relative px-3 py-2 border-b border-gray-100 dark:border-gray-700", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: searchPlaceholder, value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9 h-9 text-sm rounded-full bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 focus:border-primary/30 focus:ring-primary/20" })] })), (0, jsx_runtime_1.jsx)(scroll_area_1.ScrollArea, { className: "max-h-".concat(maxHeight, " scrollbar-thin"), children: filteredPersonalities.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "p-4 text-center text-gray-500 dark:text-gray-400", children: emptyStateText })) : ((0, jsx_runtime_1.jsx)("div", { className: "py-2 space-y-0.5", children: filteredPersonalities.map(function (personality) { return ((0, jsx_runtime_1.jsx)("button", { className: "w-full px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg ".concat(personality.name === selectedPersonality ? "bg-primary/5 dark:bg-primary/10" : ""), onClick: function () { return handleSelectPersonality(personality); }, disabled: disabled, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [personality.icon && ((0, jsx_runtime_1.jsx)("span", { className: "w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 mr-2", children: personality.icon })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "font-medium text-gray-800 dark:text-gray-200", children: personality.name }), showDescriptions && ((0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: personality.description }))] })] }) }, personality.id)); }) })) })] })) })] }));
}
