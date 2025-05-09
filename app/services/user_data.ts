import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

export type User = {
  id: string;
  name: string;
  email: string;
  // Add other user fields as needed
};

export class UserData {
  private static instance: UserData;
  private user: User | null = null;
  private static STORAGE_KEY = "user_data";

  private constructor() {}

  public static getInstance(): UserData {
    if (!UserData.instance) {
      UserData.instance = new UserData();
    }
    return UserData.instance;
  }

  public getUser(): User | null {
    return this.user;
  }

  public async fetchUser(): Promise<User | null> {
    try {
      const user = await api.get("/users/profile"); // Adjust endpoint as needed
      this.user = user;
      await AsyncStorage.setItem("user_data", JSON.stringify(user));
      return user;
    } catch (error) {
      return null;
    }
  }

  public async loadFromStorage(): Promise<User | null> {
    const data = await AsyncStorage.getItem(UserData.STORAGE_KEY);
    if (data) {
      this.user = JSON.parse(data);
      return this.user;
    }
    return null;
  }

  public static async init(): Promise<User | null> {
    const instance = UserData.getInstance();
    // Try to load from storage first
    let user = await instance.loadFromStorage();
    if (!user) {
      // If not in storage, fetch from API
      user = await instance.fetchUser();
    }
    return user;
  }

  public async clear() {
    this.user = null;
    await AsyncStorage.removeItem(UserData.STORAGE_KEY);
  }
}
