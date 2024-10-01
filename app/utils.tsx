export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className="w-[700px] h-[400px] mx-auto flex items-center justify-center">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline">{message}</span>
      </div>
    </div>
  );
  
  export const getLanguageColor = (language: string) => {
    switch (language) {
      case 'JavaScript':
        return '#f1e05a';
      case 'TypeScript':
        return '#2b7489';
      case 'Python':
        return '#3572A5';
      case 'Java':
        return '#b07219';
      case 'Ruby':
        return '#701516';
      case 'PHP':
        return '#4F5D95';
      // Add more cases as needed
      default:
        return '#CCCCCC'; // default color for unknown languages
    }
  };