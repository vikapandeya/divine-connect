import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Flame } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function VedaAI() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Namaste. I am Veda AI, your spiritual guide. How may I assist your journey today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
          systemInstruction: "You are a wise Vedic scholar and spiritual guide named 'Veda AI'."
        })
      });

      if (!responseArr.ok) throw new Error('Failed to connect.');

      const data = await responseArr.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      console.error('Veda AI Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'I apologize, but my connection to the spiritual realms is temporarily obscured.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePillClick = (text: string) => {
    setInput(text);
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
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-2xl group overflow-hidden"
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-[400px] h-full bg-[#111111] flex flex-col shadow-2xl border-l-2 border-orange-500/20"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-orange-600" />
              
              {/* Header */}
              <div className="p-6 border-b border-[#222222] bg-[#1a1a1a]">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#ff6b00] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="font-serif font-black text-white text-xl tracking-wide">Veda AI</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full" />
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.15em]">Spiritual Guide Online</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-stone-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages.map((m, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`p-4 rounded-xl text-sm leading-relaxed max-w-[90%] font-medium ${
                      m.role === 'assistant' 
                        ? 'bg-[#1a1a1a] text-[#cccccc] border border-[#222222]' 
                        : 'bg-[#ff6b00] text-white'
                    }`}>
                      {m.content}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#222222] flex items-center justify-center">
                      <div className="flex gap-1.5 align-middle">
                        <span className="w-1.5 h-1.5 bg-[#555] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#555] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#555] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 bg-[#1a1a1a] border-t border-[#222222]">
                <div className="flex flex-wrap gap-2.5 mb-6">
                  {[
                    'Significance of Shivaratri',
                    'Benefits of meditation',
                    'How to book a puja?',
                    'Mantra for peace'
                  ].map((tip) => (
                    <button
                      key={tip}
                      onClick={() => handlePillClick(tip)}
                      className="px-4 py-2 rounded-full border border-[#333333] text-[#999999] text-xs font-medium hover:border-[#ff6b00] hover:text-[#ff6b00] transition-colors bg-transparent"
                    >
                      {tip}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSend} className="relative mb-6">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Veda AI..."
                    className="w-full bg-[#111111] border border-[#333333] rounded-[2rem] pl-5 pr-14 py-4 text-sm text-white placeholder:text-[#666666] focus:ring-1 focus:ring-[#ff6b00] focus:border-[#ff6b00] outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#9c4c1a] hover:bg-[#ff6b00] text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:hover:bg-[#9c4c1a] transition-all"
                  >
                    <Send className="w-4 h-4 ml-[-2px] mt-[1px]" />
                  </button>
                </form>

                <div className="text-center w-full pb-2">
                  <span className="text-[10px] text-[#aa8855] font-black uppercase tracking-[0.2em]">
                    Guided by Eternal Wisdom
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
