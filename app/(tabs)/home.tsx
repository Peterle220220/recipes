import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import RecipeCard from "../components/RecipeCard";
import { api } from "../services/api";

export default function HomeScreen() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await api.get("/recipes", {
          params: {
            page: 1,
          },
        });
        console.log(
          "Fetched recipes:",
          JSON.stringify(response.recipes, null, 2)
        );
        setRecipes(response.recipes);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        Alert.alert("Error fetching recipes:", error);
      }
    };
    fetchRecipes();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.text}>Hungry? Choose a dish</Text>
          <Image
            style={styles.logo}
            source={require("../../assets/images/splash.png")}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputField}
            placeholder="Search for a recipe"
          />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.popularText}>Popular Recipes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                imageSource={`http://10.3.2.41:3000/${recipe.mainImage}`}
                recipeName={recipe.title}
                initialIsFavorite={false}
                onToggleFavorite={() => {}}
                initialIsBookmarked={false}
                onToggleMark={() => {}}
              />
            ))}
          </ScrollView>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 30,
  },
  container: {
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flexDirection: "column",
    flex: 1,
  },
  text: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: "bold",
  },
  popularText: {
    fontSize: 20,
    marginBottom: 18,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputField: {
    flex: 1,
    padding: 14,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingBottom: 10,
  },
});
