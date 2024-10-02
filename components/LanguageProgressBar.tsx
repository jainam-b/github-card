import React from 'react';

interface LanguageStatsProps {
  languages: [string, number][];
}

const LanguageStats: React.FC<LanguageStatsProps> = ({ languages }) => {
  const totalScore = languages.reduce((sum, [, score]) => sum + (score || 0), 0); // Removed the unused '_'
  const colorMap: { [key: string]: string } = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    C: '#555555',
    'C++': '#f34b7d',
    Ruby: '#701516',
    Go: '#00ADD8',
    Rust: '#dea584',
    // Add more languages and colors as needed
  };

  if (totalScore === 0) return null; // Safeguard against empty or zero total scores

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Top Languages</h3>
        <div className="text-xs text-gray-500">{languages.length} total</div>
      </div>
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
        {languages.map(([language, score], index) => {
          const width = (score / totalScore) * 100;
          return (
            <div
              key={language}
              style={{
                width: `${width}%`,
                backgroundColor: colorMap[language] || `hsl(${index * 137.508}, 70%, 50%)`,
                left: `${languages.slice(0, index).reduce((sum, [, s]) => sum + (s / totalScore) * 100, 0)}%`
              }}
              className="absolute top-0 h-full"
              title={`${language}: ${Math.round(width)}%`}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {languages.slice(0, 4).map(([language, score]) => (
          <div key={language} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: colorMap[language] || `hsl(${languages.indexOf([language, score]) * 137.508}, 70%, 50%)` }}
            />
            <span className="text-xs font-medium text-gray-700 truncate">{language}</span>
            <span className="text-xs text-gray-500">{Math.round((score / totalScore) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageStats;
