export const SkeletonCard = () => (
  <div className="bg-white rounded-lg p-6 shadow animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="px-6 py-4 border-b border-gray-100 flex gap-4">
        <div className="h-4 bg-gray-200 rounded flex-1"></div>
        <div className="h-4 bg-gray-200 rounded flex-1"></div>
        <div className="h-4 bg-gray-200 rounded flex-1"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    ))}
  </div>
);

export const SkeletonChart = () => {
  const heights = [60, 80, 40, 90, 50, 70, 85];
  
  return (
    <div className="bg-white rounded-lg p-6 shadow animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="space-y-3">
        <div className="flex items-end gap-2 h-40">
          {heights.map((height, i) => (
            <div 
              key={i} 
              className="bg-gray-200 rounded-t flex-1"
              style={{ height: `${height}%` }}
            ></div>
          ))}
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <div className="h-3 bg-gray-200 rounded flex-1"></div>
      </div>
    </div>
  );
};

export const SkeletonList = ({ items = 3 }: { items?: number }) => (
  <div className="space-y-3">
    {[...Array(items)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg p-4 shadow animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg p-6 shadow animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    ))}
  </div>
);

export const SkeletonForm = () => (
  <div className="space-y-4 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i}>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    ))}
    <div className="h-10 bg-gray-200 rounded w-32"></div>
  </div>
);

export const SkeletonImage = () => (
  <div className="bg-gray-200 rounded-lg animate-pulse aspect-video flex items-center justify-center">
    <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
    </svg>
  </div>
);
