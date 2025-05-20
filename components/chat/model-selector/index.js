/**
 * ModelSelector Component
 *
 * A component for selecting AI models to use with the chat interface.
 * Displays available models grouped by provider and allows searching and filtering.
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
exports.default = ModelSelector;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var model_trigger_1 = require("./model-trigger");
var model_list_1 = require("./model-list");
var popover_1 = require("@/components/ui/popover");
var app_context_1 = require("@/contexts/app-context");
/**
 * ModelSelector component
 */
function ModelSelector(_a) {
    var _b = _a.className, className = _b === void 0 ? "" : _b, style = _a.style, id = _a.id, _c = _a.disabled, disabled = _c === void 0 ? false : _c, dataAttributes = _a.dataAttributes, models = _a.models, onModelSelect = _a.onModelSelect, _d = _a.size, size = _d === void 0 ? "default" : _d, _e = _a.contentWidth, contentWidth = _e === void 0 ? "320px" : _e, _f = _a.maxHeight, maxHeight = _f === void 0 ? "400px" : _f, _g = _a.showSearch, showSearch = _g === void 0 ? true : _g, _h = _a.showDescriptions, showDescriptions = _h === void 0 ? true : _h, _j = _a.showProviderLogos, showProviderLogos = _j === void 0 ? true : _j, _k = _a.groupByProvider, groupByProvider = _k === void 0 ? true : _k, _l = _a.searchPlaceholder, searchPlaceholder = _l === void 0 ? "Search models..." : _l, _m = _a.emptyStateText, emptyStateText = _m === void 0 ? "No models found" : _m, _o = _a.popoverSide, popoverSide = _o === void 0 ? "bottom" : _o, _p = _a.popoverAlign, popoverAlign = _p === void 0 ? "start" : _p;
    // SECTION: Local state
    var _q = (0, react_1.useState)(false), open = _q[0], setOpen = _q[1];
    // SECTION: Application context
    var _r = (0, app_context_1.useApp)(), selectedModel = _r.selectedModel, setSelectedModel = _r.setSelectedModel, availableModels = _r.availableModels;
    // SECTION: Derived data
    var modelsToDisplay = models || availableModels;
    // SECTION: Event handlers
    /**
     * Handle model selection
     */
    var handleSelectModel = (0, react_1.useCallback)(function (model) {
        setSelectedModel(model);
        onModelSelect === null || onModelSelect === void 0 ? void 0 : onModelSelect(model);
        setOpen(false);
    }, [setSelectedModel, onModelSelect]);
    // Prepare data attributes
    var allDataAttributes = __assign({ "data-component": "ModelSelector", "data-component-path": "@/components/chat/model-selector" }, (dataAttributes || {}));
    // SECTION: Render
    return ((0, jsx_runtime_1.jsxs)(popover_1.Popover, { open: open, onOpenChange: setOpen, children: [(0, jsx_runtime_1.jsx)(popover_1.PopoverTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)("div", __assign({ className: className, style: style, id: id }, allDataAttributes, { children: (0, jsx_runtime_1.jsx)(model_trigger_1.ModelTrigger, { model: selectedModel, showLogo: showProviderLogos, size: size, disabled: disabled }) })) }), (0, jsx_runtime_1.jsx)(popover_1.PopoverContent, { className: "p-0 border border-gray-200 dark:border-gray-700 shadow-lg", style: { width: contentWidth }, side: popoverSide, align: popoverAlign, sideOffset: 4, children: (0, jsx_runtime_1.jsx)(model_list_1.ModelList, { models: modelsToDisplay, selectedModel: selectedModel, onSelect: handleSelectModel, showSearch: showSearch, showDescriptions: showDescriptions, showProviderLogos: showProviderLogos, groupByProvider: groupByProvider, searchPlaceholder: searchPlaceholder, emptyStateText: emptyStateText, maxHeight: maxHeight, disabled: disabled }) })] }));
}
