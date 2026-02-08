'use client';

export default function MetricCard({ icon: Icon, label, value, change, changeType }) {
  return (
    <div className="bg-white dark:bg-[#151837]/60 dark:backdrop-blur rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
          <Icon className="text-accent" size={24} />
        </div>
        {change && (
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            changeType === 'positive' 
              ? 'bg-success/10 text-success' 
              : changeType === 'negative'
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {changeType === 'positive' ? '+' : ''}{change}
          </span>
        )}
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  );
}
