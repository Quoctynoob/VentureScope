import { redirect } from 'next/navigation';
import { getIntakeData } from '@/lib/actions/intake';
import { ReviewForm } from '@/components/review/review-form';

export default async function ReviewPage() {
  const data = await getIntakeData();

  if (!data) {
    redirect('/project-intake');
  }

  return <ReviewForm initialData={data} />;
}
