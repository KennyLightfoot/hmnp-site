import prisma from "@/lib/db"
import { formatDate } from "@/lib/utils"

export default async function AdminBookingsPage() {
  // Fetch the latest 10 bookings
  const bookings = await prisma.booking.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#002147] mb-6">Recent Bookings</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#002147] text-white">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Service</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Price</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  {booking.firstName} {booking.lastName}
                </td>
                <td className="p-3">{booking.serviceType}</td>
                <td className="p-3">{formatDate(booking.appointmentDate)}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === "CONFIRMED"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-800"
                          : booking.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="p-3">${booking.totalPrice.toFixed(2)}</td>
              </tr>
            ))}

            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-500">
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
