export default function Loading() {
  const fieldKeys = [
    "brand",
    "model",
    "variant",
    "year",
    "regional",
    "body",
    "condition",
    "color",
  ];

  const swatchKeys = [
    "s1","s2","s3","s4","s5","s6",
    "s7","s8","s9","s10","s11","s12",
    "s13","s14","s15","s16","s17","s18",
  ];

  return (
    <main>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          {/* Top section: back link + title */}
          <div className="flex items-center space-x-4">
            <div className="w-28 h-10 bg-gray-200 rounded-lg" />
            <div>
              <div className="w-56 h-6 bg-gray-200 rounded mb-2" />
              <div className="w-40 h-4 bg-gray-100 rounded" />
            </div>
          </div>

          {/* Steps / progress */}
          <div className="space-y-3">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
            </div>
            <div className="w-full h-2 bg-gray-100 rounded">
              <div className="w-1/4 h-2 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white border border-stroke-light rounded-lg shadow-sm p-6">
            <h3 className="w-48 h-5 bg-gray-200 rounded mb-4">
              <span className="sr-only">Loading vehicle form</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {fieldKeys.map((k) => (
                <div key={k} className="space-y-2">
                  <div className="w-24 h-3 bg-gray-100 rounded" />
                  <div className="w-full h-10 bg-gray-200 rounded" />
                </div>
              ))}
            </div>

            {/* Color swatches placeholder */}
            <div className="mt-6">
              <div className="w-28 h-4 bg-gray-100 rounded mb-3" />
              <div className="grid grid-cols-6 gap-3">
                {swatchKeys.map((k) => (
                  <div
                    key={k}
                    className="w-12 h-12 bg-gray-200 rounded-lg border border-gray-100"
                  />
                ))}
              </div>
            </div>

            {/* large placeholder block for additional content */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="w-full h-40 bg-gray-100 rounded" />
              <div className="w-full h-40 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
