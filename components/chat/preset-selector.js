/**
 * PresetSelector Component
 *
 * A component for selecting chat presets that combine model, tool, and personality settings.
 * Allows users to save and load preset configurations.
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
exports.default = PresetSelector;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var popover_1 = require("@/components/ui/popover");
var scroll_area_1 = require("@/components/ui/scroll-area");
var input_1 = require("@/components/ui/input");
var app_context_1 = require("@/contexts/app-context");
/**
 * PresetSelector component
 */
function PresetSelector(_a) {
    var _b = _a.className, className = _b === void 0 ? "" : _b, style = _a.style, id = _a.id, _c = _a.disabled, disabled = _c === void 0 ? false : _c, dataAttributes = _a.dataAttributes, presets = _a.presets, onPresetSelect = _a.onPresetSelect, onPresetSave = _a.onPresetSave, onPresetDelete = _a.onPresetDelete, _d = _a.size, size = _d === void 0 ? "sm" : _d, _e = _a.contentWidth, contentWidth = _e === void 0 ? "300px" : _e, _f = _a.maxHeight, maxHeight = _f === void 0 ? "300px" : _f, _g = _a.showCreateButton, showCreateButton = _g === void 0 ? true : _g, _h = _a.showSaveButton, showSaveButton = _h === void 0 ? true : _h, _j = _a.allowFavorites, allowFavorites = _j === void 0 ? true : _j, _k = _a.showDescriptions, showDescriptions = _k === void 0 ? true : _k, _l = _a.emptyStateText, emptyStateText = _l === void 0 ? "No presets found" : _l, _m = _a.buttonLabel, buttonLabel = _m === void 0 ? "Presets" : _m;
    // SECTION: Local state
    var _o = (0, react_1.useState)(false), isOpen = _o[0], setIsOpen = _o[1];
    var _p = (0, react_1.useState)(""), newPresetName = _p[0], setNewPresetName = _p[1];
    var _q = (0, react_1.useState)(""), newPresetDescription = _q[0], setNewPresetDescription = _q[1];
    var _r = (0, react_1.useState)(false), isCreatingPreset = _r[0], setIsCreatingPreset = _r[1];
    // SECTION: Application context
    var _s = (0, app_context_1.useApp)(), selectedModel = _s.selectedModel, selectedTool = _s.selectedTool, selectedPersonality = _s.selectedPersonality, userPreferences = _s.userPreferences, _t = _s.savedPresets, savedPresets = _t === void 0 ? [] : _t, savePreset = _s.savePreset, deletePreset = _s.deletePreset, toggleFavoritePreset = _s.toggleFavoritePreset, applyPreset = _s.applyPreset;
    // SECTION: Derived data
    /**
     * Presets to display in the selector
     */
    var presetsToDisplay = (0, react_1.useMemo)(function () {
        return presets || savedPresets;
    }, [presets, savedPresets]);
    /**
     * Favorite presets
     */
    var favoritePresets = (0, react_1.useMemo)(function () {
        return presetsToDisplay.filter(function (preset) { return preset.isFavorite; });
    }, [presetsToDisplay]);
    /**
     * Regular (non-favorite) presets
     */
    var regularPresets = (0, react_1.useMemo)(function () {
        return presetsToDisplay.filter(function (preset) { return !preset.isFavorite; });
    }, [presetsToDisplay]);
    // SECTION: Event handlers
    /**
     * Handle preset selection
     */
    var handleSelectPreset = (0, react_1.useCallback)(function (preset) {
        applyPreset(preset);
        onPresetSelect === null || onPresetSelect === void 0 ? void 0 : onPresetSelect(preset);
        setIsOpen(false);
    }, [applyPreset, onPresetSelect]);
    /**
     * Handle preset creation
     */
    var handleCreatePreset = (0, react_1.useCallback)(function () {
        if (!newPresetName.trim())
            return;
        var newPreset = {
            id: "preset_".concat(Date.now()),
            name: newPresetName.trim(),
            description: newPresetDescription.trim() || undefined,
            model: selectedModel.id,
            tool: selectedTool,
            personality: selectedPersonality,
            createdAt: Date.now(),
            isFavorite: false,
        };
        savePreset(newPreset);
        onPresetSave === null || onPresetSave === void 0 ? void 0 : onPresetSave(newPreset);
        setNewPresetName("");
        setNewPresetDescription("");
        setIsCreatingPreset(false);
    }, [newPresetName, newPresetDescription, selectedModel, selectedTool, selectedPersonality, savePreset, onPresetSave]);
    /**
     * Handle preset deletion
     */
    var handleDeletePreset = (0, react_1.useCallback)(function (preset, e) {
        e.stopPropagation();
        deletePreset(preset.id);
        onPresetDelete === null || onPresetDelete === void 0 ? void 0 : onPresetDelete(preset.id);
    }, [deletePreset, onPresetDelete]);
    /**
     * Handle toggling preset favorite status
     */
    var handleToggleFavorite = (0, react_1.useCallback)(function (preset, e) {
        e.stopPropagation();
        toggleFavoritePreset(preset.id);
    }, [toggleFavoritePreset]);
    // Prepare data attributes
    var allDataAttributes = __assign({ "data-component": "PresetSelector", "data-component-path": "@/components/chat/preset-selector" }, (dataAttributes || {}));
    // SECTION: Size mappings
    var sizeClasses = {
        sm: "text-xs h-8",
        md: "text-sm h-9",
        lg: "text-base h-10",
    };
    // SECTION: Render
    return ((0, jsx_runtime_1.jsxs)(popover_1.Popover, { open: isOpen, onOpenChange: setIsOpen, children: [(0, jsx_runtime_1.jsx)(popover_1.PopoverTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, __assign({ variant: "outline", size: "sm", className: "flex items-center gap-1 ".concat(sizeClasses[size], " bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors duration-200 rounded-full ").concat(className), style: style, id: id, disabled: disabled }, allDataAttributes, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { className: "h-3.5 w-3.5 text-gray-500 dark:text-gray-400 mr-0.5" }), buttonLabel, (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { className: "h-3 w-3 ml-1 text-gray-500 dark:text-gray-400" })] })) }), (0, jsx_runtime_1.jsxs)(popover_1.PopoverContent, { className: "p-0 border border-gray-100 dark:border-gray-700 shadow-lg rounded-xl bg-white dark:bg-gray-800 transition-colors duration-200", style: { width: contentWidth }, align: "start", sideOffset: 4, children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-3 border-b border-gray-100 dark:border-gray-700", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-medium text-gray-800 dark:text-gray-200", children: "Presets" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [showSaveButton && ((0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "ghost", size: "sm", className: "h-7 text-xs", onClick: function () { return setIsCreatingPreset(true); }, disabled: isCreatingPreset || disabled, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "h-3.5 w-3.5 mr-1" }), "Save Current"] })), showCreateButton && ((0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "ghost", size: "sm", className: "h-7 text-xs", onClick: function () { return setIsCreatingPreset(true); }, disabled: isCreatingPreset || disabled, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Create New"] }))] })] }), isCreatingPreset && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-3 space-y-2", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Preset name", value: newPresetName, onChange: function (e) { return setNewPresetName(e.target.value); }, className: "h-8 text-sm", disabled: disabled }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Description (optional)", value: newPresetDescription, onChange: function (e) { return setNewPresetDescription(e.target.value); }, className: "h-8 text-sm", disabled: disabled }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end space-x-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", className: "h-7 text-xs", onClick: function () {
                                                    setIsCreatingPreset(false);
                                                    setNewPresetName("");
                                                    setNewPresetDescription("");
                                                }, disabled: disabled, children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "default", size: "sm", className: "h-7 text-xs", onClick: handleCreatePreset, disabled: !newPresetName.trim() || disabled, children: "Save" })] })] }))] }), (0, jsx_runtime_1.jsx)(scroll_area_1.ScrollArea, { className: "max-h-[".concat(maxHeight, "]"), children: presetsToDisplay.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center text-gray-500 dark:text-gray-400 py-12 flex flex-col items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { className: "h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" }), (0, jsx_runtime_1.jsx)("p", { children: emptyStateText }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs mt-1 max-w-[250px]", children: "Save your current settings as a preset for quick access" })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "py-2", children: [allowFavorites && favoritePresets.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "mb-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Star, { className: "h-3 w-3 mr-1 text-amber-500" }), "Favorites"] }), (0, jsx_runtime_1.jsx)("div", { children: favoritePresets.map(function (preset) { return ((0, jsx_runtime_1.jsxs)("div", { className: "px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between", onClick: function () { return handleSelectPreset(preset); }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "font-medium text-gray-800 dark:text-gray-200", children: preset.name }), showDescriptions && preset.description && ((0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5", children: preset.description })), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [preset.model, " \u2022 ", preset.tool, " \u2022 ", preset.personality] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-1", children: [allowFavorites && ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700", onClick: function (e) { return handleToggleFavorite(preset, e); }, disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.StarOff, { className: "h-3.5 w-3.5 text-amber-500" }) })), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500", onClick: function (e) { return handleDeletePreset(preset, e); }, disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-3.5 w-3.5" }) })] })] }, preset.id)); }) })] })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-3 w-3 mr-1" }), "Presets"] }), (0, jsx_runtime_1.jsx)("div", { children: regularPresets.map(function (preset) { return ((0, jsx_runtime_1.jsxs)("div", { className: "px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between", onClick: function () { return handleSelectPreset(preset); }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "font-medium text-gray-800 dark:text-gray-200", children: preset.name }), showDescriptions && preset.description && ((0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5", children: preset.description })), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [preset.model, " \u2022 ", preset.tool, " \u2022 ", preset.personality] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-1", children: [allowFavorites && ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700", onClick: function (e) { return handleToggleFavorite(preset, e); }, disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Star, { className: "h-3.5 w-3.5 text-gray-400 hover:text-amber-500" }) })), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500", onClick: function (e) { return handleDeletePreset(preset, e); }, disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-3.5 w-3.5" }) })] })] }, preset.id)); }) })] })] })) })] })] }));
}
