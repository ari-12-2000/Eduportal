export default function PaymentPageSkeleton() {
  return (
    <div className="flex flex-col items-center px-4 py-8">
      {/* Back button */}
      <div className="w-full max-w-6xl mb-4">
        <div className="h-4 w-16 sm:w-20 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Main container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {/* Left card */}
        <div className="col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow">
          {/* Thumbnail */}
          <div className="h-40 sm:h-48 w-full bg-gray-200 rounded-xl animate-pulse mb-4" />
          <div className="h-5 sm:h-6 w-32 sm:w-40 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-48 sm:w-64 bg-gray-200 rounded animate-pulse mb-6" />

          {/* Instructor */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-4 w-24 sm:w-32 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-14 sm:h-16 w-full rounded-lg bg-gray-200 animate-pulse"
              />
            ))}
          </div>

          {/* Features */}
          <div className="space-y-2 sm:space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-3 sm:h-4 w-36 sm:w-48 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Right summary card */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow space-y-3 sm:space-y-4">
          <div className="h-3 sm:h-4 w-20 sm:w-28 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 sm:h-6 w-20 sm:w-24 bg-gray-200 rounded animate-pulse" />

          <div className="h-8 sm:h-10 w-full bg-gray-200 rounded-xl animate-pulse" />

          <div className="h-14 sm:h-16 w-full bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
