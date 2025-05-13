import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Href, Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTogglePasswordVisibility } from "./hooks/useTogglePasswordVisibility";
import { api } from "./services/api";
import { UserData } from "./services/user_data";
import { keyToken } from "./utils/storage_key";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { passwordVisibility, rightIcon, handlePasswordVisibility } =
    useTogglePasswordVisibility();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const loginData = {
        email: email.trim(),
        password: password.trim(),
      };

      console.log("Sending login request with:", loginData);

      const response: any = await api.post("/auth/login", loginData);

      console.log(response);

      if (!response) {
        throw new Error("No data received from server");
      }

      // Store the token if needed

      await Promise.all([
        AsyncStorage.setItem(keyToken, response.token),
        UserData.getInstance().fetchUser(),
        UserData.init(),
      ]);

      // Navigate to the main screen on successful login
      router.replace("/(tabs)/home" as Href);
    } catch (error: any) {
      console.error("Login Error Details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });

      let errorMessage = "An error occurred during login";

      if (error.code === "ECONNREFUSED") {
        errorMessage =
          "Cannot connect to the server. Please check if the server is running.";
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage =
          "No response from server. Please check your network connection.";
      }

      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Image
          source={require("../assets/images/splash.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome To Recipes</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputField}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
              placeholderTextColor="#888"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputField}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisibility}
              autoCapitalize="none"
              autoComplete="password"
              editable={!isLoading}
              placeholderTextColor="#888"
            />

            <Pressable onPress={handlePasswordVisibility}>
              <MaterialCommunityIcons
                style={styles.showButton}
                name={rightIcon as any}
                size={22}
                color="#232323"
              />
            </Pressable>
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/screens/register" asChild>
              <TouchableOpacity disabled={isLoading}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  loginButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 16,
  },
  inputField: {
    flex: 1,
    padding: 14,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#666",
  },
  footerLink: {
    color: "#007AFF",
    fontWeight: "600",
  },
  loginButtonDisabled: {
    backgroundColor: "#999",
  },
  showButton: {
    padding: 14,
    marginRight: 8,
  },
});
