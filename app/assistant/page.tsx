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
} from "../utils/api";
import Navbar from "../components/navbar";

interface Message {
  id: string; // Ensure this matches the UUID type from the backend
  text: string;
  sender: "user" | "assistant";
  timestamp: string;
}

interface Context {
  id: string;
  name: string;
}

const Assistant = () => {
  const [contexts, setContexts] = useState<Context[]>([]);
  const [selectedContext, setSelectedContext] = useState<Context | null>(null);
  const [newContextName, setNewContextName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async (contextId: string, token: string) => {
    try {
      const data = await getMessages(token, contextId);
      const formattedMessages = data.map((msg: any) => ({
        id: msg.id,
        text: msg.message,
        sender: msg.sender,
        timestamp: msg.created_at,
      }));
      setMessages(formattedMessages);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
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
    };

    setMessages((prev) => [...prev, userMsg]);
    setNewMessage("");

    await addMessage(session.access_token, {
      contextId: selectedContext.id,
      sender: userMsg.sender,
      message: userMsg.text,
    });

    const history = [...messages, userMsg]
      .map((m) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`)
      .join("\n");

    const response = await sendGeminiQuery(session.access_token, selectedContext.name, history);

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      text: response,
      sender: "assistant",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, assistantMsg]);

    await addMessage(session.access_token, {
      contextId: selectedContext.id,
      sender: assistantMsg.sender,
      message: assistantMsg.text,
    });
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
            className={`w-full md:w-1/4 bg-gray-800 p-4 border-r border-gray-700 md:block ${
              showChat ? "hidden md:block" : "block"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Your Topics</h2>
            <div className="space-y-2 overflow-y-auto max-h-[60vh]">
              {contexts.map((ctx) => (
                <div
                  key={ctx.id}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-gray-700 ${
                    selectedContext?.id === ctx.id ? "bg-gray-700" : "bg-gray-800"
                  }`}
                  onClick={() => handleContextSelect(ctx)}
                >
                  {ctx.name}
                </div>
              ))}
            </div>

            {/* Create new context */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createContext();
              }}
              className="mt-6"
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
                  <button
                    onClick={() => {
                      setShowChat(false);
                      setSelectedContext(null);
                    }}
                    className="md:hidden bg-gray-700 p-2 rounded text-sm"
                  >
                    Back
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          msg.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-100"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 p-3 rounded bg-gray-700 text-white focus:outline-none"
                    placeholder="Type a message..."
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded"
                  >
                    Send
                  </button>
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