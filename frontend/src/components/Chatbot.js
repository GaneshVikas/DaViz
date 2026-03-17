import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Bot, User, Loader2, Database } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Chatbot = ({ datasetId, datasetName, datasetColumns, rowCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Generate welcome message based on dataset context
  const getWelcomeMessage = () => {
    if (datasetId && datasetName) {
      return `Hi! I'm DaViz Assistant, and I can see you're viewing the "${datasetName}" dataset with ${rowCount} rows and ${datasetColumns?.length || 0} columns (${datasetColumns?.map(c => c.name).join(', ') || 'no columns'}).

Ask me anything about:
• This specific dataset and its patterns
• Which visualizations work best for your data
• How to use DaViz features
• Tips for data analysis`;
    }
    return `Hi! I'm DaViz Assistant. I can help you learn how to use this data visualization platform. Ask me anything about creating datasets, visualizations, or AI predictions!`;
  };

  // Initialize welcome message when component mounts or dataset changes
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: getWelcomeMessage()
    }]);
  }, [datasetId, datasetName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: userMessage,
        session_id: sessionId,
        conversation_history: messages.map(m => ({ role: m.role, content: m.content })),
        dataset_id: datasetId || null
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick suggestion buttons
  const quickSuggestions = datasetId ? [
    "What patterns do you see in my data?",
    "Which chart is best for this dataset?",
    "How can I use AI predictions?"
  ] : [
    "How do I create a dataset?",
    "What chart types are available?",
    "How do I import a CSV file?"
  ];

  const handleQuickSuggestion = (suggestion) => {
    setInputValue(suggestion);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          data-testid="chatbot-toggle-btn"
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-full shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all hover:scale-110 flex items-center justify-center z-50"
        >
          <MessageCircle className="w-6 h-6" strokeWidth={2} />
          {datasetId && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
              <Database className="w-2.5 h-2.5 text-white" />
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-6 right-6 w-[400px] h-[550px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden"
          data-testid="chatbot-window"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-white font-bold">DaViz Assistant</h3>
                {datasetId ? (
                  <p className="text-violet-200 text-xs flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    Viewing: {datasetName}
                  </p>
                ) : (
                  <p className="text-violet-200 text-xs">Ask me anything!</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              data-testid="chatbot-close-btn"
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                    : 'bg-gradient-to-br from-violet-500 to-indigo-500'
                }`}>
                  {msg.role === 'user' 
                    ? <User className="w-4 h-4 text-white" strokeWidth={2} />
                    : <Bot className="w-4 h-4 text-white" strokeWidth={2} />
                  }
                </div>
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-tr-sm'
                    : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm shadow-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm">
                  <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-white border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputValue(suggestion);
                    }}
                    className="text-xs bg-slate-100 hover:bg-violet-100 text-slate-600 hover:text-violet-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={datasetId ? "Ask about your data..." : "Type your question..."}
                data-testid="chatbot-input"
                className="flex-1 bg-slate-100 border-0 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none placeholder:text-slate-400"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                data-testid="chatbot-send-btn"
                className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
