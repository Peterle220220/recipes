import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { api } from "../services/api";

const categories = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Appetizer",
  "Soup",
  "Salad",
  "Main Course",
  "Side Dish",
  "Dessert",
  "Snack",
  "Beverage",
];
const cuisines = [
  "Italian",
  "Mexican",
  "Chinese",
  "Japanese",
  "Indian",
  "French",
  "Thai",
  "Mediterranean",
  "American",
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [withIngredients, setWithIngredients] = useState("");
  const [withoutIngredients, setWithoutIngredients] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [activeTab, setActiveTab] = useState("latest");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showFilter, setShowFilter] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        q: searchQuery,
        withIngredients,
        withoutIngredients,
        category: selectedCategory,
        cuisine: selectedCuisine,
        tab: activeTab,
      };
      const queryString = Object.keys(params)
        .filter(
          (key) =>
            params[key] !== undefined &&
            params[key] !== null &&
            params[key] !== ""
        )
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        )
        .join("&");
      console.log(queryString);
      const endpoint = `/search${queryString ? "?" + queryString : ""}`;
      const response = await api.get(endpoint);
      console.log(response.recipes);
      setSearchResults(response.recipes || []);
    } catch (e) {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setWithIngredients("");
    setWithoutIngredients("");
    setSelectedCategory("");
    setSelectedCuisine("");
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Search Recipes</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.input}
              placeholder="Search recipes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterButtonTop}
              onPress={() => setShowFilter(true)}
            >
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "latest" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("latest")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "latest" && styles.tabTextActive,
                ]}
              >
                Latest
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "popular" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("popular")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "popular" && styles.tabTextActive,
                ]}
              >
                Popular
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {loading ? (
            <ActivityIndicator size="large" style={{ marginTop: 32 }} />
          ) : searchResults.length > 0 ? (
            <ScrollView style={{ flex: 1 }}>
              {searchResults.map((item) => (
                <View style={styles.card} key={item._id}>
                  <View style={styles.cardImageWrapper}>
                    <Image
                      source={{
                        uri: `http://10.3.2.41:3000/${item.mainImage}`,
                      }}
                      style={{ width: 70, height: 70 }}
                    />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSubtitle}>
                      By {item.createdBy.username}
                    </Text>
                    {item.rating == 0 ? (
                      <View></View>
                    ) : (
                      <Text>Rating: {item.rating} ⭐</Text>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : searchQuery ? (
            <View style={{ alignItems: "center", marginTop: 32 }}>
              <Text style={styles.noResultTitle}>No results found</Text>
              <Text style={styles.noResultText}>
                Try different keywords or filters.
              </Text>
            </View>
          ) : (
            <View style={{ alignItems: "center", marginTop: 32 }}>
              <Text style={styles.noResultTitle}>
                Enter a search term to find recipes
              </Text>
              <Text style={styles.noResultText}>
                Search by recipe name, ingredients, or cuisine type
              </Text>
            </View>
          )}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </View>
      </TouchableWithoutFeedback>

      {/* Modal filter options */}
      <Modal
        visible={showFilter}
        animationType="fade"
        transparent
        onRequestClose={() => setShowFilter(false)}
      >
        <Pressable
          style={styles.popupOverlay}
          onPress={() => setShowFilter(false)}
        >
          <Pressable
            style={styles.popupContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.filterTitle}>Filters</Text>
            <TextInput
              style={styles.popupInput}
              placeholder="e.g. chicken, tomato"
              value={withIngredients}
              onChangeText={setWithIngredients}
            />
            <TextInput
              style={styles.popupInput}
              placeholder="e.g. nuts, dairy"
              value={withoutIngredients}
              onChangeText={setWithoutIngredients}
            />
            <View style={styles.chipRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.chip,
                      selectedCategory === cat && styles.chipSelected,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedCategory === cat && styles.chipTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.chipRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {cuisines.map((cui) => (
                  <TouchableOpacity
                    key={cui}
                    style={[
                      styles.chip,
                      selectedCuisine === cui && styles.chipSelected,
                    ]}
                    onPress={() => setSelectedCuisine(cui)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedCuisine === cui && styles.chipTextSelected,
                      ]}
                    >
                      {cui}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.filterButtonRow}>
              <TouchableOpacity onPress={handleClearFilters}>
                <Text style={styles.clearButton}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  setShowFilter(false);
                  handleSearch();
                }}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    paddingBottom: 70, // để không bị che bởi bottom bar
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  popupInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    width: "100%",
  },
  searchButton: {
    backgroundColor: "#ff9800",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginHorizontal: 4,
  },
  tabButtonActive: {
    backgroundColor: "#ff9800",
  },
  tabText: {
    color: "#333",
    fontSize: 16,
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginBottom: 8,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    boxShadow: "0px 1px 2px rgba(0,0,0,0.1)",
    padding: 12,
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
    justifyContent: "center",
    alignItems: "center",
  },
  cardImageText: {
    color: "#aaa",
    fontSize: 12,
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
  noResultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  noResultText: {
    color: "#888",
    fontSize: 15,
    marginBottom: 8,
  },
  errorBox: {
    backgroundColor: "#ffeaea",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 15,
    textAlign: "center",
  },
  // Bottom bar
  bottomBar: {
    display: "none",
  },
  filterButtonTop: {
    backgroundColor: "#ff9800",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 8,
  },
  filterButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  // Modal
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  chip: {
    backgroundColor: "#eee",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  chipSelected: {
    backgroundColor: "#ff9800",
  },
  chipText: {
    color: "#333",
    fontSize: 14,
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  filterButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  clearButton: {
    color: "#888",
    fontSize: 16,
    marginRight: 16,
  },
  applyButton: {
    backgroundColor: "#ff9800",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
