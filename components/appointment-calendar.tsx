'use client'

import React, { useState, useEffect } from 'react';
import { DayPicker, SelectSingleEventHandler } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; // Default styles
import { format, addHours, setHours, setMinutes, setSeconds, setMilliseconds, startOfDay, endOfDay, parseISO, isToday } from 'date-fns';
import { Loader2 } from 'lucide-react'; // Added for loading state

// Define valid service types
type ServiceType = "essential" | "priority" | "loan-signing" | "reverse-mortgage" | "specialty";

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
  // TODO: Add prop for existing bookings
}

export default function AppointmentCalendar({ serviceType, numberOfSigners, onTimeSelected }: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  // State now holds TimeSlot objects
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>();
  // Added loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [determinedCalendarId, setDeterminedCalendarId] = useState<string>(""); // State to hold the determined ID

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
        // Specific calendars for 1, 2, and 3+ signers for Essential service
        if (signers === 1) return "r9koQ0kxmuMuWryZkjdo"; // Essential - 1 Signer
        if (signers === 2) return "wkTW5ZX4EMl5hOAbCk9D"; // Essential - 2 Signers
        // Default to 3-signer calendar for 3 or more
        return "Vy3hd6Or6Xi2ogW0mvEG"; // Essential - 3 Signers
      case "priority":
        return "xtHXReq1dfd0wGA7dLc0"; // Priority Service
      case "loan-signing":
        return "EJ5ED9UXPHCjBePUTJ0W"; // Loan Signing
      case "reverse-mortgage":
        // Assumption: Use the same calendar as Loan Signing for Reverse Mortgages
        return "EJ5ED9UXPHCjBePUTJ0W"; // Loan Signing
      case "specialty":
        // Assumption: Use a general services calendar for Specialty requests
        return "h4X7cZ0mZ3c52XSzvpjU"; // Houston Mobile Notary Pros Services
      default:
        // Log a warning if an unexpected service type is encountered
        console.warn(`Unknown service type in getCalendarId: ${service}`);
        // Fallback to a default calendar (Essential 1 Signer) to prevent errors
        return "r9koQ0kxmuMuWryZkjdo"; // Fallback: Essential - 1 Signer
    }
  };

  // Function to get appointment duration based on service type
  const getDuration = (service: ServiceType): number => {
    switch (service) {
      case "loan-signing":
      case "reverse-mortgage":
        return 90; // 90 minutes
      case "priority":
        return 60; // 60 minutes
      default: // essential, specialty
        return 30; // 30 minutes
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

  }, [selectedDate, serviceType, numberOfSigners]); // Dependencies for the effect

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

  // Define disabled days logic
  const disabledDays: any[] = [{ before: today }]; // Start with disabling past dates
  if (serviceType === 'essential') {
    disabledDays.push({ dayOfWeek: [0, 6] }); // Also disable weekends for essential
  }
  // TODO: Add logic to disable specific booked dates or dates outside service range

  return (
    <div className="flex flex-col md:flex-row gap-8 p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex-shrink-0">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={disabledDays}
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
            day: 'h-9 w-9 rounded-full hover:bg-[#A52A2A]/10 aria-selected:opacity-100',
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
            <span className="ml-2 text-gray-500">Loading times...</span>
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
            <p className="text-gray-500">No available time slots for this date/service.</p>
        )}
      </div>
    </div>
  );
} 