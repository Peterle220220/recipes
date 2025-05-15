import { router, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RecipeCard from "../components/RecipeCard";
import { api, api_base } from "../services/api";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [recipes, setRecipes] = useState([]);
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecipesRecent = async () => {
    try {
      const response = await api.get("/recipes/recent");
      setRecentRecipes(response);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      Alert.alert("Error fetching recipes:", error);
    }
  };

  const fetchRecipes = async () => {
    try {
      const response = await api.get("/recipes/popular");
      setRecipes(response.recipes || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      Alert.alert("Error fetching recipes:", error.message || String(error));
    }
  };

  useEffect(() => {
    fetchRecipes();
    fetchRecipesRecent();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecipes();
    await fetchRecipesRecent();
    setRefreshing(false);
  };

  const handleSearch = (e) => {
    router.navigate(`/(tabs)/search`);
  };

  const renderRecipe = useCallback(
    ({ item }) => (
      <RecipeCard
        key={item._id}
        imageSource={`${api_base}/${item.mainImage}`}
        recipeName={item.title}
        recipeId={item._id}
        onPress={() =>
          (navigation as any).navigate("RecipeDetail", { id: item._id })
        }
      />
    ),
    []
  );

  // ListHeaderComponent contains all UI
  const renderHeader = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.text}>Hungry? Choose a dish</Text>
        <Image
          style={styles.logo}
          source={require("../../assets/images/splash.png")}
        />
      </View>
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handleSearch}>
          <TextInput
            style={styles.inputField}
            placeholder="Search for a recipe"
            readOnly={true}
            placeholderTextColor="#888"
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.popularText}>Popular Recipes</Text>
      <FlatList
        data={recipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
      <Text style={styles.popularText}>Recent Recipes</Text>
      <FlatList
        showsHorizontalScrollIndicator={false}
        data={recentRecipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => item._id}
        horizontal
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    marginTop: 20,
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
