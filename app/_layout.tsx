import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({
    "SpaceMono-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const checkToken = async () => {
    try {
      // const token = await AsyncStorage.getItem("token");
      // if (token) {
      //   router.replace("/(tabs)/home" as Href);
      // }
    } catch (error) {
      console.error("Error checking token:", error);
    }
  };

  useEffect(() => {
    const prepare = async () => {
      try {
        // Wait for fonts to load
        if (fontsLoaded || fontError) {
          // Check token and navigate if needed
          await checkToken();
          // Hide splash screen after everything is ready
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        console.warn(e);
      }
    };

    prepare();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack initialRouteName="index">
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ title: "About" }} />
        <Stack.Screen
          name="login"
          options={{ title: "Login", headerShown: false }}
        />
        <Stack.Screen
          name="RecipeDetail"
          options={{ title: "Recipe Detail", headerShown: false }}
        />

        <Stack.Screen name="screens/register" options={{ title: "Register" }} />
        <Stack.Screen
          name="screens/forgot-password"
          options={{ title: "Forgot Password" }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
