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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSidebar = exports.SidebarProvider = exports.SidebarNavSection = exports.SidebarNavItem = exports.Sidebar = void 0;
// Exportação dos componentes principais
var Sidebar_1 = require("./sidebar/Sidebar");
Object.defineProperty(exports, "Sidebar", { enumerable: true, get: function () { return __importDefault(Sidebar_1).default; } });
var SidebarNavItem_1 = require("./sidebar/SidebarNavItem");
Object.defineProperty(exports, "SidebarNavItem", { enumerable: true, get: function () { return SidebarNavItem_1.SidebarNavItem; } });
var SidebarNavSection_1 = require("./sidebar/SidebarNavSection");
Object.defineProperty(exports, "SidebarNavSection", { enumerable: true, get: function () { return SidebarNavSection_1.SidebarNavSection; } });
// Exportação dos componentes de chat
__exportStar(require("./chat"), exports);
// Exportação dos componentes de workflow
__exportStar(require("./workflow"), exports);
// Exportação dos componentes de UI
var sidebar_1 = require("./ui/sidebar");
Object.defineProperty(exports, "SidebarProvider", { enumerable: true, get: function () { return __importDefault(sidebar_1).default; } });
Object.defineProperty(exports, "useSidebar", { enumerable: true, get: function () { return sidebar_1.useSidebar; } });
// Exportação padrão para facilitar importações
var Components = {
// Adicionar aqui todos os componentes principais à medida que forem criados
};
exports.default = Components;
