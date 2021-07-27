import AsyncStorage from "@react-native-async-storage/async-storage";
import EncryptedStorage from "react-native-encrypted-storage";

export const writeToStorage = (key: string, value: string) =>
  new Promise((resolve, reject) => {
    EncryptedStorage.setItem(key, value).then(resolve).catch(reject);
  });

export const readFromStorage = (key: string) =>
  new Promise<string>((resolve, reject) => {
    EncryptedStorage.getItem(key)
      .then((value) => {
        if (value && value.length > 0) {
          resolve(value);
        } else resolve("");
      })
      .catch(reject);
  });

export const removeStorage = (key: string) =>
  new Promise((resolve, reject) => {
    EncryptedStorage.removeItem(key).then(resolve).catch(reject);
  });
