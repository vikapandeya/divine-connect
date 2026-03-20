import React from 'react';
import { Mail, MapPin, Phone, Clock, ArrowRight } from 'lucide-react';

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

export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <section className="rounded-[3rem] bg-stone-900 text-white overflow-hidden relative px-8 py-12 md:px-14 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.35),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.22),_transparent_30%)]" />
        <div className="relative z-10 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-300 mb-4">Contact DivineConnect</p>
          <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
            We are here to help you with bookings, products, and spiritual guidance.
          </h1>
          <p className="text-stone-300 text-lg max-w-2xl">
            If you need help with puja booking, darshan access, prasad orders, or vendor onboarding, reach out and we will guide you.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactCards.map(({ title, description, value, href, icon: Icon }) => (
          <a
            key={title}
            href={href}
            target={href.startsWith('https://') ? '_blank' : undefined}
            rel={href.startsWith('https://') ? 'noreferrer' : undefined}
            className="bg-white rounded-[2rem] border border-stone-200 p-8 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-6">
              <Icon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-3">{title}</h2>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">{description}</p>
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-stone-900">{value}</span>
              <ArrowRight className="w-4 h-4 text-orange-500 shrink-0" />
            </div>
          </a>
        ))}
      </section>

      <section className="bg-stone-100 rounded-[2.5rem] p-8 md:p-10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-orange-500 shadow-sm">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-3">Support Hours</h2>
            <p className="text-stone-600 leading-relaxed">
              Monday to Saturday, 9:00 AM to 7:00 PM IST. For online orders and general support, email is available anytime and we usually respond within one business day.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
