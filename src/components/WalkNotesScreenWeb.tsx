import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    Button,
    FlatList,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';

const KEY = 'walkingTrackerNotes';
const MAX = 200;

type Note = {
  id: string;
  text: string;
  createdAt: string;
  syncStatus: 'pending' | 'synced';
};

export default function WalkNotesScreen() {
  const [text, setText] = useState<string>('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [status, setStatus] = useState<string>('');
  const [willSucceed, setWillSucceed] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(KEY);
        if (saved !== null) {
          const restored: Note[] = JSON.parse(saved);
          setNotes(restored);
          setStatus(`${restored.length} saved notes loaded.`);
        }
      } catch (e) {
        setStatus('Saved notes could not be loaded.');
      }
    })();
  }, []);

  const saveNote = async () => {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      setStatus('Please enter a note before saving.');
      return;
    }
    if (trimmed.length > MAX) {
      setStatus('Your note must be 200 characters or fewer.');
      return;
    }
    const newNote: Note = {
      id: Date.now().toString(),
      text: trimmed,
      createdAt: new Date().toLocaleString(),
      syncStatus: 'pending',
    };
    const updated = [newNote, ...notes];
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(updated));
      setNotes(updated);
      setText('');
      setStatus('Note saved on this device.');
    } catch (e) {
      setStatus('Unable to save the note. Please try again.');
    }
  };

  const syncNow = async () => {
    if (syncing) return;
    const pending = notes.filter((n) => n.syncStatus === 'pending');
    if (pending.length === 0) {
      setStatus('All notes are already synced.');
      return;
    }
    setSyncing(true);
    setStatus('Syncing pending notes...');
    await new Promise<void>((r) => setTimeout(r, 1000));

    if (!willSucceed) {
      setStatus(
        'Sync unsuccessful. Your notes are still saved on this device. Please try again.'
      );
      setSyncing(false);
      return;
    }

    const updated: Note[] = notes.map((n) =>
      n.syncStatus === 'pending' ? { ...n, syncStatus: 'synced' } : n
    );
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(updated));
      setNotes(updated);
      setStatus(
        `${pending.length} note${pending.length === 1 ? '' : 's'} synced successfully.`
      );
    } catch (e) {
      setStatus('Unable to save the note. Please try again.');
    }
    setSyncing(false);
  };

  const pendingCount = notes.filter((n) => n.syncStatus === 'pending').length;
  const syncedCount = notes.length - pendingCount;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Walk Notes</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter a note about your walk"
        value={text}
        onChangeText={setText}
        multiline
      />
      <Text>
        {text.length}/{MAX} characters
      </Text>

      <Button title="Save Note" onPress={saveNote} />

      <View style={styles.row}>
        <Text>Next Sync Will Succeed</Text>
        <Switch value={willSucceed} onValueChange={setWillSucceed} />
      </View>

      <Button title="Sync Now" onPress={syncNow} disabled={syncing} />

      <Text style={styles.status}>{status}</Text>

      <Text>Total Notes: {notes.length}</Text>
      <Text>Pending Notes: {pendingCount}</Text>
      <Text>Synced Notes: {syncedCount}</Text>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No walk notes have been saved.</Text>}
        renderItem={({ item }) => (
          <View style={styles.note}>
            <Text>{item.text}</Text>
            <Text>Created: {item.createdAt}</Text>
            <Text>
              Status: {item.syncStatus === 'pending' ? 'Pending Sync' : 'Synced'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
    minHeight: 70,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  status: { marginVertical: 8, fontWeight: '600' },
  note: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginVertical: 4 },
});