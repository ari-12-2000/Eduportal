export default function PaymentPageSkeleton() {
  return (
    <div className="flex flex-col items-center px-4 py-8">
      {/* Back button */}
      <div className="w-full max-w-5xl mb-4">
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Main container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {/* Left card */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow">
          <div className="h-48 w-full bg-gray-200 rounded-xl animate-pulse mb-4" />
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mb-6" />

          {/* Instructor */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-16 w-full rounded-lg bg-gray-200 animate-pulse"
              />
            ))}
          </div>

          {/* Features */}
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-4 w-48 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Right summary card */}
        <div className="bg-white p-6 rounded-2xl shadow space-y-4">
          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />

          <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse" />

          <div className="h-16 w-full bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
