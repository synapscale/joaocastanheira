"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerNames = void 0;
exports.getProviderIcon = getProviderIcon;
// Função para obter o ícone do provedor
function getProviderIcon(provider) {
    switch (provider) {
        case "openai":
            return "i";
        case "deepseek":
            return src;
            "/deepseek-logo-inspired.png";
            alt = "DeepSeek";
            className = "w-4 h-4" /  >
            ;
        case "qwen":
            return src;
            "/placeholder-ct6n6.png";
            alt = "Qwen";
            className = "w-4 h-4" /  >
            ;
        case "google":
            return src;
            "/google-g-logo.png";
            alt = "Google";
            className = "w-4 h-4" /  >
            ;
        case "anthropic":
            return src;
            "/anthropic-logo.png";
            alt = "Anthropic";
            className = "w-4 h-4" /  >
            ;
        case "xai":
            return src;
            "/placeholder-akjv1.png";
            alt = "xAI";
            className = "w-4 h-4" /  >
            ;
        case "meta":
            return src;
            "/abstract-infinity-logo.png";
            alt = "Meta";
            className = "w-4 h-4" /  >
            ;
        default:
            return "i";
    }
}
// Nomes de exibição para os provedores
exports.providerNames = {
    openai: "OpenAI",
    deepseek: "DeepSeek",
    qwen: "Qwen",
    google: "Google",
    anthropic: "Anthropic",
    xai: "xAI",
    meta: "Meta",
};
