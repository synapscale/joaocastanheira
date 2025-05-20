/**
 * ChatInterface Component
 *
 * The main interface for the chat application. Manages the display of messages,
 * text input, configuration settings, and user interactions.
 *
 * @ai-pattern main-component
 * Central component that orchestrates the chat experience
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ChatInterface;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var chat_input_1 = require("./chat-input");
var chat_header_1 = require("./chat-header");
var messages_area_1 = require("./messages-area");
var conversation_sidebar_1 = __importDefault(require("./conversation-sidebar"));
var use_conversations_1 = require("@/hooks/use-conversations");
var app_context_1 = require("@/contexts/app-context");
var notification_1 = require("@/components/ui/notification");
var use_toast_1 = require("@hooks/use-toast");
var model_selector_sidebar_1 = __importDefault(require("./model-selector-sidebar"));
var tool_selector_1 = __importDefault(require("./tool-selector"));
var personality_selector_1 = __importDefault(require("./personality-selector"));
var preset_selector_1 = __importDefault(require("./preset-selector"));
var lucide_react_1 = require("lucide-react");
/**
 * ChatInterface component
 * @param props Component props
 * @returns ChatInterface component
 */
function ChatInterface(_a) {
    var _this = this;
    var _b = _a.className, className = _b === void 0 ? "" : _b, style = _a.style, id = _a.id, _c = _a.disabled, disabled = _c === void 0 ? false : _c, dataAttributes = _a.dataAttributes, _d = _a.initialMessages, initialMessages = _d === void 0 ? [] : _d, _e = _a.showConfigByDefault, showConfigByDefault = _e === void 0 ? true : _e, _f = _a.enableFileUploads, enableFileUploads = _f === void 0 ? true : _f, _g = _a.maxFileSize, maxFileSize = _g === void 0 ? 10 * 1024 * 1024 : _g, // 10MB
    _h = _a.allowedFileTypes, // 10MB
    allowedFileTypes = _h === void 0 ? ["image/*", "application/pdf", ".txt", ".md", ".csv"] : _h, _j = _a.inputPlaceholder, inputPlaceholder = _j === void 0 ? "Type your message here or @ to mention..." : _j, _k = _a.maxInputHeight, maxInputHeight = _k === void 0 ? 200 : _k, _l = _a.enableAutoScroll, enableAutoScroll = _l === void 0 ? true : _l, _m = _a.showMessageTimestamps, showMessageTimestamps = _m === void 0 ? true : _m, _o = _a.showMessageSenders, showMessageSenders = _o === void 0 ? true : _o, chatBackground = _a.chatBackground, onMessageSent = _a.onMessageSent, onMessageReceived = _a.onMessageReceived, onConversationExport = _a.onConversationExport, onConversationCreated = _a.onConversationCreated, onConversationDeleted = _a.onConversationDeleted;
    // SECTION: Local state
    var _p = (0, react_1.useState)(""), inputValue = _p[0], setInputValue = _p[1];
    var _q = (0, react_1.useState)(false), isLoading = _q[0], setIsLoading = _q[1];
    var _r = (0, react_1.useState)(false), isDragOver = _r[0], setIsDragOver = _r[1];
    var _s = (0, react_1.useState)("idle"), status = _s[0], setStatus = _s[1];
    var _t = (0, react_1.useState)([]), uploadedFiles = _t[0], setUploadedFiles = _t[1];
    // SECTION: Application context
    var _u = (0, app_context_1.useApp)(), selectedModel = _u.selectedModel, selectedTool = _u.selectedTool, selectedPersonality = _u.selectedPersonality, showConfig = _u.showConfig, setShowConfig = _u.setShowConfig, isSidebarOpen = _u.isSidebarOpen, setIsSidebarOpen = _u.setIsSidebarOpen, theme = _u.theme, focusMode = _u.focusMode, setFocusMode = _u.setFocusMode, lastAction = _u.lastAction, setLastAction = _u.setLastAction, isComponentSelectorActive = _u.isComponentSelectorActive, setComponentSelectorActive = _u.setComponentSelectorActive;
    // SECTION: Conversations hook
    var _v = (0, use_conversations_1.useConversations)(), conversations = _v.conversations, currentConversationId = _v.currentConversationId, currentConversation = _v.currentConversation, isLoaded = _v.isLoaded, createConversation = _v.createConversation, updateConversation = _v.updateConversation, addMessageToConversation = _v.addMessageToConversation, deleteConversation = _v.deleteConversation, clearAllConversations = _v.clearAllConversations, setCurrentConversationId = _v.setCurrentConversationId;
    // SECTION: References
    var messagesEndRef = (0, react_1.useRef)(null);
    var fileInputRef = (0, react_1.useRef)(null);
    // SECTION: Toast notifications
    var toast = (0, use_toast_1.useToast)().toast;
    // SECTION: Derived state
    var isConversationActive = (0, react_1.useMemo)(function () { return Boolean(currentConversationId); }, [currentConversationId]);
    var isInputDisabled = (0, react_1.useMemo)(function () { return disabled || !isConversationActive || isLoading; }, [disabled, isConversationActive, isLoading]);
    // SECTION: Effects
    /**
     * Create a new conversation if none exists
     * @ai-pattern initialization
     * Ensures a conversation exists when the component loads
     */
    (0, react_1.useEffect)(function () {
        if (isLoaded && !currentConversationId && conversations.length === 0) {
            var newConversation = createConversation(initialMessages, {
                model: selectedModel.id,
                tool: selectedTool,
                personality: selectedPersonality,
            });
            onConversationCreated === null || onConversationCreated === void 0 ? void 0 : onConversationCreated(newConversation);
        }
    }, [
        isLoaded,
        currentConversationId,
        conversations.length,
        createConversation,
        selectedModel,
        selectedTool,
        selectedPersonality,
        initialMessages,
        onConversationCreated,
    ]);
    /**
     * Scroll to the latest message when new messages are added
     * @ai-pattern auto-scroll
     * Improves user experience by keeping the latest messages visible
     */
    (0, react_1.useEffect)(function () {
        if (enableAutoScroll && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [currentConversation === null || currentConversation === void 0 ? void 0 : currentConversation.messages, enableAutoScroll]);
    /**
     * Apply focus mode styles
     * @ai-pattern ui-mode
     * Toggles focus mode styling for distraction-free experience
     */
    (0, react_1.useEffect)(function () {
        if (focusMode) {
            document.body.classList.add("focus-mode");
        }
        else {
            document.body.classList.remove("focus-mode");
        }
        return function () {
            document.body.classList.remove("focus-mode");
        };
    }, [focusMode]);
    // SECTION: Event handlers
    /**
     * Sends a message and processes the response
     * @param message The message to send
     * @ai-pattern message-handling
     * Core message sending and response handling logic
     */
    var handleSendMessage = (0, react_1.useCallback)(function (message) { return __awaiter(_this, void 0, void 0, function () {
        var userMessage, response, data, assistantMessage, error_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!message.trim() || isLoading || !currentConversationId || disabled)
                        return [2 /*return*/];
                    userMessage = {
                        id: "msg_".concat(Date.now()),
                        role: "user",
                        content: message,
                        timestamp: Date.now(),
                    };
                    // Add message to conversation
                    addMessageToConversation(userMessage);
                    setStatus("loading");
                    setIsLoading(true);
                    // Call the onMessageSent callback
                    onMessageSent === null || onMessageSent === void 0 ? void 0 : onMessageSent(userMessage);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch("/api/chat", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                message: message,
                                model: selectedModel.id,
                                personality: selectedPersonality,
                                tools: selectedTool,
                                files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("API error: ".concat(response.status, " ").concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()
                        // Create assistant message
                    ];
                case 3:
                    data = _a.sent();
                    assistantMessage = {
                        id: data.id || "msg_".concat(Date.now() + 1),
                        role: "assistant",
                        content: data.content,
                        model: data.model || selectedModel.name,
                        timestamp: Date.now(),
                    };
                    // Add message to conversation
                    addMessageToConversation(assistantMessage);
                    setStatus("success");
                    // Call the onMessageReceived callback
                    onMessageReceived === null || onMessageReceived === void 0 ? void 0 : onMessageReceived(assistantMessage);
                    // Clear uploaded files after successful message
                    setUploadedFiles([]);
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error("Error sending message:", error_1);
                    setStatus("error");
                    errorMessage = {
                        id: "msg_".concat(Date.now() + 1),
                        role: "assistant",
                        content: "Sorry, an error occurred while processing your message. Please try again.",
                        model: selectedModel.name,
                        isError: true,
                        timestamp: Date.now(),
                    };
                    addMessageToConversation(errorMessage);
                    onMessageReceived === null || onMessageReceived === void 0 ? void 0 : onMessageReceived(errorMessage);
                    // Show error toast
                    toast({
                        title: "Error",
                        description: "Failed to send message. Please try again.",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [
        isLoading,
        currentConversationId,
        disabled,
        selectedModel,
        selectedPersonality,
        selectedTool,
        uploadedFiles,
        addMessageToConversation,
        onMessageSent,
        onMessageReceived,
        toast,
    ]);
    /**
     * Creates a new conversation
     * @ai-pattern conversation-management
     * Handles creation of new conversations
     */
    var handleNewConversation = (0, react_1.useCallback)(function () {
        var newConversation = createConversation([], {
            model: selectedModel.id,
            tool: selectedTool,
            personality: selectedPersonality,
        });
        setIsSidebarOpen(false); // Close sidebar on mobile after creating a new conversation
        onConversationCreated === null || onConversationCreated === void 0 ? void 0 : onConversationCreated(newConversation);
    }, [createConversation, selectedModel, selectedTool, selectedPersonality, setIsSidebarOpen, onConversationCreated]);
    /**
     * Updates the title of the current conversation
     * @param title The new title
     */
    var handleUpdateConversationTitle = (0, react_1.useCallback)(function (title) {
        if (currentConversationId) {
            updateConversation(currentConversationId, { title: title });
        }
    }, [currentConversationId, updateConversation]);
    /**
     * Exports the current conversation as JSON
     * @ai-pattern data-export
     * Handles exporting conversation data
     */
    var handleExportConversation = (0, react_1.useCallback)(function () {
        if (!currentConversation)
            return;
        var conversationData = {
            title: currentConversation.title,
            messages: currentConversation.messages,
            metadata: currentConversation.metadata,
            exportedAt: new Date().toISOString(),
        };
        var blob = new Blob([JSON.stringify(conversationData, null, 2)], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "".concat(currentConversation.title.replace(/\s+/g, "-").toLowerCase(), "-").concat(new Date().toISOString().split("T")[0], ".json");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onConversationExport === null || onConversationExport === void 0 ? void 0 : onConversationExport(currentConversation);
    }, [currentConversation, onConversationExport]);
    /**
     * Handles file selection
     * @param e The change event
     * @ai-pattern file-handling
     * Processes and validates file uploads
     */
    var handleFileSelect = (0, react_1.useCallback)(function (e) {
        var files = e.target.files;
        if (!files || files.length === 0)
            return;
        // Validate file size and type
        var validFiles = [];
        var invalidFiles = [];
        Array.from(files).forEach(function (file) {
            // Check file size
            if (file.size > maxFileSize) {
                invalidFiles.push({
                    file: file,
                    reason: "File size exceeds the maximum allowed size (".concat((maxFileSize / (1024 * 1024)).toFixed(1), "MB)"),
                });
                return;
            }
            // Check file type
            var isAllowedType = allowedFileTypes.some(function (type) {
                if (type.startsWith(".")) {
                    // Check file extension
                    return file.name.toLowerCase().endsWith(type.toLowerCase());
                }
                else if (type.includes("*")) {
                    // Check MIME type pattern (e.g., "image/*")
                    var category = type.split("/")[0];
                    return file.type.startsWith("".concat(category, "/"));
                }
                else {
                    // Check exact MIME type
                    return file.type === type;
                }
            });
            if (!isAllowedType) {
                invalidFiles.push({ file: file, reason: "File type not allowed" });
                return;
            }
            validFiles.push(file);
        });
        // Add valid files to state
        if (validFiles.length > 0) {
            setUploadedFiles(function (prev) { return __spreadArray(__spreadArray([], prev, true), validFiles, true); });
            toast({
                title: "Files added",
                description: "".concat(validFiles.length, " file(s) added successfully."),
                variant: "success",
            });
        }
        // Show errors for invalid files
        if (invalidFiles.length > 0) {
            toast({
                title: "Some files couldn't be added",
                description: "".concat(invalidFiles.length, " file(s) were rejected due to size or type restrictions."),
                variant: "warning",
            });
        }
        // Reset the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [maxFileSize, allowedFileTypes, toast]);
    /**
     * Removes a file from the uploaded files list
     * @param index The index of the file to remove
     */
    var handleRemoveFile = (0, react_1.useCallback)(function (index) {
        setUploadedFiles(function (prev) { return prev.filter(function (_, i) { return i !== index; }); });
    }, []);
    /**
     * Handles the drag over event
     * @param e The drag event
     */
    var handleDragOver = (0, react_1.useCallback)(function (e) {
        e.preventDefault();
        setIsDragOver(true);
    }, []);
    /**
     * Handles the drag leave event
     * @param e The drag event
     */
    var handleDragLeave = (0, react_1.useCallback)(function (e) {
        e.preventDefault();
        setIsDragOver(false);
    }, []);
    /**
     * Handles the drop event
     * @param e The drag event
     * @ai-pattern drag-and-drop
     * Processes dropped files and components
     */
    var handleDrop = (0, react_1.useCallback)(function (e) {
        e.preventDefault();
        setIsDragOver(false);
        // Handle dropped files
        if (enableFileUploads && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            var droppedFiles = Array.from(e.dataTransfer.files);
            // Validate file size and type
            var validFiles_1 = [];
            var invalidFiles_1 = [];
            droppedFiles.forEach(function (file) {
                // Check file size
                if (file.size > maxFileSize) {
                    invalidFiles_1.push({
                        file: file,
                        reason: "File size exceeds the maximum allowed size (".concat((maxFileSize / (1024 * 1024)).toFixed(1), "MB)"),
                    });
                    return;
                }
                // Check file type
                var isAllowedType = allowedFileTypes.some(function (type) {
                    if (type.startsWith(".")) {
                        // Check file extension
                        return file.name.toLowerCase().endsWith(type.toLowerCase());
                    }
                    else if (type.includes("*")) {
                        // Check MIME type pattern (e.g., "image/*")
                        var category = type.split("/")[0];
                        return file.type.startsWith("".concat(category, "/"));
                    }
                    else {
                        // Check exact MIME type
                        return file.type === type;
                    }
                });
                if (!isAllowedType) {
                    invalidFiles_1.push({ file: file, reason: "File type not allowed" });
                    return;
                }
                validFiles_1.push(file);
            });
            // Add valid files to state
            if (validFiles_1.length > 0) {
                setUploadedFiles(function (prev) { return __spreadArray(__spreadArray([], prev, true), validFiles_1, true); });
                toast({
                    title: "Files added",
                    description: "".concat(validFiles_1.length, " file(s) added successfully."),
                    variant: "success",
                });
            }
            // Show errors for invalid files
            if (invalidFiles_1.length > 0) {
                toast({
                    title: "Some files couldn't be added",
                    description: "".concat(invalidFiles_1.length, " file(s) were rejected due to size or type restrictions."),
                    variant: "warning",
                });
            }
            return;
        }
        // Handle dropped component references
        try {
            var data = e.dataTransfer.getData("application/json");
            if (data) {
                var componentData = JSON.parse(data);
                // Create a formatted component reference
                var componentRef = "<ComponentReference name=\"".concat(componentData.name, "\" path=\"").concat(componentData.path, "\" />");
                // Notify the user
                toast({
                    title: "Component inserted",
                    description: "Reference to ".concat(componentData.name, " component added to chat"),
                    variant: "success",
                });
            }
        }
        catch (error) {
            console.error("Error processing dropped component:", error);
            toast({
                title: "Error inserting component",
                description: "Could not process the dropped component",
                variant: "destructive",
            });
        }
    }, [enableFileUploads, maxFileSize, allowedFileTypes, toast]);
    /**
     * Handles the deletion of a conversation
     * @param conversationId The ID of the conversation to delete
     */
    var handleDeleteConversation = (0, react_1.useCallback)(function (conversationId) {
        deleteConversation(conversationId);
        onConversationDeleted === null || onConversationDeleted === void 0 ? void 0 : onConversationDeleted(conversationId);
    }, [deleteConversation, onConversationDeleted]);
    /**
     * Toggles the component selector
     * @ai-pattern component-selection
     * Handles toggling the component selector visibility
     */
    var handleToggleComponentSelector = (0, react_1.useCallback)(function () {
        if (typeof setComponentSelectorActive === "function") {
            setComponentSelectorActive(!isComponentSelectorActive);
        }
    }, [isComponentSelectorActive, setComponentSelectorActive]);
    /**
     * Toggles the configuration panel
     */
    var handleToggleConfig = (0, react_1.useCallback)(function () {
        setShowConfig(function (prev) { return !prev; });
    }, [setShowConfig]);
    // Prepare data attributes
    var allDataAttributes = (0, react_1.useMemo)(function () { return (__assign({ "data-component": "ChatInterface", "data-component-path": "@/components/chat/chat-interface" }, (dataAttributes || {}))); }, [dataAttributes]);
    // Prepare class names
    var containerClassName = (0, react_1.useMemo)(function () {
        return "flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ".concat(focusMode ? "focus-mode" : "", " ").concat(className);
    }, [focusMode, className]);
    // SECTION: Render
    return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: containerClassName, style: style, id: id }, allDataAttributes, { children: [(0, jsx_runtime_1.jsx)(notification_1.Notification, {}), isSidebarOpen && ((0, jsx_runtime_1.jsxs)("div", { className: "fixed inset-0 z-50 md:relative md:z-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 bg-black/50 md:hidden", onClick: function () { return setIsSidebarOpen(false); } }), (0, jsx_runtime_1.jsx)("div", { className: "absolute left-0 top-0 h-full w-72 md:w-auto md:relative md:block", children: (0, jsx_runtime_1.jsx)(conversation_sidebar_1.default, { conversations: conversations, currentConversationId: currentConversationId, onSelectConversation: setCurrentConversationId, onNewConversation: handleNewConversation, onDeleteConversation: handleDeleteConversation, onClearConversations: clearAllConversations }) })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col flex-1 h-full", children: [(0, jsx_runtime_1.jsx)(chat_header_1.ChatHeader, { currentConversation: currentConversation, currentConversationId: currentConversationId, onNewConversation: handleNewConversation, onUpdateConversationTitle: handleUpdateConversationTitle, onDeleteConversation: handleDeleteConversation, onExportConversation: handleExportConversation, onToggleSidebar: function () { return setIsSidebarOpen(!isSidebarOpen); }, onToggleComponentSelector: handleToggleComponentSelector }), (0, jsx_runtime_1.jsx)(messages_area_1.MessagesArea, { messages: (currentConversation === null || currentConversation === void 0 ? void 0 : currentConversation.messages) || [], isLoading: isLoading, showTimestamps: showMessageTimestamps, showSenders: showMessageSenders, focusMode: focusMode, theme: theme, chatBackground: chatBackground, messagesEndRef: messagesEndRef }), (0, jsx_runtime_1.jsx)("div", { className: "border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-lg transition-colors duration-200", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-3xl mx-auto", children: [(0, jsx_runtime_1.jsx)(chat_input_1.ChatInput, { onSendMessage: handleSendMessage, isLoading: isLoading, disabled: isInputDisabled, isDragOver: isDragOver, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop }), showConfig && ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap items-center gap-2 mt-3 px-2 animate-in", children: [(0, jsx_runtime_1.jsx)(model_selector_sidebar_1.default, {}), (0, jsx_runtime_1.jsx)(tool_selector_1.default, {}), (0, jsx_runtime_1.jsx)(personality_selector_1.default, {}), (0, jsx_runtime_1.jsx)(preset_selector_1.default, {})] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center mt-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "ghost", size: "sm", className: "text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full px-3", onClick: handleToggleConfig, children: [showConfig ? "Hide" : "Show", " Settings", (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { className: "h-3 w-3 transition-transform duration-200 ".concat(showConfig ? "rotate-180" : "") })] }), (0, jsx_runtime_1.jsx)("div", { className: "ml-auto", children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", className: "text-xs text-primary flex items-center gap-1 hover:bg-primary/5 dark:hover:bg-primary/10 rounded-full px-3", children: "Tutorial" }) })] })] }) })] })] })));
}
