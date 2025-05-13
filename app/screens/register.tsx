import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../services/api";
import BackButton from "./components/BackButton";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onRegister = async () => {
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
      });
      if (!response) {
        throw new Error("No data received from server");
      }
      router.replace("/" as Href);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.response.data.message);
    }
  };

  const handleRegister = () => {
    let valid = true;
    setPasswordError("");
    setConfirmError("");
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    }
    if (confirmPassword !== password) {
      setConfirmError("Passwords do not match");
      valid = false;
    }
    if (!valid) return;
    onRegister();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <View style={styles.backButtonContainer} pointerEvents="box-none">
          <BackButton
            onPress={() => router.back()}
            color="#fff"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          />
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            value={password}
            autoCapitalize="none"
            autoComplete="password"
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            style={styles.eyeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        {passwordError ? (
          <Text style={styles.error}>{passwordError}</Text>
        ) : null}
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
          />
          <TouchableOpacity
            onPress={() => setShowConfirm((v) => !v)}
            style={styles.eyeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showConfirm ? "eye-off" : "eye"}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        {confirmError ? <Text style={styles.error}>{confirmError}</Text> : null}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAgree(!agree)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={agree ? "checkbox" : "square-outline"}
            size={22}
            color={agree ? "#ff9800" : "#888"}
          />
          <Text style={styles.checkboxLabel}>
            I agree to the terms and conditions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.createButton, !agree && { opacity: 0.5 }]}
          onPress={handleRegister}
          disabled={!agree}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Create Account
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButtonContainer: {
    position: "absolute",
    left: 8,
    top: 0,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 8,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    alignSelf: "center",
    color: "#222",
  },
  input: {
    padding: 14,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 8,
    color: "#333",
  },
  createButton: {
    backgroundColor: "#ff9800",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
    marginTop: 10,
    color: "#222",
  },
  error: {
    color: "#e53935",
    fontSize: 13,
    marginBottom: 4,
    marginTop: -8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 16,
  },
  eyeButton: {
    padding: 6,
  },
});
