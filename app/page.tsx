"use client"
import React, { useState, useEffect } from 'react';
import { User, MapPin, Twitter, Code, Star, GitFork, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchUserData, fetchTopReposByStars, repoList } from "./githubAPI";
import { fetchTotalContributions } from "./contributionApi";
import fetchPinnedRepos from './pinnedRepoApi';

interface UserData {
  name: string;
  login: string;
  avatar_url: string;
  public_repos: number;
  location: string | null;
  twitter_username: string | null;
  email: string | null;
  bio: string | null;
}

interface PinnedRepo {
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
}

export default function GitHubProfile() {
  const [username, setUsername] = useState<string>('');
  const [user, setUser] = useState<UserData | null>(null);
  const [contributions, setContributions] = useState<number | null>(null);
  const [topLanguages, setTopLanguages] = useState<[string, number][]>([]);
  const [pinnedRepos, setPinnedRepos] = useState<PinnedRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (userInput: string) => {
    setLoading(true);
    setError(null);
    try {
      const [userData, contributionsData, languagesData] = await Promise.all([
        fetchUserData(userInput),
        fetchTotalContributions(userInput),
        repoList(userInput)
      ]);
      setUser(userData);
      setContributions(contributionsData);
      setTopLanguages(languagesData);
      const repos = await fetchPinnedRepos(userInput);
      setPinnedRepos(repos);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username) {
      fetchData(username);
    }
  };

  return (
    <div className="w-[700px] mx-auto mt-5 ">
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          placeholder="Enter GitHub username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded-md p-2 mr-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white rounded-md px-4 py-2">
          Fetch Profile
        </button>
      </form>

      {loading && <LoadingSkeleton />}
      {error && <ErrorMessage message={error} />}
      {!loading && user && (
        <Card className="w-full h-full overflow-hidden">
          <CardContent className="p-4 flex flex-col h-full">
            <div className="flex items-start mb-4">
              <img src={user.avatar_url} alt={user.name} className="w-16 h-16 rounded-full mr-4" />
              <div className="flex-grow">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-gray-500">@{user.login}</p>
                <p className="text-sm text-gray-700 mt-1 line-clamp-2">{user.bio}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <DetailItem icon={<User size={14} />} label="Repos" value={user.public_repos.toString()} />
              <DetailItem icon={<Code size={14} />} label="Contributions" value={contributions?.toString() || "N/A"} />
              <DetailItem icon={<MapPin size={14} />} label="Location" value={user.location || "N/A"} />
              <DetailItem icon={<Twitter size={14} />} label="Twitter" value={user.twitter_username || "N/A"} />
            </div>

            <div className="flex-grow flex">
              <div className="w-1/3 pr-2 border-r">
                <h3 className="text-sm font-semibold mb-2">Top Languages</h3>
                <div className="space-y-1">
                  {topLanguages.slice(0, 4).map(([language, score]) => (
                    <div key={language} className="flex items-center">
                      <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: getLanguageColor(language) }}></span>
                      <span className="text-xs">{language}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-2/3 pl-2">
                <h3 className="text-sm font-semibold mb-2">Pinned Repositories</h3>
                <div className="grid grid-cols-1 gap-3">
                  {pinnedRepos.slice(0, 3).map((repo) => (
                    <a key={repo.name} href={repo.html_url} target="_blank" rel="noopener noreferrer" 
                       className="block bg-gray-50 rounded-md p-2 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium text-sm text-blue-600 flex items-center">
                          {repo.name}
                          <ExternalLink size={12} className="ml-1 text-gray-400" />
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span className="flex items-center"><Star size={12} className="mr-1" />{repo.stargazers_count}</span>
                          <span className="flex items-center"><GitFork size={12} className="mr-1" />{repo.forks_count}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{repo.description}</p>
                      <div className="flex items-center mt-1">
                        <span className="flex items-center text-xs text-gray-500">
                          <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: getLanguageColor(repo.language) }}></div>
                          {repo.language}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center space-x-1">
    {icon}
    <span className="font-medium">{label}:</span>
    <span className="text-gray-600">{value}</span>
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <div className="w-[700px] h-[400px] mx-auto">
    <Card className="w-full h-full">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-start mb-4">
          <Skeleton className="w-16 h-16 rounded-full mr-4" />
          <div className="flex-grow">
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex-grow flex">
          <Skeleton className="w-1/3 h-full mr-2" />
          <Skeleton className="w-2/3 h-full ml-2" />
        </div>
      </CardContent>
    </Card>
  </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="w-[700px] h-[400px] mx-auto flex items-center justify-center">
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm" role="alert">
      <strong className="font-bold">Error!</strong>
      <span className="block sm:inline">{message}</span>
    </div>
  </div>
);

const getLanguageColor = (language: string) => {
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
