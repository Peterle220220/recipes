// app/components/RecipeCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface RecipeCardProps {
  imageSource: string; // Accept URL for the image
  recipeName: string;
  initialIsFavorite: boolean;
  onToggleFavorite: () => void;
  initialIsBookmarked: boolean;
  onToggleMark: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  imageSource,
  recipeName,
  initialIsFavorite,
  onToggleFavorite,
  initialIsBookmarked,
  onToggleMark,
}) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
    setIsBookmarked(initialIsBookmarked);
  }, [initialIsFavorite, initialIsBookmarked]);

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onToggleFavorite();
  };

  const handleToggleMark = () => {
    setIsBookmarked(!isBookmarked);
    onToggleMark();
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: imageSource }} style={styles.image} />
      <Text style={styles.name}>{recipeName}</Text>
      <View style={styles.iconContainer}>
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={32}
          color="red"
          onPress={handleToggleFavorite}
        />
        <Ionicons
          name={isBookmarked ? "bookmark" : "bookmark-outline"}
          size={32}
          color="blue"
          onPress={handleToggleMark}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 150, // Set a fixed width for the card
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 2, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginRight: 10, // Space between cards
  },
  image: {
    width: "100%", // Full width of the card
    height: 100, // Fixed height for the image
    resizeMode: "cover", // Cover the area without distortion
  },
  name: {
    fontSize: 16, // Adjust font size as needed
    padding: 10,
    textAlign: "center",
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});

export default RecipeCard;
