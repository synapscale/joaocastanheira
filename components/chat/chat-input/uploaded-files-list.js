"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadedFilesList = UploadedFilesList;
var jsx_runtime_1 = require("react/jsx-runtime");
function UploadedFilesList(_a) {
    var files = _a.files, onRemoveFile = _a.onRemoveFile;
    if (files.length === 0)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2 mb-2 p-2", children: files.map(function (file, index) { return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-xs", children: [(0, jsx_runtime_1.jsx)("span", { className: "truncate max-w-[150px]", children: file.name }), (0, jsx_runtime_1.jsx)("button", { className: "ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200", onClick: function () { return onRemoveFile(index); }, children: "\u00D7" })] }, "".concat(file.name, "-").concat(index))); }) }));
}
