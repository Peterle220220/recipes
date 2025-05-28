import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api_base } from "../services/api";

export default function RecipeCardHorizontal({ item, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.cardImageWrapper}>
        <Image
          source={{
            uri: item.mainImage?.startsWith("http")
              ? item.mainImage
              : `${api_base}/${item.mainImage}`,
          }}
          style={styles.cardImage}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>
          By {item.createdBy?.username || "You"}
        </Text>
        {item.rating == 0 ? (
          <View />
        ) : (
          <Text style={styles.cardRating}>Rating: {item.rating} ⭐</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    padding: 12,
    alignItems: "center",
  },
  cardImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  cardSubtitle: {
    color: "#888",
    fontSize: 14,
    marginBottom: 2,
  },
  cardRating: {
    color: "#ff9800",
    fontWeight: "bold",
    fontSize: 15,
  },
});
