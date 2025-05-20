/**
 * @fileoverview
 * Componente que exibe informações sobre o processamento de IA,
 * como contagem de tokens, tempo de resposta e modelo utilizado.
 */
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIProcessingInfo = AIProcessingInfo;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var badge_1 = require("@/components/ui/badge");
var tooltip_1 = require("@/components/ui/tooltip");
var ai_constants_1 = require("@/lib/ai-constants");
/**
 * Componente que exibe informações sobre o processamento de IA
 */
function AIProcessingInfo(_a) {
    var model = _a.model, tokenCount = _a.tokenCount, responseTimeMs = _a.responseTimeMs, _b = _a.showTokenCount, showTokenCount = _b === void 0 ? true : _b, _c = _a.showResponseTime, showResponseTime = _c === void 0 ? true : _c, _d = _a.showLimitAlerts, showLimitAlerts = _d === void 0 ? true : _d, _e = _a.className, className = _e === void 0 ? "" : _e;
    // Formata o tempo de resposta
    var _f = (0, react_1.useState)(""), formattedTime = _f[0], setFormattedTime = _f[1];
    // Obtém o limite de tokens para o modelo
    var tokenLimit = ai_constants_1.TOKEN_LIMITS[model] || 4096;
    // Calcula a porcentagem de uso de tokens
    var tokenPercentage = Math.round((tokenCount / tokenLimit) * 100);
    // Determina a cor do indicador de tokens
    var getTokenColor = function () {
        if (tokenPercentage >= 90)
            return "text-red-500 dark:text-red-400";
        if (tokenPercentage >= 75)
            return "text-amber-500 dark:text-amber-400";
        return "text-green-500 dark:text-green-400";
    };
    // Formata o tempo de resposta
    (0, react_1.useEffect)(function () {
        if (!responseTimeMs) {
            setFormattedTime("");
            return;
        }
        if (responseTimeMs < 1000) {
            setFormattedTime("".concat(responseTimeMs, "ms"));
        }
        else {
            var seconds = (responseTimeMs / 1000).toFixed(1);
            setFormattedTime("".concat(seconds, "s"));
        }
    }, [responseTimeMs]);
    return ((0, jsx_runtime_1.jsx)(tooltip_1.TooltipProvider, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap items-center gap-2 text-xs ".concat(className), children: [(0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "outline", className: "flex items-center gap-1 px-2 py-0.5", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Cpu, { className: "h-3 w-3" }), (0, jsx_runtime_1.jsx)("span", { children: model })] }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { children: (0, jsx_runtime_1.jsx)("p", { children: "Modelo de IA utilizado" }) })] }), showTokenCount && ((0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "outline", className: "flex items-center gap-1 px-2 py-0.5 ".concat(getTokenColor()), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Hash, { className: "h-3 w-3" }), (0, jsx_runtime_1.jsxs)("span", { children: [tokenCount, " / ", tokenLimit] })] }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { children: (0, jsx_runtime_1.jsxs)("p", { children: ["Tokens utilizados: ", tokenPercentage, "% do limite"] }) })] })), showResponseTime && responseTimeMs && ((0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "outline", className: "flex items-center gap-1 px-2 py-0.5", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-3 w-3" }), (0, jsx_runtime_1.jsx)("span", { children: formattedTime })] }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { children: (0, jsx_runtime_1.jsx)("p", { children: "Tempo de resposta" }) })] })), showLimitAlerts && tokenPercentage >= 90 && ((0, jsx_runtime_1.jsxs)(tooltip_1.Tooltip, { children: [(0, jsx_runtime_1.jsx)(tooltip_1.TooltipTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "outline", className: "flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800/30", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "h-3 w-3" }), (0, jsx_runtime_1.jsx)("span", { children: "Limite pr\u00F3ximo" })] }) }), (0, jsx_runtime_1.jsx)(tooltip_1.TooltipContent, { children: (0, jsx_runtime_1.jsx)("p", { children: "Voc\u00EA est\u00E1 pr\u00F3ximo do limite de tokens. Considere iniciar uma nova conversa." }) })] }))] }) }));
}
