import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppBubble from '@/components/layout/WhatsAppBubble';
import { Toaster } from 'react-hot-toast';
import { setRequestLocale } from 'next-intl/server';

// Supabase hostname for preconnect — strips protocol and trailing slash
const supabaseHost = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '');


export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>
}) {
  const { locale } = await params;

  // setRequestLocale must be called before any rendering or notFound()
  setRequestLocale(locale);

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {/* Preconnect to Supabase so the first image/API request doesn't pay DNS + TLS cost */}
      {supabaseHost && (
        <>
          <link rel="preconnect" href={`https://${supabaseHost}`} />
          <link rel="dns-prefetch" href={`https://${supabaseHost}`} />
        </>
      )}
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppBubble />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1E1E1E',
              color: '#F5F5F5',
              borderRadius: '4px',
              border: '1px solid #2A2A2A',
              fontSize: '13px',
            },
            success: {
              duration: 2500,
              iconTheme: { primary: '#FF6B00', secondary: '#1E1E1E' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#1E1E1E' },
            },
          }}
        />
      </div>
    </NextIntlClientProvider>
  );
}
