import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Href, router, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RecipeCardHorizontal from "../components/RecipeCardHorizontal";
import { UserData, getUserRecipes } from "../services/user_data";
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Nếu bạn dùng icon

export default function RecipesScreen() {
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState("saved");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const recipesPerPage = 3;
  const [currentPage, setCurrentPage] = useState({
    saved: 1,
    favorites: 1,
    myRecipes: 1,
  });
  const [savedPage, setSavedPage] = useState(1);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [myRecipesPage, setMyRecipesPage] = useState(1);
  const [loadingMoreSaved, setLoadingMoreSaved] = useState(false);
  const [loadingMoreFavorites, setLoadingMoreFavorites] = useState(false);
  const [loadingMoreMyRecipes, setLoadingMoreMyRecipes] = useState(false);
  const [hasMoreSaved, setHasMoreSaved] = useState(true);
  const [hasMoreFavorites, setHasMoreFavorites] = useState(true);
  const [hasMoreMyRecipes, setHasMoreMyRecipes] = useState(true);
  const [
    onEndReachedCalledDuringMomentum,
    setOnEndReachedCalledDuringMomentum,
  ] = useState(false);

  useEffect(() => {
    if (activeTab === "saved") {
      setHasMoreSaved(true);
      setSavedPage(1);
      fetchSaved(true);
    } else if (activeTab === "favorites") {
      setHasMoreFavorites(true);
      setFavoritesPage(1);
      fetchFavorites(true);
    } else if (activeTab === "myRecipes") {
      setHasMoreMyRecipes(true);
      setMyRecipesPage(1);
      fetchMyRecipes(true);
    }
  }, [activeTab, searchQuery]);

  useFocusEffect(
    React.useCallback(() => {
      fetchFavorites(true);
      fetchSaved(true);
    }, [])
  );

  const mergeUnique = (oldArr, newArr) => {
    const map = new Map();
    [...oldArr, ...newArr].forEach((item) => map.set(item._id, item));
    return Array.from(map.values());
  };

  const fetchSaved = async (reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMoreSaved(true);
    const bookmarksData = await UserData.getInstance().fetchBookmarked();
    if (reset) setSavedRecipes(bookmarksData);
    else setSavedRecipes((prev) => mergeUnique(prev, bookmarksData));
    setHasMoreSaved(bookmarksData.length >= recipesPerPage);
    setLoading(false);
    setLoadingMoreSaved(false);
  };

  const fetchFavorites = async (reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMoreFavorites(true);
    const favoritesData = await UserData.getInstance().fetchFavorite();
    if (reset) setFavoriteRecipes(favoritesData);
    else setFavoriteRecipes((prev) => mergeUnique(prev, favoritesData));
    setHasMoreFavorites(favoritesData.length >= recipesPerPage);
    setLoading(false);
    setLoadingMoreFavorites(false);
  };

  const fetchMyRecipes = async (reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMoreMyRecipes(true);
    const myData = await getUserRecipes();
    // console.log(JSON.stringify(myData, null, 2));
    if (reset) setMyRecipes(myData);
    else setMyRecipes((prev) => mergeUnique(prev, myData));
    setHasMoreMyRecipes(myData.length >= recipesPerPage);
    setLoading(false);
    setLoadingMoreMyRecipes(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage((prev) => ({ ...prev, [tab]: 1 }));

    setCurrentPage((prev) => ({ ...prev, [activeTab]: 1 }));
  };

  const filterRecipes = (recipes) => {
    if (!searchQuery || searchQuery.length < 3) return recipes;
    return recipes.filter((r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    handleTabChange(activeTab);
  };

  const paginate = (recipes, tab) => {
    const start = (currentPage[tab] - 1) * recipesPerPage;
    return recipes.slice(start, start + recipesPerPage);
  };

  const renderRecipe = ({ item }) => (
    <RecipeCardHorizontal
      item={item}
      onPress={() =>
        (navigation as any).navigate("RecipeDetail", { id: item._id })
      }
    />
  );

  const getRecipes = () => {
    if (activeTab === "saved") return savedRecipes;
    if (activeTab === "favorites") return favoriteRecipes;
    return myRecipes;
  };

  const handleLoadMore = () => {
    if (activeTab === "saved" && !loadingMoreSaved && hasMoreSaved) {
      fetchSaved();
    } else if (
      activeTab === "favorites" &&
      !loadingMoreFavorites &&
      hasMoreFavorites
    ) {
      fetchFavorites();
    } else if (
      activeTab === "myRecipes" &&
      !loadingMoreMyRecipes &&
      hasMoreMyRecipes
    ) {
      fetchMyRecipes();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabs}>
          {["saved", "favorites", "myRecipes"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => handleTabChange(tab)}
            >
              <Text
                style={
                  activeTab === tab ? styles.activeTabText : styles.tabText
                }
              >
                {tab === "saved"
                  ? "Saved"
                  : tab === "favorites"
                  ? "Favorites"
                  : "My Recipes"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search */}
        <TextInput
          style={styles.input}
          placeholder="Search recipes"
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
        {searchError ? <Text style={styles.error}>{searchError}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Recipes List */}
        {loading ? (
          <ActivityIndicator size="large" />
        ) : filterRecipes(getRecipes()).length > 0 ? (
          <FlatList
            data={filterRecipes(getRecipes())}
            renderItem={renderRecipe}
            keyExtractor={(item) => item._id}
            onEndReached={() => {
              if (
                !onEndReachedCalledDuringMomentum &&
                ((activeTab === "saved" && !loadingMoreSaved && hasMoreSaved) ||
                  (activeTab === "favorites" &&
                    !loadingMoreFavorites &&
                    hasMoreFavorites) ||
                  (activeTab === "myRecipes" &&
                    !loadingMoreMyRecipes &&
                    hasMoreMyRecipes))
              ) {
                handleLoadMore();
                setOnEndReachedCalledDuringMomentum(true);
              }
            }}
            onMomentumScrollBegin={() => {
              setOnEndReachedCalledDuringMomentum(false);
            }}
            onEndReachedThreshold={0.1}
            ListFooterComponent={
              (activeTab === "saved" && loadingMoreSaved) ||
              (activeTab === "favorites" && loadingMoreFavorites) ||
              (activeTab === "myRecipes" && loadingMoreMyRecipes) ? (
                <ActivityIndicator />
              ) : null
            }
          />
        ) : (
          <Text style={styles.empty}>No recipes found.</Text>
        )}
      </View>
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => {
          router.navigate("screens/CreateRecipe" as Href);
        }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12, backgroundColor: "#fff" },
  tabs: { flexDirection: "row", marginBottom: 16 },
  cardImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#eee",
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
  activeTab: { borderBottomColor: "orange" },
  tabText: { color: "#888" },
  activeTabText: { color: "orange", fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  error: { color: "red", marginBottom: 8 },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  empty: { textAlign: "center", color: "#888", marginTop: 32 },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 16,
  },
  pageBtn: { color: "orange", marginHorizontal: 16 },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    backgroundColor: "orange",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
});
