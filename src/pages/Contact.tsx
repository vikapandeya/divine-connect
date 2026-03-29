import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Headphones,
  Sparkles,
  Send,
} from 'lucide-react';

const contactCards = [
  {
    title: 'Email Support',
    description: 'Reach us for bookings, order help, or partnership questions.',
    value: 'support@divineconnect.com',
    href: 'mailto:support@divineconnect.com',
    icon: Mail,
  },
  {
    title: 'Call Us',
    description: 'Speak with the team for puja bookings and service guidance.',
    value: '+91 1800-DIVINE-00',
    href: 'tel:+91180034846300',
    icon: Phone,
  },
  {
    title: 'Visit / Write',
    description: 'Our spiritual services team is based in Varanasi, Uttar Pradesh.',
    value: 'Varanasi, Uttar Pradesh, India',
    href: 'https://maps.google.com/?q=Varanasi%2C%20Uttar%20Pradesh%2C%20India',
    icon: MapPin,
  },
];

const starterQuestions = [
  'How do I book a puja?',
  'How can I track my order?',
  'How do I become a vendor?',
];

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const SYSTEM_INSTRUCTION = `
You are DivineConnect AI Support.
Your role is to help users with:
- Puja bookings (online/offline)
- Darshan and Prasad guidance
- Order status and delivery support
- Account access and sign-in issues
- Vendor onboarding questions (how to join as a priest, temple, or shop)

Puja Booking Flow:
If a user expresses interest in booking a puja:
1. Prompt them for the type of puja or service they are interested in. Provide a selectable list of common types in this format: [OPTIONS: Ganesh Puja, Lakshmi Puja, Satyanarayan Katha, Durga Puja, Saraswati Puja].
2. Prompt them for their preferred date.
3. Prompt them for their preferred time slot (morning, afternoon, or evening). Provide a selectable list in this format: [OPTIONS: Morning, Afternoon, Evening].
4. Ask if they prefer an online (virtual) or offline (in-person) service. Provide a selectable list in this format: [OPTIONS: Online (Virtual), Offline (In-person)].
5. Once you have these details, provide a summary and guide them to the official "Pujas" page to finalize the booking.

Rules:
- Be concise, practical, and warm.
- Stay focused on product and platform support.
- Use the provided conversation history to maintain context and provide relevant answers.
- If the user needs direct human help, tell them to use the Contact Us page email or phone support.
- Do not invent order status, account status, or booking confirmations.
- If information is unavailable, say so clearly.
- Use a helpful, spiritual, yet professional tone.
`.trim();

export default function Contact() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('divineconnect_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse chat history:', e);
      }
    }
    return [
      {
        role: 'assistant',
        content:
          'Namaste. I am DivineConnect AI Support. I can help with bookings, orders, account access, and vendor onboarding.',
      },
    ];
  });
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('divineconnect_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const clearChat = () => {
    const initialMessage: ChatMessage = {
      role: 'assistant',
      content: 'Namaste. I am DivineConnect AI Support. I can help with bookings, orders, account access, and vendor onboarding.',
    };
    setMessages([initialMessage]);
    localStorage.removeItem('divineconnect_chat_history');
  };

  const sendMessage = async (messageText?: string) => {
    const nextMessage = (messageText ?? draft).trim();
    if (!nextMessage || isSending) {
      return;
    }

    const nextMessages = [...messages, { role: 'user' as const, content: nextMessage }];
    setMessages(nextMessages);
    setDraft('');
    setIsSending(true);
    setChatError('');

    try {
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          systemInstruction: SYSTEM_INSTRUCTION,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      const reply = data.text?.trim();

      if (!reply) {
        throw new Error("The AI support response was empty.");
      }

      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: reply,
        },
      ]);
    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : 'AI support is unavailable right now.',
      );
    } finally {
      setIsSending(false);
    }
  };

  const parseOptions = (content: string) => {
    const match = content.match(/\[OPTIONS:\s*(.*?)\]/);
    if (!match) return { text: content, options: [] };
    
    const text = content.replace(/\[OPTIONS:\s*.*?\]/, '').trim();
    const options = match[1].split(',').map(o => o.trim());
    return { text, options };
  };

  return (
    <div className="pb-20 bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
      <section className="relative h-[40vh] flex items-center overflow-hidden mb-12">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/contact-hero/1920/1080?blur=2"
            alt="Contact DivineConnect"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold uppercase tracking-widest mb-6 border border-orange-500/30">
              <Sparkles className="w-4 h-4" />
              <span>Contact Us</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
              We are here to <span className="text-orange-400">Help</span>
            </h1>
            <p className="text-lg text-stone-200 max-w-2xl mx-auto">
              Reach out for bookings, products, or spiritual guidance. Our team is ready to assist you.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactCards.map(({ title, description, value, href, icon: Icon }) => (
          <a
            key={title}
            href={href}
            target={href.startsWith('https://') ? '_blank' : undefined}
            rel={href.startsWith('https://') ? 'noreferrer' : undefined}
            className="bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-200 dark:border-stone-800 p-8 hover:border-orange-200 dark:hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center mb-6">
              <Icon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">{title}</h2>
            <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-4">
              {description}
            </p>
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-stone-900 dark:text-stone-200">{value}</span>
              <ArrowRight className="w-4 h-4 text-orange-500 shrink-0" />
            </div>
          </a>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
        <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
            <div className="border-b border-stone-100 dark:border-stone-800 px-6 py-5 md:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
                  Live Chat
                </h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  AI support for bookings, orders, and onboarding questions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={clearChat}
                className="text-xs text-stone-400 hover:text-orange-500 transition-colors font-medium"
              >
                Clear Chat
              </button>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Support Online</span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-4">
            <div className="flex flex-wrap gap-2">
              {starterQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => sendMessage(question)}
                  className="rounded-full border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:border-orange-200 dark:hover:border-orange-500 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>

            <div 
              ref={scrollRef}
              className="h-[26rem] overflow-y-auto rounded-[2rem] bg-stone-50 dark:bg-stone-950 p-4 md:p-5 space-y-3 scroll-smooth"
            >
              {messages.map((message, index) => {
                const { text, options } = message.role === 'assistant' ? parseOptions(message.content) : { text: message.content, options: [] };
                return (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex flex-col ${
                      message.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        message.role === 'user'
                          ? 'bg-orange-500 text-white'
                          : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      {text}
                    </div>
                    {options.length > 0 && index === messages.length - 1 && !isSending && (
                      <div className="flex flex-wrap gap-2 mt-2 ml-2">
                        {options.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => sendMessage(option)}
                            className="rounded-full border border-orange-200 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 text-xs text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {isSending && (
                <div className="flex justify-start">
                  <div className="rounded-[1.5rem] px-4 py-3 text-sm bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-800">
                    DivineConnect AI is typing...
                  </div>
                </div>
              )}
            </div>

            {chatError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {chatError}
              </div>
            )}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask about booking, order status, vendor onboarding..."
                className="flex-1 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:text-white"
              />
              <button
                type="submit"
                disabled={isSending || !draft.trim()}
                className="bg-stone-900 text-white px-5 py-3 rounded-2xl font-bold hover:bg-orange-500 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <section className="bg-stone-100 dark:bg-stone-900 rounded-[2.5rem] p-8 md:p-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-800 flex items-center justify-center text-orange-500 shadow-sm">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-3">
                  Support Hours
                </h2>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  Monday to Saturday, 9:00 AM to 7:00 PM IST. For online orders
                  and general support, email is available anytime and we usually
                  respond within one business day.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2.5rem] p-8">
            <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-4">
              What AI Support Can Help With
            </h2>
            <ul className="space-y-3 text-stone-600 dark:text-stone-400">
              <li>Booking guidance for pujas and service flows.</li>
              <li>Order support for products and shipping questions.</li>
              <li>Vendor onboarding and account-related help.</li>
              <li>General platform guidance before you contact the team.</li>
            </ul>
          </section>
        </div>
      </section>
    </div>
  </div>
);
}
