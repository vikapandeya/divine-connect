import React, { useState } from 'react';
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Headphones,
  Sparkles,
  Send,
  MessageSquareText,
} from 'lucide-react';
import PageHero from '../components/PageHero';
import { generateDemoSupportReply } from '../lib/firestore-data';
import { translateText, useAppLocale } from '../lib/i18n';

const contactCards = [
  {
    title: 'Email Support',
    description: 'Reach us for bookings, order help, or partnership questions.',
    value: 'support@punyaseva.in',
    href: 'mailto:support@punyaseva.in',
    icon: Mail,
  },
  {
    title: 'Call Us',
    description: 'Speak with the team for puja bookings and service guidance.',
    value: '+91 1800-786-9272',
    href: 'tel:+9118007869272',
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

export default function Contact() {
  const locale = useAppLocale();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: translateText(
        locale,
        'Namaste. I am PunyaSeva AI Support. I can help with bookings, orders, account access, and vendor onboarding.',
      ),
    },
  ]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState('');

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
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: generateDemoSupportReply(nextMessages),
        },
      ]);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'Demo support is unavailable right now.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <PageHero
      eyebrow={translateText(locale, 'Contact PunyaSeva')}
      title={translateText(locale, 'Get support for bookings, products, account questions, and spiritual guidance.')}
      description={translateText(locale, 'This support experience is designed to feel immediate and calm, with direct contact options and a built-in AI assistant for quick answers.')}
      stats={[
          { label: translateText(locale, 'Support Channels'), value: translateText(locale, 'Email, Phone, Chat') },
          { label: translateText(locale, 'Availability'), value: translateText(locale, 'Mon-Sat') },
          { label: translateText(locale, 'Best For'), value: translateText(locale, 'Bookings, Orders, Onboarding') },
        ]}
        aside={
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-orange-300">
              <MessageSquareText className="h-5 w-5" />
              <p className="text-xs font-bold uppercase tracking-[0.24em]">{translateText(locale, 'Support Experience')}</p>
            </div>
            <div className="mt-5 space-y-3 text-sm text-stone-200">
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                {translateText(locale, 'Quick contact cards for phone, email, and location context.')}
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                {translateText(locale, 'Demo AI support for common questions before human escalation.')}
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                {translateText(locale, 'Cleaner split between live help, support hours, and capability scope.')}
              </div>
            </div>
          </div>
        }
      />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {contactCards.map(({ title, description, value, href, icon: Icon }) => (
          <a
            key={title}
            href={href}
            target={href.startsWith('https://') ? '_blank' : undefined}
            rel={href.startsWith('https://') ? 'noreferrer' : undefined}
            className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-6">
              <Icon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-3">{translateText(locale, title)}</h2>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">
              {translateText(locale, description)}
            </p>
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-stone-900">{value}</span>
              <ArrowRight className="w-4 h-4 text-orange-500 shrink-0" />
            </div>
          </a>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white shadow-sm shadow-stone-200/50">
          <div className="border-b border-stone-100 px-6 py-5 md:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900">
                  {translateText(locale, 'Live Chat')}
                </h2>
                <p className="text-sm text-stone-500">
                  {translateText(locale, 'Demo AI support for bookings, orders, and onboarding questions.')}
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{translateText(locale, 'AI Support Online')}</span>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-4">
            <div className="flex flex-wrap gap-2">
              {starterQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => sendMessage(question)}
                  className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-700 hover:border-orange-200 hover:text-orange-600 transition-colors"
                >
                  {translateText(locale, question)}
                </button>
              ))}
            </div>

            <div className="h-[26rem] overflow-y-auto rounded-[2rem] bg-stone-50 p-4 md:p-5 space-y-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      message.role === 'user'
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-stone-700 border border-stone-200'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="rounded-[1.5rem] px-4 py-3 text-sm bg-white text-stone-500 border border-stone-200">
                    {translateText(locale, 'PunyaSeva AI is typing...')}
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
                placeholder={translateText(locale, 'Ask about booking, order status, vendor onboarding...')}
                className="flex-1 rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isSending || !draft.trim()}
                className="bg-stone-900 text-white px-5 py-3 rounded-2xl font-bold hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:hover:bg-stone-900 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                <span>{translateText(locale, 'Send')}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2.5rem] border border-stone-200 bg-stone-100 p-8 md:p-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-orange-500 shadow-sm">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 mb-3">
                  {translateText(locale, 'Support Hours')}
                </h2>
                <p className="text-stone-600 leading-relaxed">
                  {translateText(locale, 'Monday to Saturday, 9:00 AM to 7:00 PM IST. For online orders and general support, email is available anytime and we usually respond within one business day.')}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white border border-stone-200 rounded-[2.5rem] p-8">
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4">
              {translateText(locale, 'What AI Support Can Help With')}
            </h2>
            <ul className="space-y-3 text-stone-600">
              <li>{translateText(locale, 'Booking guidance for pujas and service flows.')}</li>
              <li>{translateText(locale, 'Order support for products and shipping questions.')}</li>
              <li>{translateText(locale, 'Vendor onboarding and account-related help.')}</li>
              <li>{translateText(locale, 'General platform guidance before you contact the team.')}</li>
            </ul>
          </section>
        </div>
      </section>
    </div>
  );
}

