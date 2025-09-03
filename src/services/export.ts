import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function exportJson(name: string, data: any): Promise<string> {
  const path = FileSystem.cacheDirectory + name;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(data, null, 2));
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path);
  return path;
}
