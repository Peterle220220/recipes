import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import userService from "../services/user_data"; // Assuming you have this file
import { keyToken, keyUserData } from "../utils/storage_key";
// import AsyncStorage from '@react-native-async-storage/async-storage'; // If needed

function AccountScreen() {
  const navigation = useNavigation();

  // State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weeklyRecommendations: true,
    darkMode: false,
    metricUnits: true,
    publicProfile: true,
  });
  const [recipeCount, setRecipeCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Delete account modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const userData = await userService.getUserProfile();
      setUsername(userData.username || "");
      setEmail(userData.email || "");
      setLocation(userData.location || "");
      setPreferences({
        emailNotifications: userData.preferences?.emailNotifications ?? true,
        weeklyRecommendations:
          userData.preferences?.weeklyRecommendations ?? true,
        darkMode: userData.preferences?.darkMode ?? false,
        metricUnits: userData.preferences?.metricUnits ?? true,
        publicProfile: userData.preferences?.publicProfile ?? true,
      });
      const recipes = await userService.getUserRecipes();
      setRecipeCount(recipes.length);
    } catch (err) {
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleSendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hello!",
        body: "This is a local notification.",
      },
      trigger: null,
    });
  };

  // Save profile
  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    // Validate password
    if ((newPassword || confirmPassword) && !currentPassword) {
      setError("Current password is required to change password");
      setSaving(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setSaving(false);
      return;
    }
    try {
      const profileData = {
        username,
        email,
        location,
        preferences,
        ...(newPassword && currentPassword
          ? { password: newPassword, currentPassword }
          : {}),
      };
      await userService.updateUserProfile(profileData);
      setSuccess("Profile updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem(keyToken);
    await AsyncStorage.removeItem(keyUserData);
    navigation.replace("login" as any);
    //show notification to alert user
    Alert.alert("Logged out successfully");
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm account deletion");
      return;
    }
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const result = await userService.deleteAccount(deletePassword);
      if (result && result.message === "User account deleted successfully") {
        setDeleteModalVisible(false);
        handleLogout();
      } else {
        setDeleteError("Failed to delete account. Please try again.");
      }
    } catch (err) {
      setDeleteError(
        err.message ||
          "Failed to delete account. Please check your password and try again."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar & Info */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {username ? username[0].toUpperCase() : "?"}
            </Text>
          </View>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.location}>{location}</Text>
          <Text style={styles.recipeCount}>{recipeCount} Recipes Created</Text>
        </View>

        {/* Alerts */}
        {error ? (
          <View style={styles.alertError}>
            <Text style={styles.alertText}>{error}</Text>
          </View>
        ) : null}
        {success ? (
          <View style={styles.alertSuccess}>
            <Text style={styles.alertText}>{success}</Text>
          </View>
        ) : null}

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate("screens/EditProfileScreen" as any, {
              username,
              email,
              location,
            })
          }
        >
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate("screens/ChangePasswordScreen" as any)
          }
        >
          <Text style={styles.actionButtonText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate("screens/PreferencesScreen" as any)
          }
        >
          <Text style={styles.actionButtonText}>Preferences</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setDeleteModalVisible(true)}
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>

        {/* Delete Modal */}
        <Modal
          visible={deleteModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.sectionTitle}>Delete Account</Text>
              <Text style={{ marginBottom: 12 }}>
                Are you sure you want to delete your account? This action cannot
                be undone.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password to confirm"
                value={deletePassword}
                onChangeText={setDeletePassword}
                secureTextEntry
              />
              {deleteError ? (
                <View style={styles.alertError}>
                  <Text style={styles.alertText}>{deleteError}</Text>
                </View>
              ) : null}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 8,
                }}
              >
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButtonModal}
                  onPress={handleDeleteAccount}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={[styles.deleteButtonText, { color: "#fff" }]}>
                      Delete
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f8f8f8", flexGrow: 1 },
  avatarSection: { alignItems: "center", marginBottom: 20 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ffa726",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarText: { fontSize: 48, color: "#fff", fontWeight: "bold" },
  username: { fontSize: 22, fontWeight: "bold", marginTop: 4 },
  email: { color: "#888", marginBottom: 2 },
  location: { color: "#888", marginBottom: 2 },
  recipeCount: { color: "#555", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 12 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#ffa726",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  saveButtonOutline: {
    borderWidth: 1,
    borderColor: "#ffa726",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonOutlineText: { color: "#ffa726", fontWeight: "bold", fontSize: 16 },
  logoutButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e53935",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  logoutButtonText: { color: "#e53935", fontWeight: "bold", fontSize: 16 },
  deleteButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e53935",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  deleteButtonText: { color: "#e53935", fontWeight: "bold", fontSize: 16 },
  alertError: {
    backgroundColor: "#fdecea",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    color: "white",
  },
  alertSuccess: {
    backgroundColor: "#e6f4ea",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  alertText: { color: "#b71c1c", textAlign: "center" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: "#eee",
  },
  cancelButtonText: { color: "#333", fontWeight: "bold" },
  deleteButtonModal: {
    backgroundColor: "#e53935",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  actionButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ffa726",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  actionButtonText: { color: "#ffa726", fontWeight: "bold", fontSize: 16 },
  notifyButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  notifyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AccountScreen;
