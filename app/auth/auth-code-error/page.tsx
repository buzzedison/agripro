'use client';

import Link from 'next/link';
import { AlertCircle, Mail } from 'lucide-react';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verification Failed
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We couldn&apos;t verify your email address. This could happen if:
          </p>
          <ul className="mt-4 text-sm text-gray-600 text-left list-disc list-inside space-y-2">
            <li>The verification link has expired</li>
            <li>The link has already been used</li>
            <li>The link is invalid or corrupted</li>
          </ul>

          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="ml-3 text-left">
                  <h3 className="text-sm font-medium text-blue-800">
                    Need a new verification link?
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Try signing up again with the same email address, and we&apos;ll send you a fresh verification link.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/auth/signup"
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Request New Verification Link
              </Link>
              <Link
                href="/auth/login"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Back to Sign In
              </Link>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            If you continue to experience issues, please contact support.
          </div>
        </div>
      </div>
    </div>
  );
}
