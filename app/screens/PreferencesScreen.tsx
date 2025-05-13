import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import userService from "../services/user_data";
import BackButton from "./components/BackButton";

export default function PreferencesScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weeklyRecommendations: true,
    darkMode: false,
    metricUnits: true,
    publicProfile: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const userData = await userService.getUserProfile();
        setPreferences({
          emailNotifications: userData.preferences?.emailNotifications ?? true,
          weeklyRecommendations:
            userData.preferences?.weeklyRecommendations ?? true,
          darkMode: userData.preferences?.darkMode ?? false,
          metricUnits: userData.preferences?.metricUnits ?? true,
          publicProfile: userData.preferences?.publicProfile ?? true,
        });
      } catch (err) {
        setError("Failed to load preferences");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await userService.updateUserProfile({ preferences });
      setSuccess("Preferences updated successfully");
      setTimeout(() => navigation.goBack(), 1000);
    } catch (err) {
      setError(err.message || "Failed to update preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: (insets?.top || 0) + 56 }]}>
      <View
        style={[styles.backButtonContainer, { top: (insets?.top || 0) + 8 }]}
        pointerEvents="box-none"
      >
        <BackButton onPress={() => navigation.goBack()} color="#333" />
      </View>
      <Text style={styles.title}>Preferences</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <View style={styles.switchRow}>
        <Text>Email notifications</Text>
        <Switch
          value={preferences.emailNotifications}
          onValueChange={(v) =>
            setPreferences({ ...preferences, emailNotifications: v })
          }
        />
      </View>
      <View style={styles.switchRow}>
        <Text>Weekly recommendations</Text>
        <Switch
          value={preferences.weeklyRecommendations}
          onValueChange={(v) =>
            setPreferences({ ...preferences, weeklyRecommendations: v })
          }
        />
      </View>
      <View style={styles.switchRow}>
        <Text>Dark mode</Text>
        <Switch
          value={preferences.darkMode}
          onValueChange={(v) => setPreferences({ ...preferences, darkMode: v })}
        />
      </View>
      <View style={styles.switchRow}>
        <Text>Metric units</Text>
        <Switch
          value={preferences.metricUnits}
          onValueChange={(v) =>
            setPreferences({ ...preferences, metricUnits: v })
          }
        />
      </View>
      <View style={styles.switchRow}>
        <Text>Public profile</Text>
        <Switch
          value={preferences.publicProfile}
          onValueChange={(v) =>
            setPreferences({ ...preferences, publicProfile: v })
          }
        />
      </View>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
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
  backButtonContainer: {
    position: "absolute",
    left: 15,
    zIndex: 10,
  },
  error: { color: "red", marginBottom: 8, textAlign: "center" },
  success: { color: "green", marginBottom: 8, textAlign: "center" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
