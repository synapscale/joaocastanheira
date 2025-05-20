"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMessageContent = processMessageContent;
var jsx_runtime_1 = require("react/jsx-runtime");
var component_reference_message_1 = __importDefault(require("../component-reference-message"));
// Função para processar o conteúdo da mensagem e identificar referências de componentes
function processMessageContent(content) {
    // Verifica se há referências de componentes no formato [ComponentReference:{...}]
    var componentRefRegex = /\[ComponentReference:(.*?)\]/g;
    if (!componentRefRegex.test(content)) {
        // Se não houver referências, retorna o conteúdo original
        return content;
    }
    // Divide o conteúdo em partes, alternando entre texto normal e referências de componentes
    var parts = [];
    var lastIndex = 0;
    var match;
    // Reset do regex para começar do início
    componentRefRegex.lastIndex = 0;
    while ((match = componentRefRegex.exec(content)) !== null) {
        // Adiciona o texto antes da referência
        if (match.index > lastIndex) {
            parts.push(content.substring(lastIndex, match.index));
        }
        try {
            // Extrai e parseia os dados do componente
            var componentData = JSON.parse(match[1]);
            // Adiciona o componente de referência
            parts.push((0, jsx_runtime_1.jsx)(component_reference_message_1.default, { componentData: componentData }, "comp-ref-".concat(match.index)));
        }
        catch (error) {
            // Em caso de erro no parsing, adiciona o texto original
            parts.push(match[0]);
        }
        lastIndex = match.index + match[0].length;
    }
    // Adiciona o restante do texto após a última referência
    if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
    }
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: parts });
}
