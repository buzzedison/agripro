import Link from 'next/link'
import { ShieldX, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You don&apos;t have permission to access this page. Admin privileges are required.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Need Admin Access?</h3>
            <p className="text-sm text-yellow-700">
              Contact your system administrator to request admin privileges, or use an admin account to access this page.
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <Link
              href="/knowledgehub"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Knowledge Hub
            </Link>

            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Sign in with Different Account
            </Link>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          If you believe this is an error, please contact support.
        </div>
      </div>
    </div>
  )
}
