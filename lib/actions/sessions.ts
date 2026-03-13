'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { type Session } from '@/types';

const SESSIONS_KEY = 'litoAi_sessions';

// Get all sessions
export async function getSessions(): Promise<Session[]> {
  const cookieStore = await cookies();
  const sessionsData = cookieStore.get(SESSIONS_KEY)?.value;

  if (!sessionsData) {
    return [];
  }

  try {
    return JSON.parse(sessionsData);
  } catch {
    return [];
  }
}

// Get single session by ID
export async function getSessionById(id: string): Promise<Session | null> {
  const sessions = await getSessions();
  return sessions.find(s => s.id === id) || null;
}

// Save sessions (internal helper)
async function saveSessions(sessions: Session[]) {
  const cookieStore = await cookies();
  cookieStore.set(SESSIONS_KEY, JSON.stringify(sessions), {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });
}

// Add or update a session
export async function upsertSession(session: Session) {
  const sessions = await getSessions();
  const index = sessions.findIndex(s => s.id === session.id);

  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }

  await saveSessions(sessions);
  revalidatePath('/(dashboard)');
  return session;
}

// Delete sessions by IDs
export async function deleteSessions(ids: string[]) {
  const sessions = await getSessions();
  const filtered = sessions.filter(s => !ids.includes(s.id));

  await saveSessions(filtered);
  revalidatePath('/(dashboard)');

  return { success: true, deleted: ids.length };
}

// Delete all sessions
export async function deleteAllSessions() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSIONS_KEY);
  revalidatePath('/(dashboard)');

  return { success: true };
}
