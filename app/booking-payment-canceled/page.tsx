import Link from 'next/link';
import { XCircle } from 'lucide-react'; // Using lucide-react for icons

export default function BookingPaymentCanceledPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-lg text-center">
        <div>
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Canceled
          </h2>
          <p className="mt-2 text-md text-gray-600">
            Your payment was not processed, and your booking has not been confirmed.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            If you'd like to try again, please return to the booking page. If you continue to experience issues, please contact support.
          </p>
        </div>
        <div className="mt-6">
          <Link href="/services" // Or your main booking form page
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Try Booking Again
          </Link>
        </div>
        <div className="mt-4">
          <Link href="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
