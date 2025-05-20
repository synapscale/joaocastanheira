"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTextarea = useTextarea;
var react_1 = require("react");
function useTextarea(_a) {
    var onSubmit = _a.onSubmit;
    var _b = (0, react_1.useState)(""), value = _b[0], setValue = _b[1];
    var textareaRef = (0, react_1.useRef)(null);
    var handleInput = function (e) {
        var textarea = e.target;
        textarea.style.height = "auto";
        textarea.style.height = "".concat(Math.min(textarea.scrollHeight, 120), "px");
        setValue(textarea.value);
    };
    var handleKeyDown = function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
        }
    };
    var resetTextarea = function () {
        setValue("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };
    return {
        value: value,
        setValue: setValue,
        textareaRef: textareaRef,
        handleInput: handleInput,
        handleKeyDown: handleKeyDown,
        resetTextarea: resetTextarea,
    };
}
