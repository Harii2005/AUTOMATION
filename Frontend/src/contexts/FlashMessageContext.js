import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

const FlashMessageContext = createContext();

export const FlashMessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);

  const addMessage = useCallback((message, type = "info", duration = 5000) => {
    const id = Date.now() + Math.random();
    const newMessage = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration,
    };

    setMessages((prev) => [...prev, newMessage]);

    if (duration > 0) {
      setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }, duration);
    }
  }, []);

  const removeMessage = useCallback((id) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const clearAllMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value = {
    messages,
    addMessage,
    removeMessage,
    clearAllMessages,
    // Convenience methods
    addSuccess: useCallback(
      (message, duration = 5000) => addMessage(message, "success", duration),
      [addMessage]
    ),
    addError: useCallback(
      (message, duration = 7000) => addMessage(message, "error", duration),
      [addMessage]
    ),
    addWarning: useCallback(
      (message, duration = 6000) => addMessage(message, "warning", duration),
      [addMessage]
    ),
    addInfo: useCallback(
      (message, duration = 4000) => addMessage(message, "info", duration),
      [addMessage]
    ),
  };

  return (
    <FlashMessageContext.Provider value={value}>
      {children}
      <FlashMessageContainer />
    </FlashMessageContext.Provider>
  );
};

const FlashMessageContainer = () => {
  const { messages, removeMessage } = useFlashMessage();

  if (messages.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {messages.map((message) => (
        <FlashMessage
          key={message.id}
          message={message}
          onClose={() => removeMessage(message.id)}
        />
      ))}
    </div>
  );
};

const FlashMessage = ({ message, onClose }) => {
  const getMessageStyles = (type) => {
    const styles = {
      success: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-800",
        icon: CheckCircle,
        iconColor: "text-green-400",
      },
      error: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
        icon: XCircle,
        iconColor: "text-red-400",
      },
      warning: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-800",
        icon: AlertTriangle,
        iconColor: "text-yellow-400",
      },
      info: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        icon: Info,
        iconColor: "text-blue-400",
      },
    };
    return styles[type] || styles.info;
  };

  const styles = getMessageStyles(message.type);
  const Icon = styles.icon;

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-lg p-4 shadow-lg animate-slide-in`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${styles.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${styles.text}`}>
            {message.message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className={`${styles.bg} rounded-md inline-flex ${styles.text} hover:${styles.text} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${message.type}-50 focus:ring-${message.type}-600`}
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const useFlashMessage = () => {
  const context = useContext(FlashMessageContext);
  if (!context) {
    throw new Error(
      "useFlashMessage must be used within a FlashMessageProvider"
    );
  }
  return context;
};
