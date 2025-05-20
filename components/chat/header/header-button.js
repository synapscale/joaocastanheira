"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderButton = HeaderButton;
var jsx_runtime_1 = require("react/jsx-runtime");
var button_1 = require("@/components/ui/button");
var tooltip_wrapper_1 = require("@shared/tooltip-wrapper");
function HeaderButton(_a) {
    var icon = _a.icon, onClick = _a.onClick, tooltip = _a.tooltip, _b = _a.tooltipSide, tooltipSide = _b === void 0 ? "bottom" : _b, _c = _a.active, active = _c === void 0 ? false : _c, _d = _a.className, className = _d === void 0 ? "" : _d;
    return ((0, jsx_runtime_1.jsx)(tooltip_wrapper_1.TooltipWrapper, { tooltip: tooltip, tooltipSide: tooltipSide, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ".concat(active ? "bg-gray-100 dark:bg-gray-700" : "", " ").concat(className), onClick: onClick, children: icon }) }));
}
