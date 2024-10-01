"use client"
import React, { useState, useEffect } from 'react';
import axios from "axios";
import { fetchUserData } from "./githubAPI";
import { fetchTotalContributions } from "./contributionApi";
import { repoList } from "./githubAPI";  // Make sure to import repoList

export default function Home() {
  const [user, setUser] = useState(null);
  const [contributions, setContributions] = useState(null);
  const [topLanguages, setTopLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const username = "jainam-b";  
        const [userData, contributionsData, languagesData] = await Promise.all([
          fetchUserData(username),
          fetchTotalContributions("jainam-b"),  // Note: using a different username here
          repoList(username)
        ]);

        setUser(userData);
        setContributions(contributionsData);
        setTopLanguages(languagesData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An error occurred while fetching data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {user && <div>{user.name}</div>}
      {contributions && <div>Total Contributions: {contributions}</div>}
      
      {/* Display top 5 languages */}
      <h2>Top 5 Languages</h2>
      <ul>
        {topLanguages.map(([language, score]) => (
          <li key={language}>
            <strong>{language}</strong> - Score: {score}
          </li>
        ))}
      </ul>
    </div>
  );
}