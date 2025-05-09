import AsyncStorage from "@react-native-async-storage/async-storage";
import { Href, router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Image, View } from "react-native";
export default function Index() {
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/login" as Href);
      }
    };
    checkToken();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Image source={require("../assets/images/splas.png")} />
    </View>
  );
}
