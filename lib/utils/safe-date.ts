export const SafeDate = {
  toISOString(input: unknown): string | null {
    if (!input) return null;
    try {
      const date = input instanceof Date ? input : new Date(input as any);
      if (isNaN(date.getTime())) {
        console.error('SafeDate.toISOString – invalid date', { input });
        return null;
      }
      return date.toISOString();
    } catch (err) {
      console.error('SafeDate.toISOString error', err, { input });
      return null;
    }
  },
  parse(input: unknown): Date | null {
    if (!input) return null;
    try {
      const date = input instanceof Date ? input : new Date(input as any);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  },
}; 