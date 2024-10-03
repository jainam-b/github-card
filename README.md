# GitHub Profile Fetcher

This project is a web application built using Next.js that allows users to fetch and display a GitHub user's profile, contributions, top programming languages, and pinned repositories. The interface provides a clean and responsive design with real-time data fetching from the GitHub API.

<img width="853" alt="Screenshot 2024-10-03 at 9 06 25 AM" src="https://github.com/user-attachments/assets/dd1fd321-f881-4c53-88b2-6c6cb4f2d32c">


## Features

- Search for a GitHub user by username.
- Display the following information:
  - Public repositories count.
  - Total contributions.
  - Location and Twitter handle (if available).
- View the top programming languages used by the user, represented by a progress bar.
- List pinned repositories with stars, forks, and brief descriptions.
- Responsive design with a skeleton loading screen for smooth user experience.

## Technologies Used

- **Next.js** for server-side rendering (SSR) and SEO-friendly pages.
- **React** for building the dynamic user interface.
- **Tailwind CSS** for responsive and utility-first styling.
- **Lucide Icons** for modern and minimalist icons.
- **GitHub API** for fetching user data, repositories, and contributions.

## How It Works

1. Users can input a GitHub username to retrieve relevant information.
2. The app fetches user data, including contributions and pinned repositories, and displays them.
3. The top programming languages used by the user are visualized with progress bars showing usage percentages.

## License

This project is licensed under the MIT License.
