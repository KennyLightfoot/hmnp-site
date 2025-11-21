export const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  } catch (e) {
     console.error("Error formatting date:", date, e);
     return "Invalid Date";
  }
};

export const formatDateShort = (date: Date | string | null | undefined): string => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch (e) {
     console.error("Error formatting date:", date, e);
     return "Invalid Date";
  }
};

