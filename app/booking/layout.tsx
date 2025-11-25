import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book a Notary Appointment',
  description:
    'Schedule mobile notary, loan signing, or remote online notarization appointments anywhere in the Greater Houston area.',
  alternates: {
    canonical: 'https://houstonmobilenotarypros.com/booking',
  },
  keywords: [
    'Houston notary',
    'mobile notary booking',
    'loan signing appointment',
    'remote online notarization',
  ],
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

