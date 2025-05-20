"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationTitle = ConversationTitle;
var jsx_runtime_1 = require("react/jsx-runtime");
function ConversationTitle(_a) {
    var title = _a.title, _b = _a.isActive, isActive = _b === void 0 ? true : _b;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-2 h-2 ".concat(isActive ? "bg-green-400" : "bg-gray-300", " rounded-full mr-2") }), (0, jsx_runtime_1.jsx)("h2", { className: "font-medium text-sm truncate ml-1 text-gray-700 dark:text-gray-200", children: title })] }));
}
