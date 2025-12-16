import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-6">
          There was an issue authenticating your account. This could be due to an expired link or a configuration error.
        </p>
        <div className="flex flex-col gap-3">
            <Link 
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700 disabled:pointer-events-none disabled:opacity-50"
            >
            Return to Login
            </Link>
        </div>
      </div>
    </div>
  )
}
