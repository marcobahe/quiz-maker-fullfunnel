export default function QuizPlayerLoading() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background:
          'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 25%, #FFF1F2 50%, #F0FDF4 75%, #F0F9FF 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Logo placeholder */}
      <div className="w-14 h-14 rounded-2xl bg-white/80 shadow-sm mb-6 animate-pulse" />

      {/* Card skeleton */}
      <div className="w-full max-w-lg mx-auto px-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg p-6 space-y-5">
          {/* Progress bar skeleton */}
          <div className="h-2 rounded-full bg-gray-200/80 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: '30%',
                background: 'linear-gradient(90deg, #c4b5fd, #818cf8, #c4b5fd)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }}
            />
          </div>

          {/* Question placeholder */}
          <div className="space-y-2 pt-2">
            <div className="h-5 bg-gray-200/70 rounded-lg w-4/5 animate-pulse" />
            <div className="h-5 bg-gray-200/70 rounded-lg w-3/5 animate-pulse" style={{ animationDelay: '0.1s' }} />
          </div>

          {/* Option skeletons */}
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 bg-gray-100/80 rounded-2xl animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>

        {/* Loading text */}
        <p
          className="text-center mt-6 text-sm font-medium"
          style={{ color: '#94a3b8' }}
        >
          Carregando quiz…
        </p>
      </div>

      {/* Shimmer animation keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
