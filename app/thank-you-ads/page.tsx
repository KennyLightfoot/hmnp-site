import type { Metadata } from "next";
import { getBusinessTel, getBusinessPhoneFormatted } from '@/lib/phone';
import ThankYouAdsClient from './ThankYouAdsClient';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouAdsPage() {
  return (
    <>
      <ThankYouAdsClient />
      <div className="container mx-auto px-4 py-12 text-center">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-green-600">Thank You!</h1>
          <p className="text-2xl text-gray-700 mt-4">
            Your information has been submitted successfully.
          </p>
        </header>

        <section className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
          <p className="text-lg text-gray-600 mb-6">
            We appreciate you reaching out to Houston Mobile Notary Pros. A member of our team will be in contact with you shortly to discuss your notary needs.
          </p>
          <p className="text-lg text-gray-600">
            If you have any urgent questions, please don't hesitate to call us at <a href={`tel:${getBusinessTel()}`} className="text-blue-600 hover:underline">{getBusinessPhoneFormatted()}</a>.
          </p>
        </section>

        <section className="mt-12">
          <a 
            href="/"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Back to Homepage
          </a>
        </section>
      </div>
    </>
  );
} 