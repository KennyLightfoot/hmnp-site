import { redirect } from 'next/navigation';

// Redirect old "standard" service to new "essential" service
export default function StandardServiceRedirect() {
  redirect('/services/essential');
} 