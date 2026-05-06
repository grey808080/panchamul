import ContactClient from './ContactClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Panchamul Bijuli. Find our store location in Kohalpur, phone number, and WhatsApp details.',
};

export default function ContactPage() {
  return <ContactClient />;
}
