import axios from 'axios';

const GITHUB_API_URL = process.env.NEXT_PUBLIC_API_URL;
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_PAT;


export const fetchUserData = async (username: string) => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/users/${username}`, {
      headers: {
        'Authorization': `Bearer  ${ GITHUB_TOKEN}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

const fetchRepoLanguages = async (username: string, repoName: string): Promise<Record<string, number>> => {
  try {
    const language_url = `https://api.github.com/repos/${username}/${repoName}/languages`;
    const { data: languages } = await axios.get<Record<string, number>>(language_url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
      },
    });
    return languages;
  } catch (error) {
    console.error(`Error fetching languages for repo ${repoName}:`, error);
    return {};
  }
};

export const repoList = async (username: string): Promise<[string, number][]> => {
  try {
    const user = await fetchUserData(username);
    const repo_url = user.repos_url;
    const { data: repos } = await axios.get<Array<{ name: string }>>(repo_url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
      },
    });

    const languagesPromises = repos.map((repo) => fetchRepoLanguages(username, repo.name));
    const reposLanguages = await Promise.all(languagesPromises);

    const languageScores: Record<string, number> = {};
    reposLanguages.forEach((languages) => {
      Object.entries(languages).forEach(([language, score]) => {
        languageScores[language] = (languageScores[language] || 0) + score;
      });
    });

    const topLanguages = Object.entries(languageScores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, 5);

    return topLanguages;
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return [];
  }
};

// Usage example (make sure this is in an async function or top-level await is enabled)
export const displayTopLanguages = async (username: string) => {
  const topLanguages = await repoList(username);
  topLanguages.forEach(([language, score]) => {
    console.log(`Language: ${language}, Score: ${score}`);
  });
};

export const fetchTopReposByStars = async (username: string, limit = 5) => {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_PAT}`, // Add your GitHub PAT
      },
      params: {
        sort: "stars", // Sort repos by the number of stars
        per_page: limit, // Limit the result to top N repos
      },
    });

    const topRepos = response.data.map((repo: { name: string; stargazers_count: number; html_url: string; }) => ({
      name: repo.name,
      stars: repo.stargazers_count,
      html_url: repo.html_url,
    }));

    console.log(`Top ${limit} repositories by stars:`, topRepos);
    return topRepos;
  } catch (error) {
    console.error(`Error fetching top repositories by stars for ${username}:`, error);
    return [];
  }
};