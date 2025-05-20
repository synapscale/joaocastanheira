"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var TooltipWrapper = function (_a) {
    var content = _a.content, children = _a.children;
    var _b = (0, react_1.useState)(false), isVisible = _b[0], setIsVisible = _b[1];
    return ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', display: 'inline-block' }, onMouseEnter: function () { return setIsVisible(true); }, onMouseLeave: function () { return setIsVisible(false); }, children: [children, isVisible && ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'black',
                    color: 'white',
                    padding: '5px',
                    borderRadius: '3px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                }, children: content }))] }));
};
exports.default = TooltipWrapper;
