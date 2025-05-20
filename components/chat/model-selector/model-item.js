/**
 * ModelItem Component
 *
 * Displays a single AI model in the model list with its details.
 * Used by the ModelList component.
 */
"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelItem = ModelItem;
var jsx_runtime_1 = require("react/jsx-runtime");
var image_1 = __importDefault(require("next/image"));
var lucide_react_1 = require("lucide-react");
/**
 * Get the provider logo URL
 * @param provider Provider name
 * @returns URL to the provider logo
 */
function getProviderLogoUrl(provider) {
    var providerLogos = {
        OpenAI: "/google-g-logo.png",
        Anthropic: "/anthropic-logo.png",
        Google: "/google-g-logo.png",
        DeepSeek: "/deepseek-logo-inspired.png",
        Mistral: "/placeholder-ct6n6.png",
        Meta: "/placeholder-akjv1.png",
        Cohere: "/abstract-infinity-logo.png",
    };
    return providerLogos[provider] || "/abstract-ai-network.png";
}
/**
 * ModelItem component
 */
function ModelItem(_a) {
    // SECTION: Render helpers
    var model = _a.model, _b = _a.isSelected, isSelected = _b === void 0 ? false : _b, _c = _a.showDescription, showDescription = _c === void 0 ? true : _c, _d = _a.showProviderLogo, showProviderLogo = _d === void 0 ? true : _d, _e = _a.showCapabilities, showCapabilities = _e === void 0 ? true : _e, _f = _a.showTokenLimit, showTokenLimit = _f === void 0 ? true : _f, _g = _a.disabled, disabled = _g === void 0 ? false : _g, _h = _a.className, className = _h === void 0 ? "" : _h, onClick = _a.onClick;
    /**
     * Get capability icons based on model capabilities
     */
    var getCapabilityIcons = function () {
        var _a, _b, _c, _d;
        var icons = [];
        if ((_a = model.capabilities) === null || _a === void 0 ? void 0 : _a.text) {
            icons.push((0, jsx_runtime_1.jsx)("div", { className: "flex items-center", title: "Text generation", children: (0, jsx_runtime_1.jsx)(lucide_react_1.MessageSquare, { className: "h-3 w-3 text-gray-400" }) }, "text"));
        }
        if ((_b = model.capabilities) === null || _b === void 0 ? void 0 : _b.vision) {
            icons.push((0, jsx_runtime_1.jsx)("div", { className: "flex items-center", title: "Vision capabilities", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ImageIcon, { className: "h-3 w-3 text-gray-400" }) }, "vision"));
        }
        if ((_c = model.capabilities) === null || _c === void 0 ? void 0 : _c.files) {
            icons.push((0, jsx_runtime_1.jsx)("div", { className: "flex items-center", title: "File processing", children: (0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { className: "h-3 w-3 text-gray-400" }) }, "files"));
        }
        if ((_d = model.capabilities) === null || _d === void 0 ? void 0 : _d.fast) {
            icons.push((0, jsx_runtime_1.jsx)("div", { className: "flex items-center", title: "Fast response time", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Zap, { className: "h-3 w-3 text-gray-400" }) }, "fast"));
        }
        return icons;
    };
    // SECTION: Render
    return ((0, jsx_runtime_1.jsxs)("button", { className: "w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between transition-colors duration-200 ".concat(isSelected ? "bg-primary/5 dark:bg-primary/10" : "", " ").concat(disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer", " ").concat(className), onClick: onClick, disabled: disabled, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [showProviderLogo && ((0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded-full overflow-hidden mr-3 bg-gray-100 dark:bg-gray-700 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(image_1.default, { src: getProviderLogoUrl(model.provider) || "/placeholder.svg", alt: model.provider, width: 32, height: 32, className: "object-cover" }) })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium text-gray-800 dark:text-gray-200", children: model.name }), model.isPaid && (0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { className: "h-3 w-3 ml-1 text-gray-400", title: "Paid model" })] }), showDescription && model.description && ((0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-[200px] truncate", children: model.description })), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center mt-1 space-x-2", children: [showCapabilities && (0, jsx_runtime_1.jsx)("div", { className: "flex items-center space-x-1", children: getCapabilityIcons() }), showTokenLimit && model.contextLength && ((0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [model.contextLength.toLocaleString(), " tokens"] }))] })] })] }), isSelected && ((0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0 ml-2", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Check, { className: "h-4 w-4 text-primary" }) }))] }));
}
