import AsyncStorage from "@react-native-async-storage/async-storage";
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
  private favorite: string[] = [];

  private bookmarked: string[] = [];

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

  public static getFavorites(): string[] {
    return UserData.getInstance().favorite;
  }

  public static getBookmarked(): string[] {
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

  public async fetchFavorite(): Promise<string[]> {
    const favorite = await api.get("/users/favorites");
    this.favorite = favorite.map((item) => item._id);
    return favorite;
  }

  public async fetchBookmarked(): Promise<string[]> {
    const bookmarked = await api.get("/users/bookmarks");
    this.bookmarked = bookmarked.map((item) => item._id);
    return bookmarked;
  }

  public async addFavorite(recipeId: string): Promise<void> {
    await api.post("/users/favorites", { recipeId });
    this.favorite.push(recipeId);
  }

  public async removeFavorite(recipeId: string): Promise<void> {
    await api.delete(`/users/favorites/${recipeId}`);
    this.favorite = this.favorite.filter((item) => item !== recipeId);
  }

  public async addBookmarked(recipeId: string): Promise<void> {
    await api.post("/users/bookmarks", { recipeId });
    this.bookmarked.push(recipeId);
  }

  public async removeBookmarked(recipeId: string): Promise<void> {
    await api.delete(`/users/bookmarks/${recipeId}`);
    this.bookmarked = this.bookmarked.filter((item) => item !== recipeId);
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
