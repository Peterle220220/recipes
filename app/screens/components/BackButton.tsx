import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

export default function BackButton({
  onPress,
  color = "#333",
  style,
}: {
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.backButton, style]}
      activeOpacity={0.7}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Ionicons name="arrow-back" size={28} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    backgroundColor: "#eee",
    borderRadius: 20,
    padding: 8,
  },
});
