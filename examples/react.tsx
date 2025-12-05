import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Props {
  title: string;
  initialCount?: number;
}

export const UserProfile: React.FC<Props> = ({ title, initialCount = 0 }) => {
  const [count, setCount] = useState<number>(initialCount);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user/1');
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };

    fetchUser();
  }, []);

  const handleIncrement = () => {
    setCount(prev => prev + 1);
  };

  return (
    <div className="user-profile">
      <h2>{title}</h2>
      {user ? (
        <div>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <div className="counter">
        <span>Count: {count}</span>
        <button onClick={handleIncrement}>Increment</button>
      </div>
    </div>
  );
};
