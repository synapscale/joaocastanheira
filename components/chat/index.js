"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelSelector = exports.MessagesArea = exports.ConversationSidebar = exports.ConversationHeader = exports.ChatMessage = exports.ChatInput = exports.ChatInterface = void 0;
var React = __importStar(require("react"));
// Exportação dos componentes de chat
exports.ChatInterface = React.lazy(function () { return Promise.resolve().then(function () { return __importStar(require("./chat-interface")); }).then(function (module) { return ({ default: module.default || module.ChatInterface }); }); });
exports.ChatInput = React.lazy(function () { return Promise.resolve().then(function () { return __importStar(require("./chat-input")); }).then(function (module) { return ({ default: module.default || module.ChatInput }); }); });
exports.ChatMessage = React.lazy(function () { return Promise.resolve().then(function () { return __importStar(require("./chat-message")); }).then(function (module) { return ({ default: module.default || module.ChatMessage }); }); });
exports.ConversationHeader = React.lazy(function () { return Promise.resolve().then(function () { return __importStar(require("./conversation-header")); }).then(function (module) { return ({ default: module.default || module.ConversationHeader }); }); });
exports.ConversationSidebar = React.lazy(function () { return Promise.resolve().then(function () { return __importStar(require("./conversation-sidebar")); }).then(function (module) { return ({ default: module.default || module.ConversationSidebar }); }); });
exports.MessagesArea = React.lazy(function () { return Promise.resolve().then(function () { return __importStar(require("./messages-area")); }).then(function (module) { return ({ default: module.default || module.MessagesArea }); }); });
exports.ModelSelector = React.lazy(function () { return Promise.resolve().then(function () { return __importStar(require("./model-selector")); }).then(function (module) { return ({ default: module.default || module.ModelSelector }); }); });
// Exportação padrão para facilitar importações
var ChatComponents = {
    ChatInterface: exports.ChatInterface,
    ChatInput: exports.ChatInput,
    ChatMessage: exports.ChatMessage,
    ConversationHeader: exports.ConversationHeader,
    ConversationSidebar: exports.ConversationSidebar,
    MessagesArea: exports.MessagesArea,
    ModelSelector: exports.ModelSelector
};
exports.default = ChatComponents;
