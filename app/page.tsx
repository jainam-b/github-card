"use client"
import React, { useState } from 'react';
import { User, MapPin, Twitter, Code, Star, GitFork, Github, Mail, Link as LinkIcon, Linkedin, Search, Award, Book, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchUserData, repoList } from "./githubAPI";
import { fetchTotalContributions } from "./contributionApi";
import fetchPinnedRepos, { PinnedRepo } from './pinnedRepoApi';
import { ErrorMessage } from './utils';
import LanguageStats from '../components/LanguageProgressBar';

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
  bio: string | null;
  company: string | null;
}

export default function GitHubProfile() {
  const [username, setUsername] = useState<string>('');
  const [user, setUser] = useState<UserData | null>(null);
  const [contributions, setContributions] = useState<number | null>(null);
  const [topLanguages, setTopLanguages] = useState<[string, number][]>([]);
  const [pinnedRepos, setPinnedRepos] = useState<PinnedRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
console.log(pinnedRepos)
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
    <div className="w-full max-w-4xl mx-auto mt-10 px-4">
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Enter GitHub username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex-grow"
          required
        />
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          <Search className="mr-2 h-4 w-4" /> Fetch Profile
        </Button>
      </div>
    </form>

    {loading && <LoadingSkeleton />}
    {error && <ErrorMessage message={error} />}
    {!loading && user && (
      <Card className="w-full bg-gradient-to-br from-gray-50 to-blue-50 shadow-xl overflow-hidden relative">
        <div className="absolute top-4 right-4 flex items-center bg-white bg-opacity-80 text-white rounded-full px-4 py-2 shadow-md">
          <Github className="mr-2 h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-700 font-bold">DevCard</span>
        </div>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-6 md:mb-0 md:pr-8">
              <div className="flex flex-col items-center text-center mb-6">
                <img src={user.avatar_url} alt={user.name} className="w-40 h-40 rounded-full border-4 border-white shadow-lg mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h2>
                <p className="text-gray-600 mb-2">@{user.login}</p>
                {user.company && (
                  <Badge variant="secondary" className="mb-2">
                    <User className="h-3 w-3 mr-1" />
                    {user.company}
                  </Badge>
                )}
                {user.bio && <p className="mt-2 text-sm text-gray-700">{user.bio}</p>}
              </div>
              <div className="space-y-3">
                <DetailItem icon={<Book className="h-5 w-5" />} label="Repositories" value={user.public_repos} />
                <DetailItem icon={<Code className="h-5 w-5" />} label="Contributions" value={contributions?.toString() || "N/A"} />
                <DetailItem icon={<MapPin className="h-5 w-5" />} label="Location" value={user.location || "N/A"} />
                <SocialLink icon={<Mail className="h-5 w-5" />} label="Email" value={user.email} href={`mailto:${user.email}`} />
                <SocialLink icon={<Twitter className="h-5 w-5" />} label="Twitter" value={user.twitter_username} href={`https://twitter.com/${user.twitter_username}`} />
                <SocialLink icon={<LinkIcon className="h-5 w-5" />} label="Website" value={user.blog} href={user.blog} />
                <SocialLink icon={<Linkedin className="h-5 w-5" />} label="LinkedIn" value={user.linkedin_url} href={user.linkedin_url} />
              </div>
            </div>
            <div className="md:w-2/3 md:pl-8 md:border-l border-gray-200">
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <Award className="mr-2 h-6 w-6 text-yellow-500" /> Top Languages
                </h3>
                <LanguageStats languages={topLanguages} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <Star className="mr-2 h-6 w-6 text-yellow-500" /> Featured Projects
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pinnedRepos.slice(0, 4).map((repo) => (
                    <a key={repo.name} href={repo.url} target="_blank" rel="noopener noreferrer" 
                       className="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-blue-600 truncate text-lg">{repo.name}</h4>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{repo.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center"><Star className="mr-1 h-4 w-4" />{repo.stargazerCount}</span>
                        <span className="flex items-center"><GitFork className="mr-1 h-4 w-4" />{repo.forks_count}</span>
                        {repo.primaryLanguage && (
                          <span className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: repo.primaryLanguage.color }}></span>
                            {repo.primaryLanguage.name}
                          </span>
                        )}
                      </div>
                      {repo.openGraphImageUrl && (
                        <img src={repo.openGraphImageUrl} alt={`${repo.name} preview`} className="mt-3 rounded-md w-full h-32 object-cover" />
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
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

const SocialLink: React.FC<{ icon: React.ReactNode; label: string; value: string | null; href: string | null }> = ({ icon, label, value, href }) => {
  if (!value) return null;
  return (
    <a href={href || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm text-blue-600 hover:underline">
      <div>{icon}</div>
      <span>{label}</span>
    </a>
  );
};

const LoadingSkeleton: React.FC = () => (
  <Card className="w-full">
    <CardContent className="p-8 flex flex-col md:flex-row">
      <div className="md:w-1/3 mb-6 md:mb-0 md:pr-8">
        <div className="flex flex-col items-center mb-6">
          <Skeleton className="w-40 h-40 rounded-full mb-4" />
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
      <div className="md:w-2/3 md:pl-8 md:border-l border-gray-200">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-2 mb-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);