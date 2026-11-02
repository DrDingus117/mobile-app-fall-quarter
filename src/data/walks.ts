export type SavedWalk = {
  id: string;
  dateTime: string;
  startLatitude: number;
  startLongitude: number;
  status: string;
};

// Sample saved walks for testing deep links.
// Each walk has a different ID.
export const SAVED_WALKS: SavedWalk[] = [
  {
    id: '101',
    dateTime: 'October 1, 2026 at 10:00 AM',
    startLatitude: 47.2529,
    startLongitude: -122.4443,
    status: 'Completed',
  },
  {
    id: '102',
    dateTime: 'October 8, 2026 at 6:30 PM',
    startLatitude: 47.2659,
    startLongitude: -122.4801,
    status: 'Completed',
  },
  {
    id: '103',
    dateTime: 'October 15, 2026 at 8:15 AM',
    startLatitude: 47.2398,
    startLongitude: -122.4592,
    status: 'Paused',
  },
];

export function findWalkById(id: string): SavedWalk | undefined {
  return SAVED_WALKS.find((walk) => walk.id === id);
}
