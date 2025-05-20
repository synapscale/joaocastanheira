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
exports.NodeTemplateCard = exports.NodeSidebar = exports.NodeForm = exports.NodeCategory = void 0;
var React = __importStar(require("react"));
// Exportação dos componentes de workflow
exports.NodeCategory = React.lazy(function () { return Promise.resolve().then(function () { return __importStar(require("./node-category")); }).then(function (module) { return ({ default: module.NodeCategory }); }); });
exports.NodeForm = React.lazy(function () { return Promise.resolve().then(function () { return __importStar(require("./node-form")); }).then(function (module) { return ({ default: module.NodeForm }); }); });
exports.NodeSidebar = React.lazy(function () { return Promise.resolve().then(function () { return __importStar(require("./node-sidebar")); }).then(function (module) { return ({ default: module.NodeSidebar }); }); });
exports.NodeTemplateCard = React.lazy(function () { return Promise.resolve().then(function () { return __importStar(require("./node-template-card")); }).then(function (module) { return ({ default: module.NodeTemplateCard }); }); });
// Exportação padrão para facilitar importações
var WorkflowComponents = {
    NodeCategory: exports.NodeCategory,
    NodeForm: exports.NodeForm,
    NodeSidebar: exports.NodeSidebar,
    NodeTemplateCard: exports.NodeTemplateCard
};
exports.default = WorkflowComponents;
