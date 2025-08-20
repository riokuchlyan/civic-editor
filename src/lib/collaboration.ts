import * as React from 'react';

export interface CollaborationRoom {
  id: string;
  name: string;
  participants: string[];
  createdAt: Date;
}

export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursor?: {
    x: number;
    y: number;
  };
}

export function generateRoomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 21; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateUserColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function useCollaborationRoom() {
  const [roomName, setRoomName] = React.useState(() => {
    if (typeof window === 'undefined') return '';

    const storedRoomId = localStorage.getItem('civic-room-id');
    if (storedRoomId) return storedRoomId;

    const newRoomId = generateRoomId();
    localStorage.setItem('civic-room-id', newRoomId);
    return newRoomId;
  });

  const handleRoomChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newRoomId = e.target.value;
      localStorage.setItem('civic-room-id', newRoomId);
      setRoomName(newRoomId);
    },
    []
  );

  const generateNewRoom = React.useCallback(() => {
    const newRoomId = generateRoomId();
    localStorage.setItem('civic-room-id', newRoomId);
    setRoomName(newRoomId);
  }, []);

  return {
    generateNewRoom,
    roomName,
    handleRoomChange,
  };
}

export function useCollaborationUser() {
  const [username] = React.useState(
    () => `user-${Math.floor(Math.random() * 1000)}`
  );
  const [cursorColor] = React.useState(() => generateUserColor());

  return {
    cursorColor,
    username,
  };
}

// Validate room ID format
export function isValidRoomId(roomId: string): boolean {
  return /^[a-z0-9]{20,}$/.test(roomId);
}

// Create a collaboration room
export function createRoom(name?: string): CollaborationRoom {
  return {
    id: generateRoomId(),
    name: name || `Room ${Date.now()}`,
    participants: [],
    createdAt: new Date(),
  };
}

// Join a collaboration room
export async function joinRoom(roomId: string, user: Omit<CollaborationUser, 'id' | 'color'>): Promise<CollaborationUser> {
  const collaborationUser: CollaborationUser = {
    id: Math.random().toString(36).substring(2, 15),
    color: generateUserColor(),
    ...user,
  };

  return collaborationUser;
}

export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  return;
}

export async function getRoomInfo(roomId: string): Promise<CollaborationRoom | null> {
  return null;
}

export function setupYjsDocument(roomId: string) {
  return null;
}
