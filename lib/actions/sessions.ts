'use server';

import { cookies } from 'next/headers';
import { getCurrentUser } from 'aws-amplify/auth/server';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { runWithAmplifyServerContext } from '@/lib/amplify-server-utils';
import { ddb, DYNAMO_TABLE } from '@/lib/aws-clients';
import { type Session } from '@/types';

// Get userId from Amplify server context
async function getCurrentUserId(): Promise<string | null> {
  try {
    const user = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (ctx) => getCurrentUser(ctx),
    }) as { userId: string };
    return user.userId;
  } catch {
    return null;
  }
}

// Map a DynamoDB job item to the Session type the table expects
function toSession(item: Record<string, unknown>): Session {
  return {
    id:        item.jobId as string,
    createdAt: item.createdAt as string,
    intake: {
      company:      (item.companyName as string) || 'Processing...',
      industry:     (item.industry as string) || '—',
      fundingStage: (item.fundingStage as string) || '—',
      status:       item.status as string,
    },
    confidence: typeof item.score === 'number' ? item.score : 0,
    riskLevel:  (item.verdict as string) || 'Pending',
    result:     (item.result as Session['result']) || {} as Session['result'],
  };
}

// Get all jobs for the current user from DynamoDB
export async function getSessions(): Promise<Session[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { Items = [] } = await ddb.send(new QueryCommand({
    TableName: DYNAMO_TABLE,
    IndexName: 'userId-createdAt-index',
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: { ':uid': userId },
    ScanIndexForward: false, // newest first
  }));

  return Items.map(toSession);
}

// Get single session by ID
export async function getSessionById(id: string): Promise<Session | null> {
  const sessions = await getSessions();
  return sessions.find(s => s.id === id) || null;
}

// No-ops kept for compatibility — DynamoDB is the source of truth now
export async function upsertSession(_session: Session) { return _session; }
export async function deleteSessions(_ids: string[]) { return { success: true, deleted: 0 }; }
export async function deleteAllSessions() { return { success: true }; }
