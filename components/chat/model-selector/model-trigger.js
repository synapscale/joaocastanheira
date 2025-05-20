/**
 * ModelTrigger Component
 *
 * The button that triggers the model selector dropdown.
 * Displays the currently selected model with its logo.
 */
"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelTrigger = ModelTrigger;
var jsx_runtime_1 = require("react/jsx-runtime");
var image_1 = __importDefault(require("next/image"));
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
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
 * ModelTrigger component
 */
function ModelTrigger(_a) {
    var model = _a.model, _b = _a.showLogo, showLogo = _b === void 0 ? true : _b, _c = _a.size, size = _c === void 0 ? "default" : _c, _d = _a.showProvider, showProvider = _d === void 0 ? false : _d, _e = _a.showChevron, showChevron = _e === void 0 ? true : _e, _f = _a.disabled, disabled = _f === void 0 ? false : _f, _g = _a.className, className = _g === void 0 ? "" : _g;
    // SECTION: Size mappings
    var sizeClasses = {
        sm: "h-8 text-xs",
        default: "h-10 text-sm",
        lg: "h-12 text-base",
    };
    var logoSizes = {
        sm: 16,
        default: 20,
        lg: 24,
    };
    // SECTION: Render
    return ((0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", className: "flex items-center gap-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ".concat(sizeClasses[size], " ").concat(className), disabled: disabled, children: [showLogo && ((0, jsx_runtime_1.jsx)("div", { className: "rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0", children: (0, jsx_runtime_1.jsx)(image_1.default, { src: getProviderLogoUrl(model.provider) || "/placeholder.svg", alt: model.provider, width: logoSizes[size], height: logoSizes[size], className: "object-cover" }) })), (0, jsx_runtime_1.jsxs)("span", { className: "truncate max-w-[120px]", children: [model.name, showProvider && (0, jsx_runtime_1.jsxs)("span", { className: "text-gray-500 dark:text-gray-400 ml-1", children: ["(", model.provider, ")"] })] }), showChevron && (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { className: size === "sm" ? "h-3 w-3" : "h-4 w-4" })] }));
}
