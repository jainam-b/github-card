"use client"
import React, { useState } from 'react';
import { User, MapPin, Twitter, Code, Star, GitFork, Github, Mail, Link as LinkIcon, Linkedin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchUserData,  repoList } from "./githubAPI";
import { fetchTotalContributions } from "./contributionApi";
import fetchPinnedRepos, { PinnedRepo } from './pinnedRepoApi';
import { ErrorMessage } from './utils';

interface UserData {
  name: string;
  login: string;
  avatar_url: string;
  public_repos: number;
  location: string | null;
  twitter_username: string | null;
  email: string | null;
  blog: string | null;
  linkedin_url: string | null;
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
    <div className="w-[700px] mx-auto mt-10">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden">
          <input
            type="text"
            placeholder="Enter GitHub username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-grow p-2 focus:outline-none"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors">
            Fetch Profile
          </button>
        </div>
      </form>

      {loading && <LoadingSkeleton />}
      {error && <ErrorMessage message={error} />}
      {!loading && user && (
        <Card className="w-[700px] h-[400px] overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg relative">
          <CardContent className="p-4 flex h-full">
            <div className="w-1/3 pr-4 border-r border-gray-200">
              <div className="flex items-center mb-4">
                <img src={user.avatar_url} alt={user.name} className="w-16 h-16 rounded-full border-2 border-white shadow-sm" />
                <div className="ml-3">
                  <h2 className="text-lg font-bold text-gray-800 truncate">{user.name}</h2>
                  <p className="text-sm text-gray-600">@{user.login}</p>
                </div>
              </div>
              <div className="space-y-2">
                <DetailItem icon={<User size={14} />} label="Repos" value={user.public_repos.toString()} />
                <DetailItem icon={<Code size={14} />} label="Contributions" value={contributions?.toString() || "N/A"} />
                <DetailItem icon={<MapPin size={14} />} label="Location" value={user.location || "N/A"} />
                {user.email && (
                  <DetailItem 
                    icon={<Mail size={14} />} 
                    label="Email" 
                    value={<a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">{user.email}</a>} 
                  />
                )}
                {user.twitter_username && (
                  <DetailItem 
                    icon={<Twitter size={14} />} 
                    label="Twitter" 
                    value={<a href={`https://twitter.com/${user.twitter_username}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@{user.twitter_username}</a>} 
                  />
                )}
                {user.blog && (
                  <DetailItem 
                    icon={<LinkIcon size={14} />} 
                    label="Website" 
                    value={<a href={user.blog} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{user.blog}</a>} 
                  />
                )}
                {user.linkedin_url && (
                  <DetailItem 
                    icon={<Linkedin size={14} />} 
                    label="LinkedIn" 
                    value={<a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Profile</a>} 
                  />
                )}
              </div>
            </div>
            <div className="w-2/3 pl-4 flex flex-col">
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-2 text-gray-800">Top Languages</h3>
                <div className="space-y-2">
                  {topLanguages.slice(0, 4).map(([language, score]) => (
                    <div key={language} className="flex justify-between text-xs">
                      <span className="text-gray-700 truncate">{language}</span>
                      <span className="text-gray-500">{Math.round(score)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-2 text-gray-800">Top Repositories</h3>
                <div className="space-y-2">
                  {pinnedRepos.slice(0, 3).map((repo) => (
                    <a key={repo.name} href={repo.url} target="_blank" rel="noopener noreferrer" 
                       className="block bg-white rounded p-2 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm text-blue-600 truncate">{repo.name}</h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span className="flex items-center"><Star size={12} className="mr-1" />{repo.stargazerCount}</span>
                          <span className="flex items-center"><GitFork size={12} className="mr-1" />{repo.forks_count}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">{repo.description}</p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-2 left-2 flex items-center bg-white rounded-full px-3 py-1 shadow-sm">
            <Github size={16} className="text-blue-600 mr-1" />
            <span className="text-sm font-medium text-gray-700">DevCard</span>
          </div>
        </Card>
      )}
    </div>
  );
}




const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <div className="flex items-center space-x-2 text-sm">
    <div className="text-blue-600">{icon}</div>
    <span className="font-medium text-gray-700">{label}:</span>
    <span className="text-gray-600 truncate">{value}</span>
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <Card className="w-[700px] h-[400px]">
    <CardContent className="p-4 flex h-full">
      <div className="w-1/3 pr-4 border-r border-gray-200">
        <div className="flex items-center mb-4">
          <Skeleton className="w-16 h-16 rounded-full mr-3" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="w-2/3 pl-4 flex flex-col">
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-16 w-full mb-2" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);