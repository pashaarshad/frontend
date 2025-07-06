import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Search, Upload, GraphIcon } from 'lucide-react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [includeScholarly, setIncludeScholarly] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputValue,
          include_scholarly: includeScholarly
        })
      });

      const data = await response.json();

      if (response.ok) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.response,
          sources: data.sources,
          timestamp: data.timestamp
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'error',
          content: data.error || 'Sorry, I encountered an error processing your request.',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, I cannot connect to the server right now.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">IntelliGraph Bot</h1>
              <p className="text-sm text-gray-500">AI-powered knowledge assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={includeScholarly}
                onChange={(e) => setIncludeScholarly(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span>Include Research Papers</span>
            </label>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Welcome to IntelliGraph Bot</h3>
            <p className="text-sm">Ask me anything about AI, knowledge graphs, or upload documents for analysis.</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md mx-auto">
              <button
                onClick={() => setInputValue("What is a knowledge graph?")}
                className="p-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                What is a knowledge graph?
              </button>
              <button
                onClick={() => setInputValue("How does AI safety work?")}
                className="p-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                How does AI safety work?
              </button>
              <button
                onClick={() => setInputValue("Latest AI research trends")}
                className="p-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                Latest AI research trends
              </button>
              <button
                onClick={() => setInputValue("Machine learning basics")}
                className="p-2 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
              >
                Machine learning basics
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.type === 'error'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                {message.type === 'user' ? (
                  <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <Bot className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
                )}
                <div className="flex-1">
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {message.sources && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Sources:</div>
                      
                      {message.sources.knowledge_graph && message.sources.knowledge_graph.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs font-medium text-gray-500 mb-1">Knowledge Graph:</div>
                          <div className="space-y-1">
                            {message.sources.knowledge_graph.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded">
                                {item.entity}: {item.description}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {message.sources.scholarly && message.sources.scholarly.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs font-medium text-gray-500 mb-1">Research Papers:</div>
                          <div className="space-y-1">
                            {message.sources.scholarly.slice(0, 2).map((paper, idx) => (
                              <div key={idx} className="text-xs bg-green-50 text-green-800 px-2 py-1 rounded">
                                <a href={paper.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                  {paper.title}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-3xl">
              <div className="flex items-center space-x-3">
                <Bot className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about AI, knowledge graphs, or research..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="2"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
