"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Building, Link as LinkIcon, Twitter, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchUserData, fetchUserRepos } from '../app/githubAPI';

interface UserData {
  avatar_url: string;
  name: string | null;
  login: string;
  public_repos: number;
  followers: number;
  following: number;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  created_at: string;
}

interface Language {
  name: string;
  percentage: string;
}

interface GitHubProfileCardProps {
  username: string;
}

const GitHubProfileCard: React.FC<GitHubProfileCardProps> = ({ username }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [languages, setLanguages] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data
        const user = await fetchUserData(username);
        setUserData(user);

        // Fetch repositories
        const reposData = await fetchUserRepos(username);
        setRepos(reposData);

        // Fetch languages for each repo
        // const languagesData: Record<string, number> = {};
        // await Promise.all(reposData.map(async (repo: { languages_url: string }) => {
        //   const langData = await fetchRepoLanguages(repo.languages_url);
        //   Object.entries(langData).forEach(([lang, count]) => {
        //     languagesData[lang] = (languagesData[lang] || 0) + count;
        //   });
        // }));
        // setLanguages(languagesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-col items-center">
          <Skeleton className="h-32 w-32 rounded-full" />
          <Skeleton className="h-4 w-[250px] mt-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[180px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!userData) {
    return null;
  }

  const totalBytes = Object.values(languages).reduce((sum, count) => sum + count, 0);
  const topLanguages: Language[] = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang, bytes]) => ({
      name: lang,
      percentage: ((bytes / totalBytes) * 100).toFixed(1)
    }));

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-col items-center">
        <Avatar className="h-32 w-32">
          <AvatarImage src={userData.avatar_url} alt={userData.name || userData.login} />
          <AvatarFallback>{userData.login.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <CardTitle className="mt-4 text-2xl font-bold">{userData.name || userData.login}</CardTitle>
        <p className="text-gray-500">@{userData.login}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold">{userData.public_repos}</p>
            <p className="text-sm text-gray-500">Repositories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{userData.followers}</p>
            <p className="text-sm text-gray-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{userData.following}</p>
            <p className="text-sm text-gray-500">Following</p>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {userData.location && (
            <p className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" /> {userData.location}
            </p>
          )}
          {userData.company && (
            <p className="flex items-center">
              <Building className="mr-2 h-4 w-4" /> {userData.company}
            </p>
          )}
          {userData.blog && (
            <p className="flex items-center">
              <LinkIcon className="mr-2 h-4 w-4" /> 
              <a href={userData.blog} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{userData.blog}</a>
            </p>
          )}
          {userData.twitter_username && (
            <p className="flex items-center">
              <Twitter className="mr-2 h-4 w-4" /> 
              <a href={`https://twitter.com/${userData.twitter_username}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">@{userData.twitter_username}</a>
            </p>
          )}
          <p className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" /> Joined {new Date(userData.created_at).toLocaleDateString()}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Top Languages</h3>
          <div className="space-y-2">
            {topLanguages.map((lang) => (
              <div key={lang.name} className="flex items-center">
                <Badge variant="outline" className="mr-2">{lang.name}</Badge>
                <Progress value={parseFloat(lang.percentage)} className="flex-grow" />
                <span className="ml-2 text-sm text-gray-500">{lang.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GitHubProfileCard;
