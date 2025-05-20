"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ComponentReferenceMessage;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var component_reference_1 = __importDefault(require("../component-selector/component-reference"));
function ComponentReferenceMessage(_a) {
    var componentData = _a.componentData;
    var _b = (0, react_1.useState)(false), isClient = _b[0], setIsClient = _b[1];
    // Garantir que o componente só seja renderizado no cliente
    (0, react_1.useEffect)(function () {
        setIsClient(true);
    }, []);
    if (!isClient) {
        return (0, jsx_runtime_1.jsx)("div", { className: "p-3 border rounded-md", children: "Carregando refer\u00EAncia de componente..." });
    }
    return ((0, jsx_runtime_1.jsx)(component_reference_1.default, { name: componentData.name, path: componentData.path, props: componentData.props, detectionMethod: componentData.detectionMethod, onSelect: function () {
            // Aqui poderia ativar o seletor de componentes e focar neste componente
            // Por enquanto, apenas mostra uma mensagem no console
            console.log("Componente selecionado:", componentData.name);
        } }));
}
