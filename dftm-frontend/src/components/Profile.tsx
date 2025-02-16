import { useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '../types';

export const Profile = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get<User>('/api/v1/users/me');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-4">Min Profil</h1>
      {/* Profilinnehåll kommer här */}
    </div>
  );
}; 