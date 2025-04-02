"use client";
import AuthGuard from "../utils/authGuard";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

type ConversationContext = 
  | 'sleep'
  | 'medical'
  | 'symptoms'
  | 'prescription'
  | 'calorie'
  | 'weight'
  | 'knowledge'
  | null;

const contextOptions = [
  { id: 'sleep', label: 'Sleep Assistance', icon: '😴' },
  { id: 'medical', label: 'Medical Advice', icon: '🏥' },
  { id: 'symptoms', label: 'Symptom Check', icon: '🤒' },
  { id: 'prescription', label: 'Prescription Help', icon: '💊' },
  { id: 'calorie', label: 'Calorie Tracking', icon: '🍎' },
  { id: 'weight', label: 'Weight Management', icon: '⚖️' },
  { id: 'knowledge', label: 'Fitness Knowledge', icon: '📚' },
];

const Assistant = () => {
  const [selectedContext, setSelectedContext] = useState<ConversationContext>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getInitialMessage = (context: ConversationContext) => {
    const contextMessages: { [key: string]: string } = {
      sleep: "How can I help you improve your sleep patterns?",
      medical: "What medical information do you need assistance with?",
      symptoms: "Please describe your symptoms, and I'll try to help.",
      prescription: "How can I assist you with your prescription information?",
      calorie: "Let's discuss your calorie tracking goals.",
      weight: "How can I help you with weight management?",
      knowledge: "What fitness-related information would you like to learn about?",
    };
    
    return contextMessages[context as string] || "How can I assist you today?";
  };

  const startConversation = (context: ConversationContext) => {
    setSelectedContext(context);
    const initialMessage: Message = {
      id: Date.now(),
      text: getInitialMessage(context),
      sender: 'assistant',
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: Date.now() + 1,
        text: "I'm here to help you with your fitness journey!",
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);

    setNewMessage('');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-800 text-gray-200 p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold text-center mb-8">Fitness Assistant</h1>
          
          {!selectedContext ? (
            // Context Selection Screen
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contextOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => startConversation(option.id as ConversationContext)}
                  className="bg-gray-700 p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-600 transition"
                >
                  <div className="text-4xl mb-2">{option.icon}</div>
                  <h3 className="text-xl font-semibold">{option.label}</h3>
                </div>
              ))}
            </div>
          ) : (
            // Chat Interface
            <div className="bg-gray-700 rounded-lg shadow-lg p-4 h-[600px] flex flex-col">
              {/* Context Header */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {contextOptions.find(opt => opt.id === selectedContext)?.icon}
                  </span>
                  <h2 className="text-lg font-semibold">
                    {contextOptions.find(opt => opt.id === selectedContext)?.label}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedContext(null);
                    setMessages([]);
                  }}
                  className="text-sm px-3 py-1 bg-gray-600 rounded-lg hover:bg-gray-500 transition"
                >
                  Change Topic
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${
                      message.sender === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-gray-200'
                      }`}
                    >
                      {message.text}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 rounded-lg bg-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default Assistant;