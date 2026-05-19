import { useTranslation } from 'react-i18next';
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
  { titleKey: 'contact.emailTitle', descKey: 'contact.emailDesc', value: 'support@punyaseva.in', href: 'mailto:support@punyaseva.in', icon: Mail },
  { titleKey: 'contact.callTitle', descKey: 'contact.callDesc', value: '+91 1800-348-4600', href: 'tel:+918003484600', icon: Phone },
  { titleKey: 'contact.visitTitle', descKey: 'contact.visitDesc', value: 'Varanasi, Uttar Pradesh, India', href: 'https://maps.google.com/?q=Varanasi%2C%20Uttar%20Pradesh%2C%20India', icon: MapPin },
];

const starterQuestionKeys = ['contact.q1', 'contact.q2', 'contact.q3'] as const;
const starterQuestionsEn = ['How do I book a puja?', 'How can I track my order?', 'How do I become a vendor?'];

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};


export default function Contact() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('punyaseva_chat_history');
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
          'Namaste. I am PunyaSeva AI Support. I can help with bookings, orders, account access, and vendor onboarding.',
      },
    ];
  });
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('punyaseva_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const clearChat = () => {
    const initialMessage: ChatMessage = {
      role: 'assistant',
      content: 'Namaste. I am PunyaSeva AI Support. I can help with bookings, orders, account access, and vendor onboarding.',
    };
    setMessages([initialMessage]);
    localStorage.removeItem('punyaseva_chat_history');
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
      const res = await fetch('/api/ai/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: nextMessage,
          history: messages,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI support is unavailable right now.');

      setMessages([
        ...nextMessages,
        { role: 'assistant', content: data.reply },
      ]);
    } catch (error) {
      setChatError(
        error instanceof Error ? error.message : 'AI support is unavailable right now.',
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
            src="/hero/services-hero.png"
            alt="Contact PunyaSeva"
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
            <div className="flex justify-center mb-8">
              <img 
                src="/logo/full-logo.svg" 
                alt="PunyaSeva" 
                className="h-20 w-auto brightness-0 invert" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold uppercase tracking-widest mb-6 border border-orange-500/30">
              <Sparkles className="w-4 h-4" />
              <span>{t('contact.title')}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
              {t('contact.hereToHelp')}
            </h1>
            <p className="text-lg text-stone-200 max-w-2xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactCards.map(({ titleKey, descKey, value, href, icon: Icon }) => (
          <a
            key={titleKey}
            href={href}
            target={href.startsWith('https://') ? '_blank' : undefined}
            rel={href.startsWith('https://') ? 'noreferrer' : undefined}
            className="bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-200 dark:border-stone-800 p-8 hover:border-orange-200 dark:hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center mb-6">
              <Icon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">{t(titleKey)}</h2>
            <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-4">
              {t(descKey)}
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
                  {t('contact.liveChat')}
                </h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {t('contact.chatSubtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={clearChat}
                className="text-xs text-stone-400 hover:text-orange-500 transition-colors font-medium"
              >
                {t('contact.clearChat')}
              </button>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('contact.aiSupport')}</span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-4">
            <div className="flex flex-wrap gap-2">
              {starterQuestionKeys.map((key, i) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => sendMessage(starterQuestionsEn[i])}
                  className="rounded-full border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:border-orange-200 dark:hover:border-orange-500 transition-colors"
                >
                  {t(key)}
                </button>
              ))}
            </div>

            <div 
              ref={scrollRef}
              className="h-[18rem] sm:h-[26rem] overflow-y-auto rounded-[2rem] bg-stone-50 dark:bg-stone-950 p-4 md:p-5 space-y-3 scroll-smooth"
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
                    {t('contact.typing')}
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
                placeholder={t('contact.aiPlaceholder')}
                className="flex-1 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:text-white"
              />
              <button
                type="submit"
                disabled={isSending || !draft.trim()}
                className="bg-stone-900 text-white px-5 py-3 rounded-2xl font-bold hover:bg-orange-500 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                <span>{t('contact.send')}</span>
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
                  {t('contact.supportHours')}
                </h2>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  {t('contact.supportHoursText')}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2.5rem] p-8">
            <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-4">
              {t('contact.aiHelpTitle')}
            </h2>
            <ul className="space-y-3 text-stone-600 dark:text-stone-400">
              <li>{t('contact.bookingGuidance')}</li>
              <li>{t('contact.orderSupport')}</li>
              <li>{t('contact.vendorOnboarding')}</li>
              <li>{t('contact.generalHelp')}</li>
            </ul>
          </section>
        </div>
      </section>
    </div>
  </div>
);
}
