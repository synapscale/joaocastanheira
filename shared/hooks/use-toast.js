"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useToast = useToast;
var react_1 = require("react");
function useToast() {
    var _a = (0, react_1.useState)([]), toasts = _a[0], setToasts = _a[1];
    var toast = (0, react_1.useCallback)(function (toast) {
        setToasts(function (prev) { return __spreadArray(__spreadArray([], prev, true), [
            __assign(__assign({}, toast), { id: Math.random().toString(36).substr(2, 9) }),
        ], false); });
    }, []);
    var removeToast = (0, react_1.useCallback)(function (id) {
        setToasts(function (prev) { return prev.filter(function (t) { return t.id !== id; }); });
    }, []);
    return { toasts: toasts, toast: toast, removeToast: removeToast };
}
