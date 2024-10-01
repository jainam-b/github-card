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
const displayTopLanguages = async (username: string) => {
  const topLanguages = await repoList(username);
  topLanguages.forEach(([language, score]) => {
    console.log(`Language: ${language}, Score: ${score}`);
  });
};

// Example usage
displayTopLanguages('jainam-b').catch(console.error);