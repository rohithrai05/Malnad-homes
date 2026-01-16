
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Bot, User, ChevronDown, Minimize2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Welcome to Malnad Homes. I'm Pearl, your AI concierge. How can I assist you with your property search today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay for mobile transitions to finish
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Safe check for API Key existence to debug deployment issues
      const apiKey = process?.env?.API_KEY;
      
      if (!apiKey) {
        throw new Error("API_KEY_MISSING");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `
        You are Pearl, the professional AI concierge for "Malnad Homes", a premium property agency in Puttur, Karnataka.
        
        TONE & STYLE:
        - Professional, polite, efficient, and warm.
        - Concise answers. Avoid long paragraphs.
        - Use professional formatting (bullet points for lists).
        
        KNOWLEDGE BASE:
        - Malnad Homes connects tenants with owners directly (Zero Brokerage).
        - We verify all listings physically.
        - Areas covered: Balnad, Darbe, Bolwar, Nehrunagar, Kabaka, etc.
        - Services: Rental agreements, rent management.
        
        USER CONTEXT:
        - Name: ${user?.name || 'Valued Guest'}.
        
        INSTRUCTIONS:
        - If the user asks about property availability, suggest they browse the 'Places' section for real-time listings.
        - If specific prices are asked, provide general ranges based on market knowledge (e.g., "1BHKs typically range from ₹4,000 to ₹7,000").
        - Assist with booking procedures and general inquiries.
      `;

      const chatHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction },
        history: chatHistory
      });

      const result = await chat.sendMessage({ message: userMessage.text });
      const responseText = result.text || "I'm having trouble connecting to the service. Please try again momentarily.";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      
      let errorMessage = "I apologize, but I am currently unable to process your request. Please try again later.";
      
      if (error.message === "API_KEY_MISSING") {
        errorMessage = "Configuration Error: The AI API Key is missing in the Vercel Environment Variables. Please check Project Settings > Environment Variables.";
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay - Only visible when open on mobile */}
      <div 
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[90] md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Floating Toggle Button with Living Animation */}
      <div className="fixed bottom-6 right-6 z-[100] flex items-center justify-center">
        {/* Living Pulse Ring */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping"></div>
        )}
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-95 group shadow-[0_8px_30px_rgba(0,0,0,0.3)] border-2 ${
            isOpen 
              ? 'bg-slate-800 text-white rotate-90 shadow-slate-900/50 border-slate-700' 
              : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/40 border-white/20'
          }`}
          aria-label="Toggle Chat"
        >
          {isOpen ? (
            <X className="h-7 w-7" />
          ) : (
            <>
               <Sparkles className="h-7 w-7 animate-[pulse_3s_ease-in-out_infinite]" />
               {/* Optional internal glow */}
               <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </>
          )}
        </button>
      </div>

      {/* Chat Window */}
      <div 
        className={`
          fixed z-[100] bg-white dark:bg-slate-900 overflow-hidden shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          
          /* Mobile: Bottom Sheet */
          bottom-0 left-0 right-0 h-[85vh] rounded-t-[2rem]
          
          /* Desktop: Popover */
          md:bottom-28 md:right-6 md:left-auto md:w-[380px] md:h-[600px] md:rounded-2xl md:border md:border-slate-200 md:dark:border-slate-800

          ${isOpen 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-full md:translate-y-10 opacity-0 scale-95 pointer-events-none'
          }
        `}
      >
        {/* Header */}
        <div className="h-16 bg-slate-900 dark:bg-slate-950 px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/50 relative">
              <Bot className="h-5 w-5 text-white" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div>
              <h3 className="font-sans font-bold text-white text-base leading-none">Pearl</h3>
              <p className="text-emerald-400/80 text-[10px] font-medium tracking-wide uppercase mt-1">
                AI Concierge
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-slate-400 hover:text-white transition-colors p-2 -mr-2"
          >
            <ChevronDown className="h-5 w-5 md:hidden" />
            <Minimize2 className="h-4 w-4 hidden md:block" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-slate-50 dark:bg-slate-900 h-[calc(100%-8rem)] custom-scrollbar">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex items-end gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400' 
                  : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              }`}>
                {msg.sender === 'user' ? <User className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />}
              </div>
              
              <div className={`max-w-[80%] py-3 px-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white rounded-br-none' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-end gap-2.5 animate-pulse">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-600" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3 px-4 rounded-2xl rounded-bl-none flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 pr-2 rounded-full border border-slate-200 dark:border-slate-800 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all shadow-inner"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Pearl..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 font-medium"
            />
            <button 
              type="submit" 
              disabled={!inputText.trim() || isLoading}
              className="w-10 h-10 flex items-center justify-center bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-90"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
            </button>
          </form>
          <div className="text-center mt-2 pb-1 md:pb-0">
            <span className="text-[9px] text-slate-400 font-medium flex items-center justify-center gap-1 uppercase tracking-wider">
              Powered by <Sparkles className="h-2.5 w-2.5 text-emerald-500" /> Gemini AI
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
