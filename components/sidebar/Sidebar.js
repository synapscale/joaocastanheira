"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sidebar = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var link_1 = __importDefault(require("next/link"));
var navigation_1 = require("next/navigation");
var lucide_react_1 = require("lucide-react");
var SidebarNavItem_1 = require("./SidebarNavItem");
var SidebarNavSection_1 = require("./SidebarNavSection");
// Seções de navegação unificadas incluindo todos os setores do projeto
var NAV_SECTIONS = [
    {
        title: "Principal",
        items: [
            { href: "/dashboard", label: "Dashboard", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.LayoutDashboard, {}) },
            { href: "/agentes", label: "Agentes De IA", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Bot, {}) },
        ],
    },
    {
        title: "Ferramentas",
        items: [
            { href: "/canvas", label: "Canvas", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Layers, {}) },
            { href: "/prompts", label: "Prompts", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.FileText, {}) },
            { href: "/chat", label: "Chat", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.MessageSquare, {}) },
            { href: "/workflow", label: "Editor de Workflow", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Layers, {}) },
        ],
    },
    {
        title: "Marketplace",
        items: [
            { href: "/marketplace", label: "Marketplace", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Sparkles, {}) },
        ],
    },
    {
        title: "Configurações",
        items: [{ href: "/settings", label: "Configurações", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Settings, {}) }],
    },
];
var Sidebar = function () {
    var pathname = (0, navigation_1.usePathname)();
    var _a = (0, react_1.useState)(false), isMobile = _a[0], setIsMobile = _a[1];
    var _b = (0, react_1.useState)(false), isOpen = _b[0], setIsOpen = _b[1];
    (0, react_1.useEffect)(function () {
        var checkIfMobile = function () {
            setIsMobile(window.innerWidth < 768);
        };
        checkIfMobile();
        window.addEventListener("resize", checkIfMobile);
        return function () { return window.removeEventListener("resize", checkIfMobile); };
    }, []);
    (0, react_1.useEffect)(function () {
        if (isMobile) {
            setIsOpen(false);
        }
    }, [pathname, isMobile]);
    var toggleSidebar = (0, react_1.useCallback)(function () {
        setIsOpen(function (prev) { return !prev; });
    }, []);
    var isItemActive = (0, react_1.useCallback)(function (href) {
        if (href === "/agentes") {
            return pathname === "/agentes" || pathname.startsWith("/agentes/");
        }
        if (href === "/chat") {
            return pathname === "/chat" || pathname.startsWith("/chat/");
        }
        if (href === "/workflow") {
            return pathname === "/workflow" || pathname.startsWith("/workflow/");
        }
        if (href === "/marketplace") {
            return pathname === "/marketplace" || pathname.startsWith("/marketplace/");
        }
        return pathname === href;
    }, [pathname]);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [isMobile && ((0, jsx_runtime_1.jsx)("button", { onClick: toggleSidebar, "aria-label": isOpen ? "Fechar menu" : "Abrir menu", "aria-expanded": isOpen, "aria-controls": "sidebar", style: { position: 'fixed', top: 12, left: 12, zIndex: 50, height: 36, width: 36 }, children: isOpen ? (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 20 }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Menu, { size: 20 }) })), (0, jsx_runtime_1.jsxs)("div", { id: "sidebar", "aria-label": "Navega\u00E7\u00E3o principal", style: {
                    border: 0,
                    transition: 'all 0.3s',
                    position: isMobile ? 'fixed' : 'relative',
                    top: 0,
                    left: 0,
                    zIndex: 40,
                    height: '100%',
                    background: '#fff',
                    transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
                    width: 256,
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }, children: (0, jsx_runtime_1.jsxs)(link_1.default, { href: "/", "aria-label": "P\u00E1gina inicial", style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', height: 32, width: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: '#9333ea', color: '#fff' }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Sparkles, { size: 16 }) }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 16, fontWeight: 600 }, children: "Canva E Agentes" })] }) }), (0, jsx_runtime_1.jsx)("div", { children: NAV_SECTIONS.map(function (section) { return ((0, jsx_runtime_1.jsx)(SidebarNavSection_1.SidebarNavSection, { title: section.title, children: section.items.map(function (item) { return ((0, jsx_runtime_1.jsx)(SidebarNavItem_1.SidebarNavItem, { href: item.href, icon: item.icon, label: item.label, isActive: isItemActive(item.href) }, item.href)); }) }, section.title)); }) })] }), isMobile && isOpen && ((0, jsx_runtime_1.jsx)("div", { onClick: toggleSidebar, style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 30, backdropFilter: 'blur(2px)' }, "aria-hidden": "true" }))] }));
};
exports.Sidebar = Sidebar;
