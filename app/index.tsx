import AsyncStorage from "@react-native-async-storage/async-storage";
import { Href, router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { UserData } from "./services/user_data";
import { keyToken } from "./utils/storage_key";

export default function Index() {
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem(keyToken);
      if (token) {
        await UserData.getInstance().fetchFavorite();
        await UserData.getInstance().fetchBookmarked();
        router.replace("/(tabs)/home");
      } else {
        router.replace("/login" as Href);
      }
    };
    checkToken();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/splash.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <ActivityIndicator size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: "80%",
    height: "50%",
  },
});
