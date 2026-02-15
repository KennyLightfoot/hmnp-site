// Load environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://czxoxhokegnzfctgnhjo.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eG94aG9rZWduemZjdGduaGpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjQ1NTk5MiwiZXhwIjoyMDUyMDMxOTkyfQ.Sg48MySxw8wwpAHMQIcQboNl-H56ez93cpvKMrmuBJk';

// Import and run the setup
import('./scripts/setup-business-settings.ts').then(module => {
  return module.setupBusinessSettings();
}).catch(console.error);
