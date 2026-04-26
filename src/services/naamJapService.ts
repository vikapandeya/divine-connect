import { NaamJap } from '../types';

export const saveNaamJap = async (jap: Omit<NaamJap, 'id' | 'updatedAt'>) => {
  const response = await fetch('/api/naam-jap/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jap),
  });
  if (!response.ok) throw new Error('Failed to save Naam Jap');
  return response.json();
};

export const getDailyJaps = async (userId: string, date: string) => {
  const response = await fetch(`/api/naam-jap/logs?userId=${userId}&date=${date}`);
  if (!response.ok) throw new Error('Failed to fetch logs');
  const logs = await response.json();
  // Filter by date locally if needed, though the API could be updated to do it
  return logs.filter((log: any) => log.date === date) as NaamJap[];
};

export const getMantraStats = async (userId: string, mantraName: string) => {
  const response = await fetch(`/api/naam-jap/logs?userId=${userId}`);
  if (!response.ok) throw new Error('Failed to fetch logs');
  const logs = await response.json();
  return logs.filter((log: any) => log.mantraName === mantraName) as NaamJap[];
};
