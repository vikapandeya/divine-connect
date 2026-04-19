import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';

const SYSTEM_INSTRUCTION = `
You are Veda AI, a divine Vedic Scholar and spiritual assistant for the PunyaSeva platform. 
Your purpose is to provide sacred wisdom, explain Vedic traditions, guide users through puja bookings, and offer peace and clarity.

Tone: 
- Compassionate, wise, and serene.
- Use spiritual metaphors where appropriate.
- Be respectful of all traditions while focusing on Vedic/Hindu spirituality.
- Address the user with respect (e.g., "Dear Seeker" or "Namaste").

Capabilities:
- Explain the significance of various pujas (Ganesh Puja, Lakshmi Puja, etc.).
- Provide mantra explanations and their benefits.
- Guide users on how to use the PunyaSeva platform (booking pujas, ordering prasad, checking astrology).
- Offer general spiritual guidance and meditation tips.

Rules:
- If a user asks about booking a puja, guide them to the /services page.
- If a user asks about their future or horoscope, guide them to the /astrology page.
- Do not provide medical, legal, or financial advice.
- Keep responses concise but meaningful.
`;

const QUICK_ACTIONS = [
  "Significance of Shivaratri",
  "Benefits of meditation",
  "How to book a puja?",
  "Mantra for peace",
];

export default function VedaAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Namaste. I am Veda AI, your spiritual guide. How may I assist your journey today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("AI not configured");

      const ai = new GoogleGenAI({ apiKey });
      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      history.push({ role: 'user', parts: [{ text }] });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: history,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      const reply = response.text || "I am currently in deep meditation. Please try again later.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error("Veda AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "The divine connection is temporarily interrupted. Please try again soon." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(249, 115, 22, 0.5)" }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-orange-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-orange-600 transition-colors"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-stone-50 dark:bg-stone-950 shadow-2xl z-[80] flex flex-col border-l border-stone-200 dark:border-stone-800"
            >
              {/* Header */}
              <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white dark:bg-stone-900 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 dark:text-white">Veda AI</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-widest font-bold">Spiritual Guide Online</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              {/* Messages */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
              >
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                        : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-800 shadow-sm'
                    }`}>
                      {m.content}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 flex gap-1">
                      <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                {messages.length === 1 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {QUICK_ACTIONS.map(action => (
                      <button
                        key={action}
                        onClick={() => handleSend(action)}
                        className="text-[10px] px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-800 hover:border-orange-500 hover:text-orange-500 transition-all text-stone-500 dark:text-stone-400"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="relative"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Veda AI..."
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl px-4 py-3 pr-12 text-sm outline-none focus:border-orange-500 transition-colors dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-500 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 disabled:opacity-50 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-[10px] text-center text-stone-400 mt-4 uppercase tracking-[0.2em] font-bold">Guided by Eternal Wisdom</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
