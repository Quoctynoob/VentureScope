import { getIntakeData } from '@/lib/actions/intake';
import { IntakeForm } from '@/components/intake/intake-form';

export default async function ProjectIntake() {
  // Try to load saved data
  const savedData = await getIntakeData();

  return <IntakeForm initialData={savedData || undefined} />;
}
