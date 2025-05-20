"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ConversationSidebar;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var scroll_area_1 = require("@/components/ui/scroll-area");
var badge_1 = require("@/components/ui/badge");
var app_context_1 = require("@/contexts/app-context");
function ConversationSidebar(_a) {
    var conversations = _a.conversations, currentConversationId = _a.currentConversationId, onSelectConversation = _a.onSelectConversation, onNewConversation = _a.onNewConversation, onDeleteConversation = _a.onDeleteConversation, onClearConversations = _a.onClearConversations;
    var _b = (0, react_1.useState)(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = (0, react_1.useState)(false), showSearch = _c[0], setShowSearch = _c[1];
    var setLastAction = (0, app_context_1.useApp)().setLastAction;
    // Formata a data para exibição
    var formatDate = function (timestamp) {
        var date = new Date(timestamp);
        var today = new Date();
        var yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === today.toDateString()) {
            return "Hoje, ".concat(date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        }
        else if (date.toDateString() === yesterday.toDateString()) {
            return "Ontem, ".concat(date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        }
        else {
            return date.toLocaleDateString([], {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        }
    };
    // Filtra as conversas com base na pesquisa
    var filteredConversations = conversations
        .filter(function (conv) { return searchQuery === "" || conv.title.toLowerCase().includes(searchQuery.toLowerCase()); })
        .sort(function (a, b) { return b.updatedAt - a.updatedAt; }); // Ordena por mais recente primeiro
    return ((0, jsx_runtime_1.jsxs)("div", { className: "w-72 h-full flex flex-col border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm conversation-sidebar transition-colors duration-200", "data-component": "ConversationSidebar", "data-component-path": "@/components/chat/conversation-sidebar", children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-4 border-b border-gray-100 dark:border-gray-700", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-semibold text-gray-800 dark:text-gray-200", children: "Conversas" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-1", children: [showSearch ? ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700", onClick: function () {
                                            setShowSearch(false);
                                            setSearchQuery("");
                                        }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4 text-gray-600 dark:text-gray-300" }) })) : ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700", onClick: function () { return setShowSearch(true); }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "h-4 w-4 text-gray-600 dark:text-gray-300" }) })), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700", children: (0, jsx_runtime_1.jsx)(lucide_react_1.MoreVertical, { className: "h-4 w-4 text-gray-600 dark:text-gray-300" }) }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-48", children: [(0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: "text-red-600 dark:text-red-400 cursor-pointer", onClick: onClearConversations, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }), "Limpar todas as conversas"] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Filter, { className: "h-4 w-4 mr-2" }), "Filtrar conversas"] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.SortDesc, { className: "h-4 w-4 mr-2" }), "Ordenar por data"] })] })] })] })] }), showSearch && ((0, jsx_runtime_1.jsx)("div", { className: "mt-2 animate-in", children: (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Pesquisar conversas...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "h-9 text-sm rounded-full bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 focus:border-primary/30 focus:ring-primary/20 pl-4" }) })), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "default", className: "w-full mt-3 bg-primary hover:bg-primary/90 text-white rounded-full h-10 shadow-sm transition-all duration-200 hover:shadow", onClick: function () {
                            onNewConversation();
                            // Use a more stable way to set the last action
                            setTimeout(function () {
                                setLastAction("Nova conversa criada");
                            }, 0);
                        }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.PlusCircle, { className: "h-4 w-4 mr-2" }), "Nova conversa"] })] }), (0, jsx_runtime_1.jsx)(scroll_area_1.ScrollArea, { className: "flex-1 overflow-y-auto scrollbar-thin", children: filteredConversations.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "p-4 text-center text-gray-500 dark:text-gray-400 text-sm", children: searchQuery ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda" })) : ((0, jsx_runtime_1.jsx)("ul", { className: "py-2", children: filteredConversations.map(function (conversation) { return ((0, jsx_runtime_1.jsx)("li", { className: "group px-2", children: (0, jsx_runtime_1.jsxs)("button", { className: "w-full text-left px-3 py-2.5 flex items-start rounded-lg transition-all duration-200 ".concat(conversation.id === currentConversationId
                                ? "bg-primary/10 dark:bg-primary/20 text-primary"
                                : "hover:bg-gray-50 dark:hover:bg-gray-700"), onClick: function () { return onSelectConversation(conversation.id); }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MessageSquare, { className: "h-5 w-5 mr-3 flex-shrink-0 mt-0.5 ".concat(conversation.id === currentConversationId ? "text-primary" : "text-gray-400 dark:text-gray-500") }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "font-medium text-sm truncate text-gray-700 dark:text-gray-200", children: conversation.title }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: formatDate(conversation.updatedAt) }), conversation.id === currentConversationId && ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6 ml-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-opacity duration-200", onClick: function (e) {
                                                        e.stopPropagation();
                                                        onDeleteConversation(conversation.id);
                                                        setLastAction("Conversa excluída");
                                                    }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-3 w-3" }) }))] }), conversation.metadata && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-1.5 flex flex-wrap gap-1", children: [conversation.metadata.model && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", className: "text-[10px] h-5 px-1.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-100 dark:border-gray-600", children: conversation.metadata.model.split("-")[0] })), conversation.metadata.tool && conversation.metadata.tool !== "No Tools" && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", className: "text-[10px] h-5 px-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border-blue-100 dark:border-blue-800", children: conversation.metadata.tool }))] }))] })] }) }, conversation.id)); }) })) }), (0, jsx_runtime_1.jsx)("div", { className: "p-4 border-t border-gray-100 dark:border-gray-700", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-2 transition-colors duration-200", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-2", children: (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-600 dark:text-gray-300", children: "J" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-700 dark:text-gray-200", children: "Jo\u00E3o Victor" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-500 dark:text-gray-400 flex items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "w-1.5 h-1.5 bg-green-500 rounded-full mr-1" }), "Online"] })] })] }) })] }));
}
