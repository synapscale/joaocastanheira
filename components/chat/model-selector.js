"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ModelSelector;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var popover_1 = require("@/components/ui/popover");
var scroll_area_1 = require("@/components/ui/scroll-area");
var tabs_1 = require("@/components/ui/tabs");
var input_1 = require("@/components/ui/input");
var app_context_1 = require("@/contexts/app-context");
function ModelSelector() {
    var _a = (0, react_1.useState)(false), isOpen = _a[0], setIsOpen = _a[1];
    var _b = (0, react_1.useState)(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = (0, app_context_1.useApp)(), selectedModel = _c.selectedModel, setSelectedModel = _c.setSelectedModel, userPreferences = _c.userPreferences;
    // Lista completa de modelos baseada nas imagens fornecidas
    var models = [
        // ChatGPT models
        { id: "chatgpt-4.1-nano", name: "ChatGPT 4.1 nano", provider: "openai", isNew: true, isInfinite: true },
        { id: "chatgpt-4.1-mini", name: "ChatGPT 4.1 mini", provider: "openai", isNew: true },
        { id: "chatgpt-4.1", name: "ChatGPT 4.1", provider: "openai", isNew: true },
        { id: "chatgpt-4o-mini", name: "ChatGPT 4o mini", provider: "openai", isInfinite: true },
        { id: "chatgpt-4o", name: "ChatGPT 4o", provider: "openai", isInfinite: true },
        { id: "chatgpt-4o-latest", name: "ChatGPT 4o Latest", provider: "openai", isInfinite: true },
        // o models
        { id: "o4-mini-high", name: "o4 mini High", provider: "openai", isNew: true, isInfinite: true },
        { id: "o4-mini", name: "o4 mini", provider: "openai", isNew: true, isInfinite: true },
        { id: "o3", name: "o3", provider: "openai", isNew: true },
        { id: "o3-mini", name: "o3 mini", provider: "openai", isInfinite: true },
        { id: "o3-mini-high", name: "o3 mini High", provider: "openai", isInfinite: true },
        { id: "o1", name: "o1", provider: "openai" },
        { id: "o1-mini", name: "o1 mini", provider: "openai" },
        // DeepSeek models
        { id: "deepseek-r1", name: "DeepSeek R1", provider: "deepseek", isNew: true },
        { id: "deepseek-r1-small", name: "DeepSeek R1 Small", provider: "deepseek", isNew: true, isInfinite: true },
        { id: "deepseek-v3.1", name: "DeepSeek V3.1", provider: "deepseek", isUpdated: true },
        // Qwen models
        { id: "qwen-2.5-32b", name: "Qwen 2.5 32B", provider: "qwen", isNew: true, isInfinite: true },
        { id: "qwen-2.5-coder-32b", name: "Qwen 2.5 Coder 32B", provider: "qwen", isNew: true, isInfinite: true },
        { id: "qwen-qwq-32b", name: "Qwen QwQ 32B", provider: "qwen", isNew: true, isInfinite: true },
        // Gemini models
        { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "google", isNew: true, isBeta: true },
        { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google", isInfinite: true },
        { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", provider: "google", isBeta: true, isInfinite: true },
        {
            id: "gemini-2.0-flash-thinking",
            name: "Gemini 2.0 Flash Thinking",
            provider: "google",
            isBeta: true,
            isInfinite: true,
        },
        { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "google", isBeta: true, isInfinite: true },
        { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "google", isInfinite: true },
        // Claude models
        { id: "claude-3.5-haiku", name: "Claude 3.5 Haiku", provider: "anthropic", isNew: true, isInfinite: true },
        { id: "claude-3.7-sonnet", name: "Claude 3.7 Sonnet", provider: "anthropic", isNew: true },
        { id: "claude-3.7-sonnet-thinking", name: "Claude 3.7 Sonnet Thinking", provider: "anthropic", isNew: true },
        { id: "claude-3-opus", name: "Claude 3 Opus", provider: "anthropic" },
        // Grok models
        { id: "grok-3-mini", name: "Grok 3 mini", provider: "xai", isNew: true },
        { id: "grok-3-mini-fast", name: "Grok 3 mini Fast", provider: "xai", isNew: true },
        { id: "grok-3", name: "Grok 3", provider: "xai", isNew: true },
        { id: "grok-3-fast", name: "Grok 3 Fast", provider: "xai", isNew: true },
        { id: "grok-2", name: "Grok 2", provider: "xai" },
        // Llama models
        { id: "llama-4-maverick", name: "Llama 4 Maverick", provider: "meta", isNew: true },
        { id: "llama-4-scout", name: "Llama 4 Scout", provider: "meta", isNew: true },
        { id: "llama-3.3-70b", name: "Llama 3.3 70B", provider: "meta", isNew: true, isInfinite: true },
        { id: "llama-3.2-11b", name: "Llama 3.2 11B", provider: "meta", isInfinite: true },
    ];
    // Filtra modelos com base na pesquisa
    var filteredModels = models.filter(function (model) {
        return searchQuery === "" ||
            model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            model.provider.toLowerCase().includes(searchQuery.toLowerCase());
    });
    // Agrupar modelos por provedor
    var modelsByProvider = filteredModels.reduce(function (acc, model) {
        if (!acc[model.provider]) {
            acc[model.provider] = [];
        }
        acc[model.provider].push(model);
        return acc;
    }, {});
    // Função para obter o ícone do provedor
    var getProviderIcon = function (provider) {
        switch (provider) {
            case "openai":
                return "i";
            case "deepseek":
                return (0, jsx_runtime_1.jsx)("img", { src: "/deepseek-logo-inspired.png", alt: "DeepSeek", className: "w-4 h-4" });
            case "qwen":
                return (0, jsx_runtime_1.jsx)("img", { src: "/placeholder-ct6n6.png", alt: "Qwen", className: "w-4 h-4" });
            case "google":
                return (0, jsx_runtime_1.jsx)("img", { src: "/google-g-logo.png", alt: "Google", className: "w-4 h-4" });
            case "anthropic":
                return (0, jsx_runtime_1.jsx)("img", { src: "/anthropic-logo.png", alt: "Anthropic", className: "w-4 h-4" });
            case "xai":
                return (0, jsx_runtime_1.jsx)("img", { src: "/placeholder-akjv1.png", alt: "xAI", className: "w-4 h-4" });
            case "meta":
                return (0, jsx_runtime_1.jsx)("img", { src: "/abstract-infinity-logo.png", alt: "Meta", className: "w-4 h-4" });
            default:
                return "i";
        }
    };
    // Nomes de exibição para os provedores
    var providerNames = {
        openai: "OpenAI",
        deepseek: "DeepSeek",
        qwen: "Qwen",
        google: "Google",
        anthropic: "Anthropic",
        xai: "xAI",
        meta: "Meta",
    };
    (0, react_1.useEffect)(function () {
        // Função para fechar o popover quando clicar fora dele
        var handleClickOutside = function (event) {
            var popoverElement = document.querySelector(".model-selector");
            if (popoverElement && !popoverElement.contains(event.target) && isOpen) {
                setIsOpen(false);
            }
        };
        // Adiciona o event listener quando o popover estiver aberto
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        // Limpa o event listener
        return function () {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);
    return ((0, jsx_runtime_1.jsxs)(popover_1.Popover, { open: isOpen, onOpenChange: setIsOpen, className: "model-selector", children: [(0, jsx_runtime_1.jsx)(popover_1.PopoverTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", className: "text-xs flex items-center gap-1 h-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors duration-200 rounded-full", "data-component": "ModelSelector", "data-component-path": "@/components/chat/model-selector", onClick: function () { return setIsOpen(true); }, children: [(0, jsx_runtime_1.jsx)("span", { className: "w-4 h-4 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] mr-1", children: typeof getProviderIcon(selectedModel.provider) === "string"
                                ? getProviderIcon(selectedModel.provider)
                                : getProviderIcon(selectedModel.provider) }), selectedModel.name, selectedModel.isInfinite && (0, jsx_runtime_1.jsx)(lucide_react_1.Infinity, { className: "h-3 w-3 ml-1 text-primary" }), (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { className: "h-3 w-3 ml-1 text-gray-500 dark:text-gray-400" })] }) }), (0, jsx_runtime_1.jsx)(popover_1.PopoverContent, { className: "w-[350px] p-0 border border-gray-100 dark:border-gray-700 shadow-lg rounded-xl bg-white dark:bg-gray-800 transition-colors duration-200", align: "start", onInteractOutside: function () { return setIsOpen(false); }, onEscapeKeyDown: function () { return setIsOpen(false); }, children: (0, jsx_runtime_1.jsxs)(tabs_1.Tabs, { defaultValue: "all", children: [(0, jsx_runtime_1.jsxs)("div", { className: "border-b border-gray-100 dark:border-gray-700 px-3 py-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative mb-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Buscar modelos...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9 h-9 text-sm rounded-full bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 focus:border-primary/30 focus:ring-primary/20" })] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsList, { className: "w-full grid grid-cols-2 h-9 rounded-full bg-gray-100 dark:bg-gray-700 p-1", children: [(0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "all", className: "rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm", children: "Todos" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "recent", className: "rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm", children: "Recentes" })] })] }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "all", className: "mt-0", children: (0, jsx_runtime_1.jsx)(scroll_area_1.ScrollArea, { className: "h-80 scrollbar-thin", children: Object.keys(modelsByProvider).length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "p-4 text-center text-gray-500 dark:text-gray-400", children: "Nenhum modelo encontrado" })) : (Object.keys(modelsByProvider).map(function (provider) { return ((0, jsx_runtime_1.jsxs)("div", { className: "py-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: providerNames[provider] || provider }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-0.5", children: modelsByProvider[provider].map(function (model) { return ((0, jsx_runtime_1.jsxs)("button", { className: "w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors duration-200 ".concat(model.id === selectedModel.id ? "bg-primary/5 dark:bg-primary/10" : ""), onClick: function (e) {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSelectedModel(model);
                                                    setIsOpen(false);
                                                }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] mr-2", children: typeof getProviderIcon(model.provider) === "string"
                                                                    ? getProviderIcon(model.provider)
                                                                    : getProviderIcon(model.provider) }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-800 dark:text-gray-200", children: model.name }), model.isInfinite && (0, jsx_runtime_1.jsx)(lucide_react_1.Infinity, { className: "h-3 w-3 ml-1.5 text-primary" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-1", children: [model.isNew && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full", children: "Novo" })), model.isBeta && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full", children: "Beta" })), model.isUpdated && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full", children: "Atualizado" }))] })] }, model.id)); }) })] }, provider)); })) }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "recent", className: "mt-0", children: (0, jsx_runtime_1.jsx)(scroll_area_1.ScrollArea, { className: "h-80 scrollbar-thin", children: userPreferences.recentModels.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center text-gray-500 dark:text-gray-400 py-12 flex flex-col items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" }), (0, jsx_runtime_1.jsx)("p", { children: "Nenhum modelo recente" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs mt-1 max-w-[250px]", children: "Os modelos que voc\u00EA usar aparecer\u00E3o aqui para acesso r\u00E1pido" })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "py-2 space-y-0.5", children: userPreferences.recentModels.map(function (model) { return ((0, jsx_runtime_1.jsxs)("button", { className: "w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors duration-200 ".concat(model.id === selectedModel.id ? "bg-primary/5 dark:bg-primary/10" : ""), onClick: function (e) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setSelectedModel(model);
                                            setIsOpen(false);
                                        }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] mr-2", children: typeof getProviderIcon(model.provider) === "string"
                                                            ? getProviderIcon(model.provider)
                                                            : getProviderIcon(model.provider) }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-800 dark:text-gray-200", children: model.name }), model.isInfinite && (0, jsx_runtime_1.jsx)(lucide_react_1.Infinity, { className: "h-3 w-3 ml-1.5 text-primary" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-1", children: [model.isNew && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full", children: "Novo" })), model.isBeta && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full", children: "Beta" })), model.isUpdated && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full", children: "Atualizado" }))] })] }, model.id)); }) })) }) })] }) })] }));
}
