'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { type IntakeFormValues, type Session, type EvalResult } from '@/types';

const INTAKE_KEY = 'litoAi_intake';

// Get intake form data
export async function getIntakeData(): Promise<IntakeFormValues | null> {
  const cookieStore = await cookies();
  const intakeData = cookieStore.get(INTAKE_KEY)?.value;

  if (!intakeData) {
    return null;
  }

  try {
    return JSON.parse(intakeData);
  } catch {
    return null;
  }
}

// Save intake form data
export async function saveIntakeData(data: IntakeFormValues) {
  const cookieStore = await cookies();
  cookieStore.set(INTAKE_KEY, JSON.stringify(data), {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax',
  });

  revalidatePath('/project-intake');
  return { success: true };
}

// Clear intake form data
export async function clearIntakeData() {
  const cookieStore = await cookies();
  cookieStore.delete(INTAKE_KEY);
  revalidatePath('/project-intake');
  return { success: true };
}

// Save and redirect to review
export async function saveAndReview(data: IntakeFormValues) {
  await saveIntakeData(data);
  redirect('/project-intake/review');
}

// Save and exit to dashboard
export async function saveAndExit(data: IntakeFormValues) {
  await saveIntakeData(data);
  redirect('/');
}
