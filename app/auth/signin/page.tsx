'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              {error === 'OAuthSignin' && 'An error occurred while signing in.'}
              {error === 'OAuthCallback' && 'An error occurred during the OAuth callback.'}
              {error === 'OAuthCreateAccount' && 'Could not create an account.'}
              {error === 'EmailCreateAccount' && 'Could not create an account.'}
              {error === 'Callback' && 'An error occurred during the callback.'}
              {error === 'Default' && 'An error occurred during sign in.'}
            </div>
          </div>
        )}
        <div className="mt-8 space-y-6">
          <button
            onClick={() => signIn('gohighlevel', { callbackUrl })}
            className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Sign in with GoHighLevel
          </button>
        </div>
      </div>
    </div>
  );
} 