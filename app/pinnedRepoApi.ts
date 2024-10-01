import { GraphQLClient, gql } from 'graphql-request';

interface PinnedRepo {
  name: string;
  description: string | null;
  stargazerCount: number;
  url: string;
  primaryLanguage: {
    name: string;
  } | null;
}

interface PinnedReposResponse {
  user: {
    pinnedItems: {
      totalCount: number;
      nodes: PinnedRepo[];
    };
  };
}

const fetchPinnedRepos = async (username: string): Promise<PinnedRepo[]> => {
  const endpoint = 'https://api.github.com/graphql';
  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_PAT}`,
    },
  });

  const query = gql`
    query($username: String!) {
      user(login: $username) {
        pinnedItems(first: 3, types: REPOSITORY) {
          totalCount
          nodes {
            ... on Repository {
              name
              description
              stargazerCount
              url
              primaryLanguage {
                name
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    username,
  };

  try {
    const data = await graphQLClient.request<PinnedReposResponse>(query, variables);
    return data.user.pinnedItems.nodes;
  } catch (error) {
    console.error('Error fetching pinned repositories:', error);
    return [];
  }
};

export default fetchPinnedRepos;
