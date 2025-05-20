/**
 * ChatMessage Component
 *
 * Renders a single message in the chat interface, handling different message types
 * and providing appropriate styling and interactions.
 *
 * @ai-pattern message-component
 * Displays user and assistant messages with various interactive features
 */
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
exports.useChatMessage = useChatMessage;
exports.default = ChatMessage;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var user_message_1 = require("./user-message");
var assistant_message_1 = require("./assistant-message");
var utils_1 = require("./utils");
var message_actions_1 = require("./message-actions");
var message_timestamp_1 = require("./message-timestamp");
var utils_2 = require("@/lib/utils");
// Create context with undefined default value
var ChatMessageContext = (0, react_1.createContext)(undefined);
/**
 * Hook to access the chat message context
 * @returns Chat message context
 * @throws {Error} If used outside of a ChatMessageProvider
 */
function useChatMessage() {
    var context = (0, react_1.useContext)(ChatMessageContext);
    if (!context) {
        throw new Error("useChatMessage must be used within a ChatMessageProvider");
    }
    return context;
}
/**
 * ChatMessage component
 * @param props Component props
 * @returns ChatMessage component
 */
function ChatMessage(_a) {
    var message = _a.message, _b = _a.showTimestamp, showTimestamp = _b === void 0 ? true : _b, _c = _a.showSender, showSender = _c === void 0 ? true : _c, _d = _a.isSequential, isSequential = _d === void 0 ? false : _d, _e = _a.isEditing, isEditing = _e === void 0 ? false : _e, _f = _a.focusMode, focusMode = _f === void 0 ? false : _f, _g = _a.timestampFormat, timestampFormat = _g === void 0 ? "relative" : _g, _h = _a.showActions, showActions = _h === void 0 ? true : _h, _j = _a.actionsPosition, actionsPosition = _j === void 0 ? "hover" : _j, _k = _a.enableSyntaxHighlighting, enableSyntaxHighlighting = _k === void 0 ? true : _k, _l = _a.enableMarkdown, enableMarkdown = _l === void 0 ? true : _l, _m = _a.enableAutoLink, enableAutoLink = _m === void 0 ? true : _m, _o = _a.enableEmoji, enableEmoji = _o === void 0 ? true : _o, _p = _a.maxHeight, maxHeight = _p === void 0 ? 0 : _p, _q = _a.highlight, highlight = _q === void 0 ? false : _q, _r = _a.highlightColor, highlightColor = _r === void 0 ? "primary" : _r, _s = _a.showAvatar, showAvatar = _s === void 0 ? true : _s, _t = _a.avatarSize, avatarSize = _t === void 0 ? "default" : _t, _u = _a.enableReactions, enableReactions = _u === void 0 ? false : _u, _v = _a.enableThreading, enableThreading = _v === void 0 ? false : _v, _w = _a.enableForwarding, enableForwarding = _w === void 0 ? false : _w, _x = _a.enableTranslation, enableTranslation = _x === void 0 ? false : _x, _y = _a.enableTextToSpeech, enableTextToSpeech = _y === void 0 ? false : _y, _z = _a.enableCopy, enableCopy = _z === void 0 ? true : _z, _0 = _a.enableEdit, enableEdit = _0 === void 0 ? false : _0, _1 = _a.enableDelete, enableDelete = _1 === void 0 ? false : _1, _2 = _a.enableRegenerate, enableRegenerate = _2 === void 0 ? false : _2, _3 = _a.enableFeedback, enableFeedback = _3 === void 0 ? false : _3, _4 = _a.enableSave, enableSave = _4 === void 0 ? false : _4, _5 = _a.enableShare, enableShare = _5 === void 0 ? false : _5, contentRenderer = _a.contentRenderer, actionsRenderer = _a.actionsRenderer, timestampRenderer = _a.timestampRenderer, senderRenderer = _a.senderRenderer, avatarRenderer = _a.avatarRenderer, onEdit = _a.onEdit, onDelete = _a.onDelete, onCopy = _a.onCopy, onRegenerate = _a.onRegenerate, onLike = _a.onLike, onDislike = _a.onDislike, onSave = _a.onSave, onShare = _a.onShare, onTranslate = _a.onTranslate, onTextToSpeech = _a.onTextToSpeech, onForward = _a.onForward, onThread = _a.onThread, onReactionAdd = _a.onReactionAdd, onReactionRemove = _a.onReactionRemove, onClick = _a.onClick, onHover = _a.onHover, _6 = _a.className, className = _6 === void 0 ? "" : _6, style = _a.style, id = _a.id, _7 = _a.disabled, disabled = _7 === void 0 ? false : _7, dataAttributes = _a.dataAttributes, _8 = _a.animated, animated = _8 === void 0 ? true : _8, _9 = _a.animation, animation = _9 === void 0 ? "fade" : _9, _10 = _a.animationDuration, animationDuration = _10 === void 0 ? 300 : _10, _11 = _a.animationDelay, animationDelay = _11 === void 0 ? 0 : _11, _12 = _a.animationEasing, animationEasing = _12 === void 0 ? "ease" : _12, _13 = _a.transition, transition = _13 === void 0 ? true : _13, _14 = _a.transitionDuration, transitionDuration = _14 === void 0 ? 200 : _14, _15 = _a.transitionProperties, transitionProperties = _15 === void 0 ? ["all"] : _15, _16 = _a.transitionEasing, transitionEasing = _16 === void 0 ? "ease" : _16, _17 = _a.showHoverEffect, showHoverEffect = _17 === void 0 ? true : _17, _18 = _a.hoverColor, hoverColor = _18 === void 0 ? "primary" : _18, _19 = _a.hoverEffect, hoverEffect = _19 === void 0 ? "highlight" : _19, _20 = _a.hideOnMobile, hideOnMobile = _20 === void 0 ? false : _20, _21 = _a.hideOnTablet, hideOnTablet = _21 === void 0 ? false : _21, _22 = _a.hideOnDesktop, hideOnDesktop = _22 === void 0 ? false : _22, _23 = _a.responsive, responsive = _23 === void 0 ? true : _23;
    // Local state
    var _24 = (0, react_1.useState)(false), copied = _24[0], setCopied = _24[1];
    var _25 = (0, react_1.useState)(null), liked = _25[0], setLiked = _25[1];
    var _26 = (0, react_1.useState)(false), showActionsState = _26[0], setShowActionsState = _26[1];
    var _27 = (0, react_1.useState)(false), isHovered = _27[0], setIsHovered = _27[1];
    // Determine if actions should be visible based on hover state and actionsPosition
    var showActionsVisible = (0, react_1.useMemo)(function () {
        if (!showActions)
            return false;
        if (actionsPosition === "always")
            return true;
        if (actionsPosition === "below")
            return true;
        return isHovered || showActionsState;
    }, [showActions, actionsPosition, isHovered, showActionsState]);
    /**
     * Copy message content to clipboard
     */
    var copyToClipboard = (0, react_1.useCallback)(function () {
        if (!enableCopy)
            return;
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(function () { return setCopied(false); }, 2000);
        onCopy === null || onCopy === void 0 ? void 0 : onCopy();
    }, [message.content, enableCopy, onCopy]);
    /**
     * Regenerate assistant response
     */
    var regenerateResponse = (0, react_1.useCallback)(function () {
        if (!enableRegenerate)
            return;
        onRegenerate === null || onRegenerate === void 0 ? void 0 : onRegenerate();
    }, [enableRegenerate, onRegenerate]);
    /**
     * Handle like action
     */
    var handleLike = (0, react_1.useCallback)(function () {
        if (!enableFeedback)
            return;
        setLiked(true);
        onLike === null || onLike === void 0 ? void 0 : onLike();
    }, [enableFeedback, onLike]);
    /**
     * Handle dislike action
     */
    var handleDislike = (0, react_1.useCallback)(function () {
        if (!enableFeedback)
            return;
        setLiked(false);
        onDislike === null || onDislike === void 0 ? void 0 : onDislike();
    }, [enableFeedback, onDislike]);
    // Create context value
    var contextValue = (0, react_1.useMemo)(function () { return ({
        message: message,
        copied: copied,
        setCopied: setCopied,
        liked: liked,
        setLiked: setLiked,
        showActions: showActionsState,
        setShowActions: setShowActionsState,
        copyToClipboard: copyToClipboard,
        regenerateResponse: regenerateResponse,
        focusMode: focusMode,
        enableCopy: enableCopy,
        enableEdit: enableEdit,
        enableDelete: enableDelete,
        enableRegenerate: enableRegenerate,
        enableFeedback: enableFeedback,
        actionsPosition: actionsPosition,
        onEdit: onEdit,
        onDelete: onDelete,
        onRegenerate: onRegenerate,
        onLike: handleLike,
        onDislike: handleDislike,
    }); }, [
        message,
        copied,
        liked,
        showActionsState,
        copyToClipboard,
        regenerateResponse,
        focusMode,
        enableCopy,
        enableEdit,
        enableDelete,
        enableRegenerate,
        enableFeedback,
        actionsPosition,
        onEdit,
        onDelete,
        onRegenerate,
        handleLike,
        handleDislike,
    ]);
    // Process the message content
    var processedContent = (0, react_1.useMemo)(function () {
        if (contentRenderer) {
            return contentRenderer(message.content);
        }
        return (0, utils_1.processMessageContent)(message.content, {
            enableSyntaxHighlighting: enableSyntaxHighlighting,
            enableMarkdown: enableMarkdown,
            enableAutoLink: enableAutoLink,
            enableEmoji: enableEmoji,
        });
    }, [message.content, contentRenderer, enableSyntaxHighlighting, enableMarkdown, enableAutoLink, enableEmoji]);
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
        return (0, utils_2.cn)(hideOnMobile && "hidden sm:flex", hideOnTablet && "hidden md:flex", hideOnDesktop && "flex md:hidden");
    }, [responsive, hideOnMobile, hideOnTablet, hideOnDesktop]);
    // Prepare hover effect classes
    var hoverClasses = (0, react_1.useMemo)(function () {
        if (!showHoverEffect)
            return "";
        return (0, utils_2.cn)(hoverEffect === "highlight" && "hover:bg-".concat(hoverColor, "-50 dark:hover:bg-").concat(hoverColor, "-900/20"), hoverEffect === "glow" && "hover:shadow-".concat(hoverColor), hoverEffect === "scale" && "hover:scale-[1.01]");
    }, [showHoverEffect, hoverEffect, hoverColor]);
    // Prepare highlight classes
    var highlightClasses = (0, react_1.useMemo)(function () {
        if (!highlight)
            return "";
        return (0, utils_2.cn)("bg-".concat(highlightColor, "-50 dark:bg-").concat(highlightColor, "-900/20 border-l-2 border-").concat(highlightColor, "-500"));
    }, [highlight, highlightColor]);
    // Combine all classes
    var allClasses = (0, react_1.useMemo)(function () {
        return (0, utils_2.cn)("message flex ".concat(message.role === "user" ? "justify-end" : "justify-start", " mb-4"), focusMode && "message-actions-below", responsiveClasses, hoverClasses, highlightClasses, className);
    }, [message.role, focusMode, responsiveClasses, hoverClasses, highlightClasses, className]);
    // Prepare data attributes
    var allDataAttributes = (0, react_1.useMemo)(function () { return (__assign({ "data-message-id": message.id, "data-message-role": message.role, "data-message-sequential": isSequential ? "true" : "false", "data-message-editing": isEditing ? "true" : "false", "data-message-focus-mode": focusMode ? "true" : "false", "data-component": "ChatMessage", "data-component-path": "@/components/chat/chat-message" }, (dataAttributes || {}))); }, [message.id, message.role, isSequential, isEditing, focusMode, dataAttributes]);
    /**
     * Handle mouse enter event
     */
    var handleMouseEnter = (0, react_1.useCallback)(function () {
        setIsHovered(true);
        onHover === null || onHover === void 0 ? void 0 : onHover(true);
    }, [onHover]);
    /**
     * Handle mouse leave event
     */
    var handleMouseLeave = (0, react_1.useCallback)(function () {
        setIsHovered(false);
        onHover === null || onHover === void 0 ? void 0 : onHover(false);
    }, [onHover]);
    return ((0, jsx_runtime_1.jsx)(ChatMessageContext.Provider, { value: contextValue, children: (0, jsx_runtime_1.jsx)("div", __assign({ className: allClasses, style: combinedStyle, id: id, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, onClick: onClick }, allDataAttributes, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col ".concat(message.role === "user" ? "items-end" : "items-start"), children: [message.role === "user" ? ((0, jsx_runtime_1.jsx)(user_message_1.UserMessage, { content: processedContent, showSender: showSender, isSequential: isSequential, isEditing: isEditing, showTimestamp: showTimestamp, timestampFormat: timestampFormat, showAvatar: showAvatar, avatarSize: avatarSize, contentRenderer: contentRenderer, timestampRenderer: timestampRenderer, senderRenderer: senderRenderer, avatarRenderer: avatarRenderer, disabled: disabled })) : ((0, jsx_runtime_1.jsx)(assistant_message_1.AssistantMessage, { content: processedContent, showSender: showSender, isSequential: isSequential, showTimestamp: showTimestamp, timestampFormat: timestampFormat, showAvatar: showAvatar, avatarSize: avatarSize, enableSyntaxHighlighting: enableSyntaxHighlighting, enableMarkdown: enableMarkdown, enableAutoLink: enableAutoLink, enableEmoji: enableEmoji, contentRenderer: contentRenderer, timestampRenderer: timestampRenderer, senderRenderer: senderRenderer, avatarRenderer: avatarRenderer, disabled: disabled })), showTimestamp && timestampRenderer
                        ? timestampRenderer(message.timestamp)
                        : showTimestamp && ((0, jsx_runtime_1.jsx)(message_timestamp_1.MessageTimestamp, { timestamp: message.timestamp, format: timestampFormat, isMobile: true })), showActions && ((0, jsx_runtime_1.jsx)("div", { className: "message-actions-container ".concat(actionsPosition === "below" || focusMode ? "mt-2" : "mt-0"), children: actionsRenderer ? (actionsRenderer(message)) : ((0, jsx_runtime_1.jsx)(message_actions_1.MessageActions, { visible: showActionsVisible, position: actionsPosition, enableCopy: enableCopy, enableEdit: enableEdit, enableDelete: enableDelete, enableRegenerate: enableRegenerate && message.role === "assistant", enableFeedback: enableFeedback && message.role === "assistant", enableSave: enableSave, enableShare: enableShare, enableTranslation: enableTranslation, enableTextToSpeech: enableTextToSpeech, enableForwarding: enableForwarding, enableThreading: enableThreading, onEdit: onEdit, onDelete: onDelete, onCopy: copyToClipboard, onRegenerate: regenerateResponse, onLike: handleLike, onDislike: handleDislike, onSave: onSave, onShare: onShare, onTranslate: onTranslate, onTextToSpeech: onTextToSpeech, onForward: onForward, onThread: onThread })) }))] }) })) }));
}
