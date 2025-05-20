/**
 * ModelList Component
 *
 * Displays a list of AI models with search, filtering, and grouping capabilities.
 * Used by the ModelSelector component.
 */
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelList = ModelList;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var input_1 = require("@/components/ui/input");
var scroll_area_1 = require("@/components/ui/scroll-area");
var model_item_1 = require("./model-item");
var utils_1 = require("./utils");
/**
 * ModelList component
 */
function ModelList(_a) {
    var models = _a.models, selectedModel = _a.selectedModel, onSelect = _a.onSelect, _b = _a.showSearch, showSearch = _b === void 0 ? true : _b, _c = _a.showDescriptions, showDescriptions = _c === void 0 ? true : _c, _d = _a.showProviderLogos, showProviderLogos = _d === void 0 ? true : _d, _e = _a.groupByProvider, groupByProvider = _e === void 0 ? true : _e, _f = _a.searchPlaceholder, searchPlaceholder = _f === void 0 ? "Search models..." : _f, _g = _a.emptyStateText, emptyStateText = _g === void 0 ? "No models found" : _g, _h = _a.maxHeight, maxHeight = _h === void 0 ? "400px" : _h, _j = _a.disabled, disabled = _j === void 0 ? false : _j, _k = _a.className, className = _k === void 0 ? "" : _k;
    // SECTION: Local state
    var _l = (0, react_1.useState)(""), searchQuery = _l[0], setSearchQuery = _l[1];
    // SECTION: Derived data
    /**
     * Filter models based on search query
     */
    var filteredModels = (0, react_1.useMemo)(function () {
        if (!searchQuery.trim())
            return models;
        var query = searchQuery.toLowerCase();
        return models.filter(function (model) {
            return model.name.toLowerCase().includes(query) ||
                model.provider.toLowerCase().includes(query) ||
                (model.description && model.description.toLowerCase().includes(query)) ||
                (model.capabilities &&
                    Object.values(model.capabilities).some(function (cap) { return cap && typeof cap === "string" && cap.toLowerCase().includes(query); }));
        });
    }, [models, searchQuery]);
    /**
     * Group models by provider if needed
     */
    var modelGroups = (0, react_1.useMemo)(function () {
        if (!groupByProvider) {
            return { "All Models": filteredModels };
        }
        return (0, utils_1.groupModelsByProvider)(filteredModels);
    }, [filteredModels, groupByProvider]);
    // SECTION: Render
    return ((0, jsx_runtime_1.jsxs)("div", { className: "model-list ".concat(className), children: [showSearch && ((0, jsx_runtime_1.jsx)("div", { className: "p-3 border-b border-gray-200 dark:border-gray-700", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: searchPlaceholder, value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9 h-9 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary/30 focus:ring-primary/20", disabled: disabled })] }) })), (0, jsx_runtime_1.jsx)(scroll_area_1.ScrollArea, { className: "max-h-[".concat(maxHeight, "]"), children: Object.keys(modelGroups).length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "p-4 text-center text-gray-500 dark:text-gray-400", children: emptyStateText })) : ((0, jsx_runtime_1.jsx)("div", { className: "py-2", children: Object.entries(modelGroups).map(function (_a) {
                        var provider = _a[0], providerModels = _a[1];
                        return ((0, jsx_runtime_1.jsxs)("div", { className: "mb-2", children: [groupByProvider && ((0, jsx_runtime_1.jsx)("div", { className: "px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: provider })), (0, jsx_runtime_1.jsx)("div", { children: providerModels.map(function (model) { return ((0, jsx_runtime_1.jsx)(model_item_1.ModelItem, { model: model, isSelected: selectedModel.id === model.id, showDescription: showDescriptions, showProviderLogo: showProviderLogos, onClick: function () { return onSelect(model); }, disabled: disabled }, model.id)); }) })] }, provider));
                    }) })) })] }));
}
