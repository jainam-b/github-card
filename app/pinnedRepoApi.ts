import { GraphQLClient, gql } from 'graphql-request';

const fetchPinnedRepos = async (username: string) => {
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
    const data = await graphQLClient.request(query, variables);
    return data.user.pinnedItems.nodes;
  } catch (error) {
    console.error('Error fetching pinned repositories:', error);
    return [];
  }
};

export default fetchPinnedRepos;
