"use client";
import AuthGuard from "../utils/authGuard";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import {
  getContexts,
  getMessages,
  addMessage,
  sendGeminiQuery,
  createContext as createNewContext,
  deleteContext,
} from "../utils/api";
import Navbar from "../components/navbar";
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string; // Ensure this matches the UUID type from the backend
  text: string;
  sender: "user" | "assistant";
  timestamp: string;
  isTyping?: boolean; // Flag to indicate if message is still being typed
}

interface Context {
  id: string;
  name: string;
}

// Animated text component for typing effect
const AnimatedText = ({ text, isTyping }: { text: string; isTyping: boolean }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (isTyping) {
      if (currentIndex < text.length) {
        const timer = setTimeout(() => {
          setDisplayedText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, 20); // Adjust speed as needed
        return () => clearTimeout(timer);
      }
    } else {
      // If not typing, show full text immediately
      setDisplayedText(text);
      setCurrentIndex(text.length);
    }
  }, [currentIndex, text, isTyping]);
  
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown>{displayedText}</ReactMarkdown>
      {isTyping && currentIndex < text.length && (
        <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse"></span>
      )}
    </div>
  );
};

const ContextCard = ({ context, isSelected, onSelect, onDelete }: { context: Context; isSelected: boolean; onSelect: () => void; onDelete: (e: React.MouseEvent) => void }) => (
  <div
    className={`p-4 rounded-lg shadow-lg cursor-pointer transition transform hover:scale-105 ${
      isSelected ? "bg-blue-700" : "bg-gray-800"
    }`}
    onClick={onSelect}
  >
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <svg className="w-6 h-6 text-violet-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-lg font-semibold">{context.name}</span>
      </div>
      <button
        onClick={onDelete}
        className="text-red-500 hover:text-red-700 p-1"
        title="Delete context"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
);

const Assistant = () => {
  const [contexts, setContexts] = useState<Context[]>([]);
  const [selectedContext, setSelectedContext] = useState<Context | null>(null);
  const [newContextName, setNewContextName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const loadMessages = async (contextId: string, token: string) => {
    try {
      const data = await getMessages(token, contextId);
      const formattedMessages = data.map((msg: any) => ({
        id: msg.id,
        text: msg.message,
        sender: msg.sender,
        timestamp: msg.created_at,
        isTyping: false,
      }));
      setMessages(formattedMessages);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    setIsGenerating(false);
    setIsLoading(false);
    
    // Update the last assistant message to show it's complete
    setMessages(prev => 
      prev.map(msg => 
        msg.sender === "assistant" && msg.isTyping 
          ? { ...msg, isTyping: false } 
          : msg
      )
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContext) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      text: newMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
      isTyping: false,
    };

    setMessages((prev) => [...prev, userMsg]);
    setNewMessage("");
    setIsLoading(true);
    setIsGenerating(true);

    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();

    await addMessage(session.access_token, {
      contextId: selectedContext.id,
      sender: userMsg.sender,
      message: userMsg.text,
    });

    const history = [...messages, userMsg]
      .map((m) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`)
      .join("\n");

    try {
      // Pass the signal to the API function
      const response = await sendGeminiQuery(
        session.access_token, 
        selectedContext.name, 
        history
      );

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        text: response,
        sender: "assistant",
        timestamp: new Date().toISOString(),
        isTyping: true, // Start with typing animation
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
      // Keep isGenerating true until typing animation completes

      // Simulate typing effect by updating the message after a delay
      typingTimeoutRef.current = setTimeout(() => {
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === assistantMsg.id 
              ? { ...msg, isTyping: false } 
              : msg
          )
        );
        // Only set isGenerating to false after typing animation completes
        setIsGenerating(false);
      }, response.length * 20); // Adjust timing based on text length

      await addMessage(session.access_token, {
        contextId: selectedContext.id,
        sender: assistantMsg.sender,
        message: assistantMsg.text,
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error('Error generating response:', error);
      }
      setIsGenerating(false);
      setIsLoading(false);
    } finally {
      abortControllerRef.current = null;
    }
  };

  const createContext = async () => {
    if (!newContextName.trim()) return;
    const id = crypto.randomUUID();
    const context = { id, name: newContextName.trim() };

    setContexts((prev) => [...prev, context]);
    setSelectedContext(context);
    setShowChat(true);
    setNewContextName("");

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await createNewContext(session.access_token, context);
    }
  };

  const loadContexts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const contextData = await getContexts(session.access_token);
      setContexts(contextData);
    } catch (err) {
      console.error("Error loading contexts:", err);
    }
  };

  const handleContextSelect = async (context: Context) => {
    setSelectedContext(context);
    setShowChat(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await loadMessages(context.id, session.access_token);
    }
  };

  const handleDeleteContext = async (context: Context, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent context selection when clicking delete
    
    if (!confirm("Are you sure you want to delete this context? All messages will be lost.")) {
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      await deleteContext(session.access_token, context.name);
      
      // Update contexts list
      setContexts(prev => prev.filter(ctx => ctx.name !== context.name));
      
      // If the deleted context was selected, clear selection
      if (selectedContext?.name === context.name) {
        setSelectedContext(null);
        setShowChat(false);
        setMessages([]);
      }
    } catch (err) {
      console.error("Error deleting context:", err);
    }
  };

  useEffect(() => {
    loadContexts();
  }, []);

  return (
    <AuthGuard>
      <Navbar />
      <div className="pt-16 h-screen bg-gray-900 text-gray-100">
        <div className="flex h-[calc(100vh-64px)]">
          {/* Sidebar */}
          <div
            className={`w-full md:w-1/4 bg-gray-800 p-4 border-r border-gray-700 md:block flex flex-col-reverse md:flex-col overflow-hidden ${
              showChat ? "hidden md:block" : "block"
            }`}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createContext();
              }}
              className="mt-6 md:mt-0"
            >
              <input
                type="text"
                placeholder="New context name..."
                value={newContextName}
                onChange={(e) => setNewContextName(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white mb-2 focus:outline-none"
              />
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded">
                Create
              </button>
            </form>

            <div className="space-y-2 overflow-y-auto max-h-[60vh]">
              {contexts.map((ctx) => (
                <ContextCard
                  key={ctx.id}
                  context={ctx}
                  isSelected={selectedContext?.id === ctx.id}
                  onSelect={() => handleContextSelect(ctx)}
                  onDelete={(e) => handleDeleteContext(ctx, e)}
                />
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div
            className={`flex-1 flex flex-col p-4 md:p-6 ${
              showChat ? "block" : "hidden"
            } md:block overflow-y-auto`}
          >
            {selectedContext ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">{selectedContext.name}</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setShowChat(false);
                        setSelectedContext(null);
                      }}
                      className="md:hidden bg-gray-700 p-2 rounded text-sm"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => handleDeleteContext(selectedContext, {} as React.MouseEvent)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-3xl p-3 rounded-lg ${
                          msg.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-100"
                        }`}
                      >
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(msg.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-700 text-gray-100 p-3 rounded-lg animate-pulse">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 p-3 rounded bg-gray-700 text-white focus:outline-none"
                    placeholder="Type a message..."
                    disabled={isLoading || isGenerating}
                  />
                  {isGenerating ? (
                    <button
                      type="button"
                      onClick={stopGeneration}
                      className="bg-red-600 hover:bg-red-700 text-white p-3 rounded"
                    >
                      Stop
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded disabled:opacity-50"
                      disabled={isLoading || isGenerating}
                    >
                      Send
                    </button>
                  )}
                </form>
              </>
            ) : (
              <div className="text-gray-400 text-center m-auto text-lg">
                Select a context to begin chatting.
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Assistant;