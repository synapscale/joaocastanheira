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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebarNavItem = SidebarNavItem;
var jsx_runtime_1 = require("react/jsx-runtime");
var React = __importStar(require("react"));
var link_1 = __importDefault(require("next/link"));
function SidebarNavItem(_a) {
    var href = _a.href, icon = _a.icon, label = _a.label, isActive = _a.isActive, className = _a.className, badge = _a.badge, onClick = _a.onClick;
    return ((0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 8 }, children: (0, jsx_runtime_1.jsxs)(link_1.default, { href: href, style: {
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
                borderRadius: 6,
                background: isActive ? "#ede9fe" : "transparent",
                color: isActive ? "#7c3aed" : "#222",
                fontWeight: 500,
                fontSize: 14,
                textDecoration: "none",
                gap: 8,
            }, onClick: onClick, children: [React.isValidElement(icon)
                    ? React.cloneElement(icon, {
                        className: "sidebar-icon",
                        "aria-hidden": "true",
                        size: 18,
                    })
                    : icon, (0, jsx_runtime_1.jsx)("span", { style: { flex: 1 }, children: label }), badge && ((0, jsx_runtime_1.jsx)("span", { style: {
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "9999px",
                        padding: "0 6px",
                        height: "18px",
                        minWidth: "18px",
                        fontSize: "12px",
                        fontWeight: "500",
                        backgroundColor: isActive ? "#7c3aed" : "#e5e7eb",
                        color: isActive ? "white" : "#4b5563",
                    }, children: badge }))] }) }));
}
