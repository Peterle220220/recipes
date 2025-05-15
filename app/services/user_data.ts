import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { keyUserData } from "../utils/storage_key";
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

  /// List id favorite
  private favorite: any[] = [];

  private bookmarked: any[] = [];

  private constructor() {}

  public static isFavorite(recipeId: string): boolean {
    return UserData.getInstance().favorite.includes(recipeId);
  }

  public static isBookmarked(recipeId: string): boolean {
    return UserData.getInstance().bookmarked.includes(recipeId);
  }

  public static getInstance(): UserData {
    if (!UserData.instance) {
      UserData.instance = new UserData();
    }
    return UserData.instance;
  }

  public getUser(): User | null {
    return this.user;
  }

  public static getFavorites(): any[] {
    return UserData.getInstance().favorite;
  }

  public static getBookmarked(): any[] {
    return UserData.getInstance().bookmarked;
  }

  public async fetchUser(): Promise<User | null> {
    try {
      const user = await api.get("/users/profile"); // Adjust endpoint as needed
      this.user = user;
      await AsyncStorage.setItem(keyUserData, JSON.stringify(user));
      return user;
    } catch (error) {
      return null;
    }
  }

  public async fetchFavorite(): Promise<any[]> {
    const favorite = await api.get("/users/favorites");
    this.favorite = favorite;
    return favorite;
  }

  public async fetchBookmarked(): Promise<any[]> {
    const bookmarked = await api.get("/users/bookmarks");
    this.bookmarked = bookmarked;
    return bookmarked;
  }

  public async addFavorite(recipeId: string): Promise<void> {
    await api.post("/users/favorites", { recipeId });
    this.favorite.push(recipeId);
  }

  public async removeFavorite(recipeId: string): Promise<void> {
    await api.delete(`/users/favorites/${recipeId}`);
    this.favorite = this.favorite.filter((item) => item._id !== recipeId);
  }

  public async addBookmarked(recipeId: string): Promise<void> {
    await api.post("/users/bookmarks", { recipeId });
    this.bookmarked.push(recipeId);
  }

  public async removeBookmarked(recipeId: string): Promise<void> {
    await api.delete(`/users/bookmarks/${recipeId}`);
    this.bookmarked = this.bookmarked.filter((item) => item._id !== recipeId);
  }

  public async loadFromStorage(): Promise<User | null> {
    const data = await AsyncStorage.getItem(keyUserData);
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
      await instance.fetchFavorite();
      await instance.fetchBookmarked();
    }
    return user;
  }

  public async clear() {
    this.user = null;
    await AsyncStorage.removeItem(keyUserData);
  }
}

// --- ADDITIONAL USER PROFILE API METHODS FOR ACCOUNT SCREEN ---

/**
 * Get current user profile (returns user data)
 */
export const getUserProfile = async () => {
  return api.get("/users/profile");
};

/**
 * Update user profile (PUT)
 * @param {Object} profileData
 */
export const updateUserProfile = async (profileData: any) => {
  return api.put("/users/profile", profileData);
};

/**
 * Get user's created recipes (returns array)
 */
export const getUserRecipes = async () => {
  return api.get("/users/recipes");
};
export const deleteAccount = async (password: string) => {
  // Some APIs use DELETE with body, some with POST. Adjust as needed.
  return api.post("/users/delete", { password });
};

export const register = async (
  username: string,
  email: string,
  password: string
) => {
  return api.post("/auth/register", { username, email, password });
};

// --- EXPORT DEFAULT userService OBJECT FOR EASY IMPORT ---
const userService = {
  getUserProfile,
  updateUserProfile,
  getUserRecipes,
  deleteAccount,
};
export default userService;

export async function handleNotification({
  title,
  body,
  trigger = null,
}: {
  title: string;
  body: string;
  trigger?: any;
}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger,
  });
}

export function initNotificationSystem() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      severity: "default",
    }),
  });
}
