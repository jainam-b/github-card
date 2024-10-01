import axios from "axios";

export const fetchTotalContributions = async (username: string): Promise<number | null> => {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      'https://api.github.com/graphql',
      {
        query,
        variables: { username },
      },
      {
        headers: {
          Authorization: `${process.env.GITHUB_PAT}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.errors) {
      console.error("GraphQL Errors:", response.data.errors);
      return null;
    }

    const totalContributions = response.data.data.user.contributionsCollection.contributionCalendar.totalContributions;
    console.log(`Total Contributions for ${username}:`, totalContributions);
    return totalContributions;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.error("Authentication failed. Please check your GitHub PAT.");
      } else {
        console.error("Error fetching total contributions:", error.response?.data || error.message);
      }
    } else {
      console.error("An unexpected error occurred:", error);
    }
    return null;
  }
};