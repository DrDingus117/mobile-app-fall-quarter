import WalkDetailsScreen from '@/components/walk-details-screen';
import { useLocalSearchParams } from 'expo-router';

export default function WalkDetailsRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const walkId = Array.isArray(id) ? id[0] : id;
  return <WalkDetailsScreen walkId={walkId} />;
}