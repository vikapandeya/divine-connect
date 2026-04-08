import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Bot, HelpCircle, Flame, History, Compass } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function VedaAI() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Namaste! I am Veda AI, your spiritual guide and companion. How may I assist your spiritual journey today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const responseArr = await fetch('/api/ai/spiritual-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          history: messages,
          systemInstruction: "You are a wise Vedic scholar and spiritual guide named 'Veda AI'. Your tone is compassionate, scholarly, and deeply rooted in Indian spiritual traditions (Vedas, Upanishads, Gita). Provide guidance, explain rituals, or share spiritual wisdom."
        })
      });

      if (!responseArr.ok) throw new Error('Failed to connect to divine wisdom.');

      const data = await responseArr.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      console.error('Veda AI Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'I apologize, but my connection to the spiritual realms is temporarily obscured. Please try again in a moment.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-orange-600/30 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X className="w-6 h-6 relative z-10" /> : <Flame className="w-6 h-6 relative z-10 animate-pulse" />}
      </motion.button>

      {/* Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-stone-100 dark:border-stone-800 bg-orange-50/50 dark:bg-orange-950/10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 dark:text-white">Veda AI</h3>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider text-emerald-600">Pure Wisdom</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((m, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'assistant' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-stone-100 dark:bg-stone-800 text-stone-600'}`}>
                        {m.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        m.role === 'assistant' 
                          ? 'bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-100 dark:border-stone-700' 
                          : 'bg-orange-500 text-white shadow-lg shadow-orange-500/10'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 text-stone-400 text-xs italic">
                      <div className="flex gap-1">
                        <span className="w-1 h-1 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-1 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      Veda AI is reflecting...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-6 border-t border-stone-100 dark:border-stone-800">
                <form onSubmit={handleSend} className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about rituals, Vedas or life..."
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl pl-4 pr-12 py-3.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-orange-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20 disabled:opacity-50 transition-all hover:bg-orange-700"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { label: 'Daily Mantra', icon: Sparkles },
                    { label: 'Gita Wisdom', icon: History },
                    { label: 'Ritual Guide', icon: Flame }
                  ].map((tip) => (
                    <button
                      key={tip.label}
                      onClick={() => setInput(tip.label)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-500 hover:text-orange-600 hover:bg-orange-50 transition-all"
                    >
                      <tip.icon className="w-3 h-3" />
                      {tip.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
