export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md animate-pulse">
        <div className="rounded-2xl bg-white p-8 shadow-md">
          <div className="mx-auto mb-6 h-12 w-12 rounded-full bg-gray-300" />
          <div className="mx-auto mb-2 h-6 w-32 rounded bg-gray-300" />
          <div className="mx-auto mb-8 h-4 w-48 rounded bg-gray-200" />
          <div className="mb-6 flex gap-4 justify-center">
            <div className="h-8 w-20 rounded bg-gray-200" />
            <div className="h-8 w-20 rounded bg-gray-200" />
          </div>
          <div className="mb-4 h-10 w-full rounded bg-gray-200" />
          <div className="mb-6 h-10 w-full rounded bg-gray-200" />
          <div className="mb-4 h-10 w-full rounded bg-gray-300" />
          <div className="mx-auto h-4 w-32 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  )
}
