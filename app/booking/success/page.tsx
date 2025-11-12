import type { Metadata } from "next";
import BookingSuccessClient from "./BookingSuccessClient";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function BookingSuccessPage() {
  return <BookingSuccessClient />;
}
