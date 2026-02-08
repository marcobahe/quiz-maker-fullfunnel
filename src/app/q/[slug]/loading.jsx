// Ultra-light loading skeleton — pure CSS, zero JS dependencies
// This renders instantly while the server component fetches quiz data
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
      <div
        className="mb-6"
        style={{
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '1rem',
          background: 'rgba(255,255,255,0.8)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />

      {/* Card skeleton */}
      <div style={{ width: '100%', maxWidth: '32rem', padding: '0 1rem' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.7)',
            borderRadius: '1.5rem',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
            padding: '1.5rem',
          }}
        >
          {/* Progress bar skeleton */}
          <div
            style={{
              height: '0.5rem',
              borderRadius: '9999px',
              background: 'rgba(229,231,235,0.8)',
              overflow: 'hidden',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                height: '100%',
                width: '30%',
                borderRadius: '9999px',
                background: 'linear-gradient(90deg, #c4b5fd, #818cf8, #c4b5fd)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }}
            />
          </div>

          {/* Question placeholder lines */}
          <div style={{ paddingTop: '0.5rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                height: '1.25rem',
                background: 'rgba(229,231,235,0.7)',
                borderRadius: '0.5rem',
                width: '80%',
                marginBottom: '0.5rem',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
            <div
              style={{
                height: '1.25rem',
                background: 'rgba(229,231,235,0.7)',
                borderRadius: '0.5rem',
                width: '60%',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                animationDelay: '0.1s',
              }}
            />
          </div>

          {/* Option skeletons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem' }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  height: '3.5rem',
                  background: 'rgba(243,244,246,0.8)',
                  borderRadius: '1rem',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Loading text */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#94a3b8',
          }}
        >
          Carregando quiz…
        </p>
      </div>

      {/* Keyframe animations — inline to avoid external CSS dependencies */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
