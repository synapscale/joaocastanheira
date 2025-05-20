"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadButton = FileUploadButton;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("../../ui/button");
var tooltip_wrapper_1 = require("../../../../shared/tooltip-wrapper");
function FileUploadButton(_a) {
    var onFileSelect = _a.onFileSelect, acceptedFileTypes = _a.acceptedFileTypes, _b = _a.disabled, disabled = _b === void 0 ? false : _b;
    var fileInputRef = (0, react_1.useRef)(null);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("input", { type: "file", ref: fileInputRef, onChange: onFileSelect, className: "hidden", multiple: true, accept: acceptedFileTypes.join(",") }), (0, jsx_runtime_1.jsx)(tooltip_wrapper_1.TooltipWrapper, { tooltip: disabled ? "File upload disabled" : "Upload files", children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700", onClick: function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, disabled: disabled, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Paperclip, { className: "h-5 w-5" }) }) })] }));
}
