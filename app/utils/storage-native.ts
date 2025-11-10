import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Secure storage for React Native
 * Uses SecureStore on native platforms and AsyncStorage on web
 */

export const secureStorage = {
  /**
   * Store a value securely
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error('Error setting item in secure storage:', error);
      throw error;
    }
  },

  /**
   * Get a value from secure storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error('Error getting item from secure storage:', error);
      return null;
    }
  },

  /**
   * Remove a value from secure storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error('Error removing item from secure storage:', error);
      throw error;
    }
  },

  /**
   * Clear all values from secure storage
   */
  async clear(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.clear();
      } else {
        // SecureStore doesn't have a clear all method
        // You'll need to track keys manually if you need this
        console.warn('SecureStore does not support clear all operation');
      }
    } catch (error) {
      console.error('Error clearing secure storage:', error);
      throw error;
    }
  },

  /**
   * Get all keys from storage
   */
  async keys(): Promise<string[]> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getAllKeys();
      } else {
        // SecureStore doesn't have a keys method
        // You'll need to track keys manually if you need this
        console.warn('SecureStore does not support getting all keys');
        return [];
      }
    } catch (error) {
      console.error('Error getting keys from secure storage:', error);
      return [];
    }
  },

  /**
   * Store an object (automatically serializes to JSON)
   */
  async setObject(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await this.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error setting object in secure storage:', error);
      throw error;
    }
  },

  /**
   * Get an object (automatically deserializes from JSON)
   */
  async getObject(key: string): Promise<any> {
    try {
      const jsonValue = await this.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error getting object from secure storage:', error);
      return null;
    }
  },
};

/**
 * Regular storage using AsyncStorage for non-sensitive data
 */
export const storage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in storage:', error);
      throw error;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from storage:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },

  async keys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting keys from storage:', error);
      return [];
    }
  },

  async setObject(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error setting object in storage:', error);
      throw error;
    }
  },

  async getObject(key: string): Promise<any> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error getting object from storage:', error);
      return null;
    }
  },
};
