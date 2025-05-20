"use client";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatInput = ChatInput;
var jsx_runtime_1 = require("react/jsx-runtime");
// Junta classes CSS condicionalmente (igual ao clsx/tailwind-merge)
function cn() {
    var classes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        classes[_i] = arguments[_i];
    }
    return classes.filter(Boolean).join(" ");
}
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("../../../components/ui/button");
var card_1 = require("../../ui/card");
var file_upload_button_1 = require("./file-upload-button");
var uploaded_files_list_1 = require("./uploaded-files-list");
/**
 * ChatInput component
 *
 * A highly configurable input component for chat interfaces with support for
 * file uploads, auto-resizing, and various input methods.
 */
function ChatInput(_a) {
    var onSendMessage = _a.onSendMessage, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b, _c = _a.loadingText, loadingText = _c === void 0 ? "Sending..." : _c, loadingComponent = _a.loadingComponent, _d = _a.disableWhileLoading, disableWhileLoading = _d === void 0 ? true : _d, _e = _a.loadingAnimation, loadingAnimation = _e === void 0 ? "pulse" : _e, _f = _a.disabled, disabled = _f === void 0 ? false : _f, _g = _a.isDragOver, isDragOver = _g === void 0 ? false : _g, onDragOver = _a.onDragOver, onDragLeave = _a.onDragLeave, onDrop = _a.onDrop, _h = _a.uploadedFiles, uploadedFiles = _h === void 0 ? [] : _h, onFileSelect = _a.onFileSelect, onRemoveFile = _a.onRemoveFile, _j = _a.enableFileUploads, enableFileUploads = _j === void 0 ? true : _j, _k = _a.allowedFileTypes, allowedFileTypes = _k === void 0 ? ["image/*", "application/pdf", ".txt", ".md", ".csv"] : _k, _l = _a.maxFileSize, maxFileSize = _l === void 0 ? 10 * 1024 * 1024 : _l, // 10MB
    _m = _a.maxFiles, // 10MB
    maxFiles = _m === void 0 ? 10 : _m, _o = _a.placeholder, placeholder = _o === void 0 ? "Type your message here..." : _o, _p = _a.initialValue, initialValue = _p === void 0 ? "" : _p, _q = _a.maxLength, maxLength = _q === void 0 ? 0 : _q, _r = _a.minLength, minLength = _r === void 0 ? 0 : _r, _s = _a.showCharacterCounter, showCharacterCounter = _s === void 0 ? false : _s, _t = _a.maxHeight, maxHeight = _t === void 0 ? 200 : _t, _u = _a.minHeight, minHeight = _u === void 0 ? 40 : _u, _v = _a.enableAutoResize, enableAutoResize = _v === void 0 ? true : _v, _w = _a.enableAutoFocus, enableAutoFocus = _w === void 0 ? false : _w, _x = _a.enableSpellCheck, enableSpellCheck = _x === void 0 ? true : _x, _y = _a.enableAutoComplete, enableAutoComplete = _y === void 0 ? true : _y, _z = _a.enableAutoCorrect, enableAutoCorrect = _z === void 0 ? true : _z, _0 = _a.enableAutoCapitalize, enableAutoCapitalize = _0 === void 0 ? true : _0, _1 = _a.enableEmojiPicker, enableEmojiPicker = _1 === void 0 ? false : _1, _2 = _a.enableMentions, enableMentions = _2 === void 0 ? false : _2, _3 = _a.enableMarkdown, enableMarkdown = _3 === void 0 ? false : _3, _4 = _a.enableKeyboardShortcuts, enableKeyboardShortcuts = _4 === void 0 ? true : _4, _5 = _a.enableDragAndDrop, enableDragAndDrop = _5 === void 0 ? true : _5, _6 = _a.enablePaste, enablePaste = _6 === void 0 ? true : _6, _7 = _a.enableVoiceInput, enableVoiceInput = _7 === void 0 ? false : _7, _8 = _a.enableSuggestions, enableSuggestions = _8 === void 0 ? false : _8, _9 = _a.suggestions, suggestions = _9 === void 0 ? [] : _9, _10 = _a.enableCommands, enableCommands = _10 === void 0 ? false : _10, _11 = _a.commands, commands = _11 === void 0 ? [] : _11, _12 = _a.enableRichText, enableRichText = _12 === void 0 ? false : _12, _13 = _a.enableFilePreview, enableFilePreview = _13 === void 0 ? true : _13, _14 = _a.enableFileDragPreview, enableFileDragPreview = _14 === void 0 ? true : _14, _15 = _a.enableFileProgress, enableFileProgress = _15 === void 0 ? true : _15, _16 = _a.enableFileRetry, enableFileRetry = _16 === void 0 ? true : _16, _17 = _a.enableFileCancel, enableFileCancel = _17 === void 0 ? true : _17, _18 = _a.enableSendButton, enableSendButton = _18 === void 0 ? true : _18, _19 = _a.enableSendOnEnter, enableSendOnEnter = _19 === void 0 ? true : _19, _20 = _a.enableSendOnCtrlEnter, enableSendOnCtrlEnter = _20 === void 0 ? false : _20, _21 = _a.enableSendOnShiftEnter, enableSendOnShiftEnter = _21 === void 0 ? false : _21, _22 = _a.enableSendOnMetaEnter, enableSendOnMetaEnter = _22 === void 0 ? false : _22, _23 = _a.enableSendOnAltEnter, enableSendOnAltEnter = _23 === void 0 ? false : _23, inputRenderer = _a.inputRenderer, sendButtonRenderer = _a.sendButtonRenderer, fileUploadButtonRenderer = _a.fileUploadButtonRenderer, uploadedFilesRenderer = _a.uploadedFilesRenderer, onChange = _a.onChange, onFocus = _a.onFocus, onBlur = _a.onBlur, onKeyDown = _a.onKeyDown, onKeyUp = _a.onKeyUp, onClick = _a.onClick, onDoubleClick = _a.onDoubleClick, onContextMenu = _a.onContextMenu, onPaste = _a.onPaste, onCut = _a.onCut, onCopy = _a.onCopy, onCommand = _a.onCommand, onMention = _a.onMention, onEmoji = _a.onEmoji, onSuggestion = _a.onSuggestion, onVoiceInputStart = _a.onVoiceInputStart, onVoiceInputEnd = _a.onVoiceInputEnd, onVoiceInputResult = _a.onVoiceInputResult, onVoiceInputError = _a.onVoiceInputError, _24 = _a.className, className = _24 === void 0 ? "" : _24, style = _a.style, id = _a.id, dataAttributes = _a.dataAttributes, ariaAttributes = _a.ariaAttributes, _25 = _a.focusable, focusable = _25 === void 0 ? true : _25, tabIndex = _a.tabIndex, _26 = _a.interactive, interactive = _26 === void 0 ? true : _26, _27 = _a.showFocusRing, showFocusRing = _27 === void 0 ? true : _27, _28 = _a.focusRingColor, focusRingColor = _28 === void 0 ? "primary" : _28, _29 = _a.autoFocus, autoFocus = _29 === void 0 ? false : _29, _30 = _a.hasError, hasError = _30 === void 0 ? false : _30, errorMessage = _a.errorMessage, _31 = _a.errorMessagePosition, errorMessagePosition = _31 === void 0 ? "bottom" : _31, _32 = _a.animated, animated = _32 === void 0 ? true : _32, _33 = _a.animation, animation = _33 === void 0 ? "fade" : _33, _34 = _a.animationDuration, animationDuration = _34 === void 0 ? 300 : _34, _35 = _a.animationDelay, animationDelay = _35 === void 0 ? 0 : _35, _36 = _a.animationEasing, animationEasing = _36 === void 0 ? "ease" : _36, _37 = _a.hideOnMobile, hideOnMobile = _37 === void 0 ? false : _37, _38 = _a.hideOnTablet, hideOnTablet = _38 === void 0 ? false : _38, _39 = _a.hideOnDesktop, hideOnDesktop = _39 === void 0 ? false : _39, _40 = _a.responsive, responsive = _40 === void 0 ? true : _40, _41 = _a.transition, transition = _41 === void 0 ? true : _41, _42 = _a.transitionDuration, transitionDuration = _42 === void 0 ? 200 : _42, _43 = _a.transitionProperties, transitionProperties = _43 === void 0 ? ["all"] : _43, _44 = _a.transitionEasing, transitionEasing = _44 === void 0 ? "ease" : _44;
    // Refs
    var chatAreaRef = (0, react_1.useRef)(null);
    var textareaRef = (0, react_1.useRef)(null);
    var fileInputRef = (0, react_1.useRef)(null);
    // State
    var _45 = (0, react_1.useState)(initialValue), value = _45[0], setValue = _45[1];
    var _46 = (0, react_1.useState)(false), isFocused = _46[0], setIsFocused = _46[1];
    var _47 = (0, react_1.useState)(initialValue.length), charCount = _47[0], setCharCount = _47[1];
    // Effects
    // Auto-focus the textarea when the component mounts
    (0, react_1.useEffect)(function () {
        var _a;
        if (enableAutoFocus || autoFocus) {
            (_a = textareaRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    }, [enableAutoFocus, autoFocus]);
    // Update character count when value changes
    (0, react_1.useEffect)(function () {
        setCharCount(value.length);
    }, [value]);
    // Callbacks
    // Handle textarea input
    var handleInput = (0, react_1.useCallback)(function (e) {
        var textarea = e.target;
        var newValue = textarea.value;
        // Check max length
        if (maxLength > 0 && newValue.length > maxLength) {
            return;
        }
        setValue(newValue);
        onChange === null || onChange === void 0 ? void 0 : onChange(newValue);
        // Auto-resize the textarea
        if (enableAutoResize) {
            textarea.style.height = "auto";
            textarea.style.height = "".concat(Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight), "px");
        }
    }, [maxLength, onChange, enableAutoResize, minHeight, maxHeight]);
    // Handle key down events
    var handleKeyDown = (0, react_1.useCallback)(function (e) {
        // Call the onKeyDown callback
        onKeyDown === null || onKeyDown === void 0 ? void 0 : onKeyDown(e);
        // Handle keyboard shortcuts
        if (enableKeyboardShortcuts) {
            var isCtrlPressed = e.ctrlKey || e.metaKey;
            var isShiftPressed = e.shiftKey;
            var isAltPressed = e.altKey;
            // Send on Enter
            if (e.key === "Enter") {
                // Check various send conditions
                var shouldSendOnEnter = enableSendOnEnter && !isCtrlPressed && !isShiftPressed && !isAltPressed;
                var shouldSendOnCtrlEnter = enableSendOnCtrlEnter && isCtrlPressed && !isShiftPressed && !isAltPressed;
                var shouldSendOnShiftEnter = enableSendOnShiftEnter && !isCtrlPressed && isShiftPressed && !isAltPressed;
                var shouldSendOnMetaEnter = enableSendOnMetaEnter && isCtrlPressed && !isShiftPressed && !isAltPressed;
                var shouldSendOnAltEnter = enableSendOnAltEnter && !isCtrlPressed && !isShiftPressed && isAltPressed;
                if (shouldSendOnEnter ||
                    shouldSendOnCtrlEnter ||
                    shouldSendOnShiftEnter ||
                    shouldSendOnMetaEnter ||
                    shouldSendOnAltEnter) {
                    e.preventDefault();
                    handleSubmit();
                }
            }
        }
    }, [
        enableKeyboardShortcuts,
        enableSendOnEnter,
        enableSendOnCtrlEnter,
        enableSendOnShiftEnter,
        enableSendOnMetaEnter,
        enableSendOnAltEnter,
        onKeyDown,
    ]);
    // Handle focus events
    var handleFocus = (0, react_1.useCallback)(function () {
        setIsFocused(true);
        onFocus === null || onFocus === void 0 ? void 0 : onFocus();
    }, [onFocus]);
    // Handle blur events
    var handleBlur = (0, react_1.useCallback)(function () {
        setIsFocused(false);
        onBlur === null || onBlur === void 0 ? void 0 : onBlur();
    }, [onBlur]);
    // Handle paste events
    var handlePaste = (0, react_1.useCallback)(function (e) {
        if (!enablePaste) {
            e.preventDefault();
            return;
        }
        onPaste === null || onPaste === void 0 ? void 0 : onPaste(e);
    }, [enablePaste, onPaste]);
    // Handle submit
    var handleSubmit = (0, react_1.useCallback)(function () {
        if (value.trim() && !isLoading && !disabled) {
            // Check minimum length
            if (minLength > 0 && value.length < minLength) {
                return;
            }
            onSendMessage(value);
            setValue("");
            // Reset textarea height
            if (enableAutoResize && textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        }
    }, [value, isLoading, disabled, minLength, onSendMessage, enableAutoResize]);
    // Handle file input click
    var handleFileInputClick = (0, react_1.useCallback)(function () {
        var _a;
        (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click();
    }, []);
    // Ajusta os tipos para os manipuladores de eventos de arrastar e soltar
    var handleDragOver = function (event) {
        event.preventDefault();
        if (onDragOver) {
            onDragOver(event);
        }
    };
    var handleDragLeave = function (event) {
        event.preventDefault();
        if (onDragLeave) {
            onDragLeave(event);
        }
    };
    var handleDrop = function (event) {
        event.preventDefault();
        if (onDrop) {
            onDrop(event);
        }
    };
    // Memoized values
    // Determine if the submit button should be disabled
    var isSubmitDisabled = (0, react_1.useMemo)(function () {
        if (disabled || (disableWhileLoading && isLoading)) {
            return true;
        }
        if (!value.trim()) {
            return true;
        }
        if (minLength > 0 && value.length < minLength) {
            return true;
        }
        return false;
    }, [disabled, disableWhileLoading, isLoading, value, minLength]);
    // Prepare animation and transition styles
    var animationStyle = (0, react_1.useMemo)(function () {
        if (!animated)
            return {};
        return {
            animation: "".concat(animation, " ").concat(animationDuration, "ms ").concat(animationEasing, " ").concat(animationDelay, "ms"),
        };
    }, [animated, animation, animationDuration, animationEasing, animationDelay]);
    var transitionStyle = (0, react_1.useMemo)(function () {
        if (!transition)
            return {};
        return {
            transition: "".concat(transitionProperties.join(", "), " ").concat(transitionDuration, "ms ").concat(transitionEasing),
        };
    }, [transition, transitionProperties, transitionDuration, transitionEasing]);
    // Combine all styles
    var combinedStyle = (0, react_1.useMemo)(function () { return (__assign(__assign(__assign({}, style), animationStyle), transitionStyle)); }, [style, animationStyle, transitionStyle]);
    // Prepare responsive classes
    var responsiveClasses = (0, react_1.useMemo)(function () {
        if (!responsive)
            return "";
        return cn(hideOnMobile && "hidden sm:block", hideOnTablet && "hidden md:block", hideOnDesktop && "block md:hidden");
    }, [responsive, hideOnMobile, hideOnTablet, hideOnDesktop]);
    // Prepare focus ring classes
    var focusRingClasses = (0, react_1.useMemo)(function () {
        if (!showFocusRing)
            return "";
        return cn(isFocused && "ring-2 ring-".concat(focusRingColor, "-500 ring-offset-2"));
    }, [showFocusRing, isFocused, focusRingColor]);
    // Prepare error classes
    var errorClasses = (0, react_1.useMemo)(function () {
        if (!hasError)
            return "";
        return "border-red-500 dark:border-red-400";
    }, [hasError]);
    // Combine all classes
    var allClasses = (0, react_1.useMemo)(function () {
        return cn("border ".concat(isDragOver ? "border-primary border-dashed bg-primary/5" : "border-gray-200 dark:border-gray-700", " rounded-xl overflow-hidden shadow-sm hover:shadow transition-shadow duration-200 bg-white dark:bg-gray-800"), responsiveClasses, focusRingClasses, errorClasses, className);
    }, [isDragOver, responsiveClasses, focusRingClasses, errorClasses, className]);
    // Prepare data attributes
    var allDataAttributes = (0, react_1.useMemo)(function () { return (__assign({ "data-loading": isLoading ? "true" : "false", "data-disabled": disabled ? "true" : "false", "data-drag-over": isDragOver ? "true" : "false", "data-focused": isFocused ? "true" : "false", "data-has-error": hasError ? "true" : "false" }, (dataAttributes || {}))); }, [isLoading, disabled, isDragOver, isFocused, hasError, dataAttributes]);
    // Prepare ARIA attributes
    var allAriaAttributes = (0, react_1.useMemo)(function () { return (__assign({ "aria-disabled": disabled ? "true" : "false", "aria-busy": isLoading ? "true" : "false", "aria-invalid": hasError ? "true" : "false" }, (ariaAttributes || {}))); }, [disabled, isLoading, hasError, ariaAttributes]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(card_1.Card, __assign({ className: allClasses, style: combinedStyle, ref: chatAreaRef, id: id, tabIndex: tabIndex }, allDataAttributes, allAriaAttributes, { children: (0, jsx_runtime_1.jsxs)("div", { className: "p-2", children: [uploadedFilesRenderer ? (uploadedFilesRenderer({
                            files: uploadedFiles,
                            onRemove: onRemoveFile,
                        })) : ((0, jsx_runtime_1.jsx)(uploaded_files_list_1.UploadedFilesList, { files: uploadedFiles, onRemoveFile: onRemoveFile, showPreviews: enableFilePreview, showSizes: true, showTypes: false, showProgress: enableFileProgress, showErrors: true })), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [inputRenderer ? (inputRenderer({
                                    value: value,
                                    onChange: handleInput,
                                    onKeyDown: handleKeyDown,
                                    placeholder: isDragOver ? "Drop files or components here..." : placeholder,
                                    disabled: disabled || (disableWhileLoading && isLoading),
                                    ref: textareaRef,
                                })) : ((0, jsx_runtime_1.jsx)("textarea", { ref: textareaRef, value: value, onChange: handleInput, onKeyDown: handleKeyDown, onKeyUp: onKeyUp, onClick: onClick, onDoubleClick: onDoubleClick, onContextMenu: onContextMenu, onPaste: handlePaste, onCut: onCut, onCopy: onCopy, onFocus: handleFocus, onBlur: handleBlur, placeholder: isDragOver ? "Drop files or components here..." : placeholder, className: "w-full border-0 focus:ring-0 focus:outline-none resize-none p-3 pr-20 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 transition-colors duration-200 ".concat(isDragOver ? "border-2 border-dashed border-primary/50 bg-primary/5" : ""), style: {
                                        height: "auto",
                                        minHeight: "".concat(minHeight, "px"),
                                        maxHeight: "".concat(maxHeight, "px"),
                                    }, disabled: disabled || (disableWhileLoading && isLoading), spellCheck: enableSpellCheck, autoComplete: enableAutoComplete ? "on" : "off", autoCorrect: enableAutoCorrect ? "on" : "off", autoCapitalize: enableAutoCapitalize ? "on" : "off", maxLength: maxLength > 0 ? maxLength : undefined, onDragOver: enableDragAndDrop ? handleDragOver : undefined, onDragLeave: enableDragAndDrop ? handleDragLeave : undefined, onDrop: enableDragAndDrop ? handleDrop : undefined })), (0, jsx_runtime_1.jsxs)("div", { className: "absolute right-2 bottom-2 flex items-center space-x-1", children: [enableFileUploads &&
                                            (fileUploadButtonRenderer ? (fileUploadButtonRenderer({
                                                onClick: handleFileInputClick,
                                                disabled: disabled || (disableWhileLoading && isLoading),
                                            })) : ((0, jsx_runtime_1.jsx)(file_upload_button_1.FileUploadButton, { onFileSelect: onFileSelect, acceptedFileTypes: allowedFileTypes, disabled: disabled || (disableWhileLoading && isLoading), maxFileSize: maxFileSize, maxFiles: maxFiles, multiple: true }))), enableSendButton &&
                                            (sendButtonRenderer ? (sendButtonRenderer({
                                                onClick: handleSubmit,
                                                disabled: isSubmitDisabled,
                                            })) : ((0, jsx_runtime_1.jsx)(button_1.Button, { size: "icon", className: "h-9 w-9 rounded-full bg-primary text-white hover:bg-primary/90 shadow-sm transition-all duration-200 hover:shadow", onClick: handleSubmit, disabled: isSubmitDisabled, children: isLoading ? (loadingComponent || ((0, jsx_runtime_1.jsx)("div", { className: "animate-".concat(loadingAnimation), children: loadingText === "Loading..." ? ((0, jsx_runtime_1.jsx)("div", { className: "h-4 w-4 rounded-full border-2 border-white border-t-transparent" })) : (loadingText) }))) : ((0, jsx_runtime_1.jsx)(lucide_react_1.Send, { className: "h-4 w-4" })) })))] })] }), showCharacterCounter && ((0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400 text-right mt-1 pr-2", children: maxLength > 0 ? "".concat(charCount, "/").concat(maxLength) : charCount }))] }) })), hasError && errorMessage && ((0, jsx_runtime_1.jsx)("div", { className: "text-sm text-red-500 dark:text-red-400 ".concat(errorMessagePosition === "top" ? "order-first" : "order-last"), children: errorMessage }))] }));
}
