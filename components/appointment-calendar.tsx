'use client'

import React, { useState, useEffect } from 'react';
import { DayPicker, SelectSingleEventHandler } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; // Default styles
import { format, addHours, setHours, setMinutes, setSeconds, setMilliseconds, startOfDay, endOfDay, parseISO, isToday } from 'date-fns';
import { Loader2 } from 'lucide-react'; // Added for loading state

// Define valid service types
export type ServiceType =
  | "essential"
  | "priority"
  | "loan-signing"
  | "reverse-mortgage"
  | "specialty"
  | "standard-notary"
  | "extended-hours-notary"
  | "loan-signing-specialist"
  | "specialty-notary-service"
  | "business-solutions"
  | "support-service";

// Define structure for time slots fetched from API
interface TimeSlot {
  startTime: string; // ISO string
  endTime: string;   // ISO string
  formattedTime: string; // e.g., "09:00 AM"
}

interface AppointmentCalendarProps {
  serviceType: ServiceType;
  numberOfSigners: number;
  onTimeSelected: (startTime: string, endTime: string, formattedTime: string, calendarId: string) => void;
  existingBookings?: {
    date: string; // YYYY-MM-DD format
    times: string[]; // Array of booked start times in ISO format
  }[];
  serviceDateRange?: {
    startDate?: Date; // Optional start date for service availability
    endDate?: Date; // Optional end date for service availability
  };
}

export default function AppointmentCalendar({ 
  serviceType, 
  numberOfSigners, 
  onTimeSelected,
  existingBookings = [], 
  serviceDateRange = {}
}: AppointmentCalendarProps) {
  const privacyPolicyLink = "/privacy-policy";
  const termsOfServiceLink = "/terms";
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  // State now holds TimeSlot objects
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>();
  // Added loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [determinedCalendarId, setDeterminedCalendarId] = useState<string>(""); // State to hold the determined ID
  
  // Create a map of booked dates and times for quick lookup
  const [bookedDateMap, setBookedDateMap] = useState<Record<string, string[]>>({});
  
  // Process existing bookings on component mount or when they change
  useEffect(() => {
    if (existingBookings && existingBookings.length > 0) {
      const bookingsMap: Record<string, string[]> = {};
      
      existingBookings.forEach(booking => {
        if (!bookingsMap[booking.date]) {
          bookingsMap[booking.date] = [];
        }
        bookingsMap[booking.date] = [...bookingsMap[booking.date], ...booking.times];
      });
      
      setBookedDateMap(bookingsMap);
    }
  }, [existingBookings]);

  /**
   * Determines the specific GoHighLevel Calendar ID based on the selected service type and number of signers.
   * This mapping is crucial for fetching the correct availability slots.
   * Assumptions:
   * - Essential service has different calendars based on the number of signers (1, 2, 3+).
   * - Reverse Mortgage uses the same calendar as Loan Signing.
   * - Specialty service uses a specific general services calendar.
   * - A fallback calendar (Essential 1 Signer) is used for unknown service types.
   *
   * @param service The type of notary service requested.
   * @param signers The number of signers involved.
   * @returns The corresponding GHL Calendar ID string.
   */
  const getCalendarId = (service: ServiceType, signers: number): string => {
    switch (service) {
      case "essential":
      case "standard-notary": // Added standard-notary to behave like essential
        // Specific calendars for 1, 2, and 3+ signers
        if (signers === 1) return "r9koQ0kxmuMuWryZkjdo"; // Essential/Standard - 1 Signer
        if (signers === 2) return "wkTW5ZX4EMl5hOAbCk9D"; // Essential/Standard - 2 Signers
        // Default to 3-signer calendar for 3 or more
        return "Vy3hd6Or6Xi2ogW0mvEG"; // Essential/Standard - 3+ Signers
      case "priority":
        return "xtHXReq1dfd0wGA7dLc0"; // Priority Service
      case "loan-signing":
      case "loan-signing-specialist": // Added loan-signing-specialist
        return "EJ5ED9UXPHCjBePUTJ0W"; // Loan Signing Calendar
      case "reverse-mortgage":
        // Assumption: Use the same calendar as Loan Signing for Reverse Mortgages
        return "EJ5ED9UXPHCjBePUTJ0W"; // Loan Signing Calendar
      case "specialty":
      case "specialty-notary-service": // Added specialty-notary-service
        // Assumption: Use a general services calendar for Specialty requests
        return "h4X7cZ0mZ3c52XSzvpjU"; // Houston Mobile Notary Pros Services
      // Cases for other Prisma ServiceTypes can be added here with their specific calendar IDs
      // e.g., extended-hours-notary, business-solutions, support-service
      default:
        // Log a warning if an unexpected service type is encountered
        console.warn(`Unknown or unmapped service type in getCalendarId: ${service}. Using fallback.`);
        // Fallback to a default calendar (Essential/Standard 1 Signer) to prevent errors
        return "r9koQ0kxmuMuWryZkjdo"; // Fallback: Essential/Standard - 1 Signer
    }
  };

  // Function to get appointment duration based on service type
  const getDuration = (service: ServiceType): number => {
    switch (service) {
      case "loan-signing":
      case "reverse-mortgage":
      case "loan-signing-specialist": // Added loan-signing-specialist
        return 90; // 90 minutes
      case "priority":
        return 60; // 60 minutes
      case "essential":
      case "specialty":
      case "standard-notary": // Added standard-notary
      case "specialty-notary-service": // Added specialty-notary-service
        return 60; // 60 minutes
      // Cases for other Prisma ServiceTypes can be added here with their specific durations
      // e.g., extended-hours-notary, business-solutions, support-service
      default:
        console.warn(`Unknown or unmapped service type in getDuration: ${service}. Using fallback duration.`);
        return 60; // Default/fallback duration
    }
  };

  // useEffect hook to fetch available slots when date or service type changes
  useEffect(() => {
    if (!selectedDate || !serviceType) {
      setAvailableTimeSlots([]);
      setSelectedTimeSlot(undefined);
      setError(null);
      return;
    }

    const fetchSlots = async () => {
      setIsLoading(true);
      setError(null);
      setAvailableTimeSlots([]);
      setSelectedTimeSlot(undefined); // Reset selection when fetching new slots

      try {
        // Format dates for API query
        const startDateISO = format(startOfDay(selectedDate), "yyyy-MM-dd'T'HH:mm:ssXXX"); // Use ISO 8601 with timezone
        const endDateISO = format(endOfDay(selectedDate), "yyyy-MM-dd'T'HH:mm:ssXXX"); // Use ISO 8601 with timezone
        const duration = getDuration(serviceType);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const calendarId = getCalendarId(serviceType, numberOfSigners); // Determine Calendar ID
        setDeterminedCalendarId(calendarId); // Store the determined ID

        // Construct API URL using calendarId
        const apiUrl = `/api/calendar/available-slots?calendarId=${encodeURIComponent(calendarId)}&startDate=${encodeURIComponent(startDateISO)}&endDate=${encodeURIComponent(endDateISO)}&duration=${duration}&timezone=${encodeURIComponent(timezone)}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
          console.error("API Error Response:", errorData);
          throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Format selected date to match the key in the API response (e.g., "2025-05-07")
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        const slotsForDate = data.success && data.data && data.data[dateKey]?.slots;

        // Check if slots exist for the selected date and it's an array
        if (Array.isArray(slotsForDate)) {
          const durationMinutes = getDuration(serviceType);

          // Map API response (array of start time strings) to TimeSlot structure
          let slotsFromApi: TimeSlot[] = slotsForDate
            .map((startTimeString: string) => {
              try {
                const start = parseISO(startTimeString);
                // Filter out slots that start in the past (consider adding a small buffer)
                if (start < new Date()) {
                  return null;
                }
                
                // Check if this time slot is already booked
                const dateKey = format(start, 'yyyy-MM-dd');
                if (bookedDateMap[dateKey] && bookedDateMap[dateKey].includes(startTimeString)) {
                  // Skip this slot as it's already booked
                  return null;
                }

                // Calculate end time based on duration
                const end = addHours(start, durationMinutes / 60); // Assuming duration is in minutes

                return {
                  startTime: startTimeString,
                  endTime: end.toISOString(), // Calculate and store end time
                  formattedTime: format(start, 'hh:mm aa'),
                };
              } catch (parseError) {
                console.error("Error parsing slot string:", startTimeString, parseError);
                return null; // Skip slots with invalid date format
              }
            })
            .filter((slot): slot is TimeSlot => slot !== null); // Filter out nulls (past/invalid slots)

          // Apply Same-Day Cutoff Logic
          if (serviceType === 'essential' && isToday(selectedDate)) {
            const cutoffHour = 15; // 3 PM
            slotsFromApi = slotsFromApi.filter(slot => {
              try {
                const startHour = parseISO(slot.startTime).getHours();
                return startHour < cutoffHour;
              } catch (parseError) {
                console.error("Error parsing start time for cutoff check:", slot.startTime, parseError);
                return false; // Exclude if parsing fails
              }
            });
          }

          setAvailableTimeSlots(slotsFromApi);
          if (slotsFromApi.length === 0) {
            setError("No available time slots found matching your criteria for this date/service.");
          }
        } else {
          // Handle cases where API call succeeded but returned no slots or unexpected format
          setAvailableTimeSlots([]);
          setError(data.message || "No available time slots found.");
          console.warn("API returned success=false or invalid data structure:", data);
        }
      } catch (err) {
        console.error("Error fetching available slots:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred while fetching times.");
        setAvailableTimeSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();

  }, [selectedDate, serviceType, numberOfSigners, bookedDateMap]); // Dependencies for the effect

  const handleDateSelect: SelectSingleEventHandler = (date) => {
    setSelectedDate(date);
    // Reset time selection and error when date changes
    setSelectedTimeSlot(undefined);
    setError(null);
    // Fetching is now handled by useEffect
  };

  // Updated handleTimeSelect to use TimeSlot object and pass calendarId
  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    // Pass the determinedCalendarId back via the callback
    onTimeSelected(slot.startTime, slot.endTime, slot.formattedTime, determinedCalendarId);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of today for comparison

  // Create a function to determine if a date should be disabled
  const isDateDisabled = (date: Date): boolean => {
    // If loading, disable all dates
    if (isLoading) return true;
    
    // Disable past dates
    if (date < today) return true;
    
    // Disable weekends for essential service
    if (serviceType === 'essential') {
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) return true; // Sunday or Saturday
    }
    
    // Disable dates outside service range if provided
    if (serviceDateRange) {
      if (serviceDateRange.startDate && date < serviceDateRange.startDate) return true;
      if (serviceDateRange.endDate && date > serviceDateRange.endDate) return true;
    }
    
    // Check if date is fully booked
    const dateString = format(date, 'yyyy-MM-dd');
    if (bookedDateMap[dateString]) {
      const bookingsCount = bookedDateMap[dateString].length;
      if (bookingsCount >= 8) return true; // Fully booked threshold
    }
    
    return false;
  };

  return (
    <>
      <style jsx global>{`
        .rdp-day_selected:not([disabled]),
        .rdp-day_selected:focus:not([disabled]),
        .rdp-day_selected:active:not([disabled]),
        .rdp-day_selected:hover:not([disabled]) {
          background-color: hsl(var(--primary)); /* Use your primary color variable */
          color: hsl(var(--primary-foreground)); /* Use your primary foreground color variable */
          /* Ensure the number is centered */
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%; /* Ensure it's a circle */
        }
        .rdp-day_selected .rdp-button:hover {
            background-color: hsl(var(--primary) / 0.9);
        }
      `}</style>
      <div className="p-4 md:p-6 border rounded-lg shadow-md bg-white">
        <div className="mb-6 text-center md:text-left">
          <h2 className="text-2xl font-semibold text-[#002147]">Schedule Your Appointment</h2>
          <p className="text-sm text-gray-700 mt-1 italic">Houston Mobile Notary Pros - Professional Notary Services Day & Evening</p>
          <p className="text-muted-foreground mt-2">
            Please select your desired date and time for your notary service. Our availability is updated in real-time.
          </p>
        </div>
        <div className="my-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800">
          <p><strong>Important:</strong> For all notarial acts, a valid government-issued photo ID (e.g., Driver's License, State ID, Passport) is required for each signer, as per Texas law. Please ensure all signers have their ID ready for the appointment.</p>
        </div>

        {/* Original content for calendar and time slots starts here, wrapped in a new div for proper layout within the new structure */}
        <div className="flex flex-col md:flex-row gap-8 pt-4"> {/* Removed p-4, border, shadow from this inner div, added pt-4 for spacing */}
        <div className="flex-shrink-0">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            showOutsideDays
            fixedWeeks
            classNames={{
              root: 'border-0 p-0 m-0',
              caption: 'flex justify-center items-center h-10 mb-2 relative',
              caption_label: 'text-lg font-medium text-[#002147]',
              nav_button: 'h-8 w-8 absolute top-1 bg-gray-100 hover:bg-gray-200 rounded-full p-1 disabled:opacity-50',
              nav_button_previous: 'left-1',
              nav_button_next: 'right-1',
              table: 'border-collapse w-full',
              head_cell: 'text-sm font-semibold text-gray-500 pb-2 w-[2.5rem]',
              cell: 'text-center p-0 align-middle relative h-10 w-10',
              day: 'h-9 w-9 rounded-full leading-9 hover:bg-[#A52A2A]/10 aria-selected:opacity-100',
              day_selected: 'bg-[#A52A2A] text-white hover:bg-[#8B0000] focus:bg-[#A52A2A]',
              day_today: 'font-bold text-[#A52A2A]',
              day_outside: 'text-gray-400 opacity-50 aria-selected:opacity-30',
              day_disabled:
                'text-gray-300 opacity-50 cursor-not-allowed hover:bg-transparent',
            }}
          />
        </div>

        <div className="flex-grow border-l border-gray-200 pl-8 min-w-[250px]">
          <h3 className="text-lg font-semibold mb-4 text-[#002147]">
            {selectedDate ? `Available Times for ${format(selectedDate, 'PPP')}` : 'Select a date'}
          </h3>
          {/* Conditional rendering based on state */}
          {!selectedDate ? (
            <p className="text-gray-500">Select a date to see available time slots.</p>
          ) : isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-[#002147]" />
              <span className="ml-2 text-gray-600 font-medium">Fetching available times...</span>
            </div>
          ) : error ? (
             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
          ) : availableTimeSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* Map over availableTimeSlots */}
              {availableTimeSlots.map((slot) => (
                  <button
                  key={slot.startTime} // Use startTime as key
                  onClick={() => handleTimeSelect(slot)}
                    className={`p-2 border rounded-md text-center text-sm transition-colors
                    ${selectedTimeSlot?.startTime === slot.startTime // Compare based on startTime
                        ? 'bg-[#A52A2A] text-white border-[#A52A2A] ring-2 ring-offset-1 ring-[#A52A2A]'
                        : 'bg-white text-[#002147] border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                      }`}
                  >
                  {slot.formattedTime} {/* Display formatted time */}
                  </button>
                ))}
              </div>
            ) : (
             // Message when loading is done, no error, but no slots found
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-gray-700 mb-2">No time slots are currently available for the selected date and service.</p>
                <p className="text-sm text-gray-600">Please try selecting a different date, or <a href="/contact" className="font-medium text-[#002147] hover:text-[#A52A2A] underline">contact us</a> if you need further assistance.</p>
              </div>
          )}
        </div> {/* End of flex-grow container for time slots */}
        </div> {/* End of flex container for DayPicker and time slots wrapper (from line 235) */}

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm font-semibold text-[#002147] mb-1">Houston Mobile Notary Pros</p>
          <p className="text-xs text-gray-600 mb-2 italic">Professional Notary Services Day & Evening.</p>
          <p className="text-xs text-gray-500">
            Once you select a time, you will proceed to the next step to confirm your appointment details.
            For any questions or if you need to schedule a service not listed, please contact us directly.
            By proceeding, you agree to our <a href={termsOfServiceLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Terms of Service</a> and <a href={privacyPolicyLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </>
  );
} 