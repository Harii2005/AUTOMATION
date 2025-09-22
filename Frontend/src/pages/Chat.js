import React, { useState, useEffect, useRef } from "react";
import { api } from "../utils/api";
import {
  Send,
  Bot,
  User,
  Loader,
  Copy,
  Check,
  Sparkles,
  MessageSquare,
} from "lucide-react";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: 1,
        content:
          "Hello! I'm your AI assistant for social media content creation. I can help you write engaging posts, suggest hashtags, create captions, and brainstorm content ideas. What would you like to work on today?",
        isBot: true,
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await api.chatWithAI(inputMessage);

      const botMessage = {
        id: Date.now() + 1,
        content: response.data.response,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage = {
        id: Date.now() + 1,
        content:
          "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        isBot: true,
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = async (content, messageId) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessage(messageId);
      setTimeout(() => setCopiedMessage(null), 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const quickPrompts = [
    "Write a social media post about productivity tips",
    "Create an engaging Instagram caption for a food photo",
    "Suggest hashtags for a tech startup",
    "Write a LinkedIn post about professional growth",
    "Create a Twitter thread about remote work",
    "Write a Facebook post for a small business",
  ];

  const handleQuickPrompt = (prompt) => {
    setInputMessage(prompt);
  };

  const MessageBubble = ({ message }) => {
    const isBot = message.isBot;

    return (
      <div className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4`}>
        <div
          className={`flex items-start space-x-2 max-w-xs lg:max-w-md xl:max-w-lg ${
            isBot ? "" : "flex-row-reverse space-x-reverse"
          }`}
        >
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isBot ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            {isBot ? (
              <Bot className="w-5 h-5 text-blue-600" />
            ) : (
              <User className="w-5 h-5 text-gray-600" />
            )}
          </div>

          <div className={`relative group ${isBot ? "mr-8" : "ml-8"}`}>
            <div
              className={`px-4 py-2 rounded-lg ${
                isBot
                  ? message.isError
                    ? "bg-red-50 text-red-800 border border-red-200"
                    : "bg-white border border-gray-200 shadow-sm"
                  : "bg-blue-600 text-white"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>

            <div
              className={`flex items-center mt-1 space-x-2 ${
                isBot ? "" : "justify-end"
              }`}
            >
              <span className="text-xs text-gray-500">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              {isBot && !message.isError && (
                <button
                  onClick={() => handleCopyMessage(message.content, message.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
                  title="Copy message"
                >
                  {copiedMessage === message.id ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-gray-400" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-4xl lg:mx-auto lg:px-8">
          <div className="py-6">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold leading-7 text-gray-900">
                  AI Content Assistant
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Get help creating engaging social media content
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 1 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Quick prompts to get started:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="text-left p-3 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me to help with your social media content..."
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Tips for better results:
              </h3>
              <ul className="mt-2 text-sm text-blue-800 space-y-1">
                <li>• Be specific about your target audience and platform</li>
                <li>
                  • Mention the tone you want (professional, casual, funny,
                  etc.)
                </li>
                <li>
                  • Include relevant keywords or topics you want to focus on
                </li>
                <li>
                  • Ask for specific types of content (captions, hashtags, full
                  posts)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
