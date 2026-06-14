import * as SecureStore from 'expo-secure-store';

const API_KEY_STORAGE_KEY = 'phoneid_ph_gemini_api_key';

export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
}

export async function setApiKey(apiKey: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKey.trim());
}

export async function clearApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
}
