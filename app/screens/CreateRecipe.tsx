import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { api, api_base } from "../services/api";
import { keyToken } from "../utils/storage_key";
import BackButton from "./components/BackButton";

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];
const CUISINE_OPTIONS = [
  "Vietnamese",
  "Italian",
  "Chinese",
  "Japanese",
  "American",
  "Other",
];
const CATEGORY_OPTIONS = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack"];

async function createRecipe(recipeData: any) {
  // Giả lập API, thay bằng api.post thực tế
  return api.post("/recipes", recipeData);
}

async function uploadImage(imageFile: any) {
  if (!imageFile) throw new Error("No file provided");
  // Giả lập lấy token, bạn cần thay bằng authService.getToken() thực tế
  const token = await AsyncStorage.getItem(keyToken);
  const formData = new FormData();
  formData.append("image", {
    uri: imageFile.uri,
    name: imageFile.fileName || "photo.jpg",
    type: imageFile.type || "image/jpeg",
  } as any);
  try {
    const response = await fetch(`${api_base}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: formData,
    });
    console.log(response);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Upload failed");
    if (data.imageUrl && data.imageUrl.startsWith("/uploads/")) {
      data.imageUrl = data.imageUrl.replace("/uploads/", "uploads/");
    }
    return data;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

export default function CreateRecipe() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  // State cho các trường cơ bản
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState("4");
  const [prepTime, setPrepTime] = useState("15");
  const [cookTime, setCookTime] = useState("30");
  const [difficulty, setDifficulty] = useState(DIFFICULTY_OPTIONS[1]);
  const [cuisine, setCuisine] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [mainImageLocal, setMainImageLocal] = useState("");
  const [ingredients, setIngredients] = useState([
    { name: "", amount: "", unit: "" },
  ]);
  const [steps, setSteps] = useState([{ description: "" }]);
  const [notes, setNotes] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }]);
  };
  const handleRemoveIngredient = (idx: number) => {
    if (ingredients.length > 1)
      setIngredients(ingredients.filter((_, i) => i !== idx));
  };
  const handleIngredientChange = (
    idx: number,
    field: string,
    value: string
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[idx][field] = value;
    setIngredients(newIngredients);
  };
  const handleAddStep = () => {
    setSteps([...steps, { description: "" }]);
  };
  const handleRemoveStep = (idx: number) => {
    if (steps.length > 1) setSteps(steps.filter((_, i) => i !== idx));
  };
  const handleStepChange = (idx: number, value: string) => {
    const newSteps = [...steps];
    newSteps[idx].description = value;
    setSteps(newSteps);
  };

  const pickMainImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access media library is required!"
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUploadingImage(true);
      try {
        const file = result.assets[0];
        const uploadRes = await uploadImage(file);
        setMainImageUrl(uploadRes.imageUrl);
      } catch (err: any) {
        Alert.alert("Error", err.message || "Failed to upload image");
        setMainImageUrl("");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = async () => {
    const errors: { [key: string]: boolean } = {};
    if (!title.trim()) errors.title = true;
    if (!description.trim()) errors.description = true;
    if (!servings.trim()) errors.servings = true;
    if (!prepTime.trim()) errors.prepTime = true;
    if (!cookTime.trim()) errors.cookTime = true;
    if (!difficulty.trim()) errors.difficulty = true;
    if (!cuisine.trim()) errors.cuisine = true;
    if (!category.trim()) errors.category = true;
    if (!mainImageUrl) errors.mainImage = true;
    if (!ingredients.length || !ingredients.some((i) => i.name.trim()))
      errors.ingredients = true;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      let msg = "Please fill all required fields:";
      if (errors.title) msg += "\n- Title";
      if (errors.description) msg += "\n- Description";
      if (errors.servings) msg += "\n- Servings";
      if (errors.prepTime) msg += "\n- Prep time";
      if (errors.cookTime) msg += "\n- Cook time";
      if (errors.difficulty) msg += "\n- Difficulty";
      if (errors.cuisine) msg += "\n- Cuisine";
      if (errors.category) msg += "\n- Category";
      if (errors.mainImage) msg += "\n- Main image";
      if (errors.ingredients) msg += "\n- At least 1 ingredient";
      Alert.alert("Error", msg);
      return;
    }
    setLoading(true);
    try {
      const recipeData = {
        title,
        description,
        servings: Number(servings),
        prepTime: Number(prepTime),
        cookTime: Number(cookTime),
        difficulty,
        cuisine,
        category,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        mainImage: mainImageUrl,
        ingredients: ingredients.filter((i) => i.name.trim()),
        steps: steps.filter((s) => s.description.trim()),
        notes,
        isPublic,
        nutrition: {
          calories: calories ? Number(calories) : null,
          protein: protein ? Number(protein) : null,
          carbs: carbs ? Number(carbs) : null,
          fat: fat ? Number(fat) : null,
        },
      };
      const created = await createRecipe(recipeData);
      // handleNotification({
      //   title: `Recipe ${created.title} created`,
      //   body: "Your recipe has been created successfully!",
      //   trigger: null,
      // });
      // console.log(created);
      Alert.alert("Success", "Recipe created successfully!", [
        { text: "View details", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create recipe.");
    } finally {
      setLoading(false);
    }
  };

  // Label helper
  const RequiredLabel = ({
    children,
    error,
  }: {
    children: React.ReactNode;
    error?: boolean;
  }) => (
    <Text style={[styles.label, error && { color: "red" }]}>
      {children} <Text style={{ color: "red" }}>*</Text>
    </Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.backButtonContainer} pointerEvents="box-none">
          <BackButton onPress={() => navigation.goBack()} color="#333" />
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
          <Text style={styles.title}>Create New Recipe</Text>
          <RequiredLabel error={fieldErrors.title}>Title</RequiredLabel>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={(v) => {
              setTitle(v);
              setFieldErrors((e) => ({ ...e, title: false }));
            }}
          />
          <RequiredLabel error={fieldErrors.description}>
            Description
          </RequiredLabel>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Description"
            value={description}
            onChangeText={(v) => {
              setDescription(v);
              setFieldErrors((e) => ({ ...e, description: false }));
            }}
            multiline
          />
          <RequiredLabel error={fieldErrors.servings}>Servings</RequiredLabel>
          <TextInput
            style={styles.input}
            placeholder="Servings"
            value={servings}
            onChangeText={(v) => {
              setServings(v);
              setFieldErrors((e) => ({ ...e, servings: false }));
            }}
            keyboardType="numeric"
          />
          <RequiredLabel error={fieldErrors.prepTime}>
            Prep time (minutes)
          </RequiredLabel>
          <TextInput
            style={styles.input}
            placeholder="Prep time (minutes)"
            value={prepTime}
            onChangeText={(v) => {
              setPrepTime(v);
              setFieldErrors((e) => ({ ...e, prepTime: false }));
            }}
            keyboardType="numeric"
          />
          <RequiredLabel error={fieldErrors.cookTime}>
            Cook time (minutes)
          </RequiredLabel>
          <TextInput
            style={styles.input}
            placeholder="Cook time (minutes)"
            value={cookTime}
            onChangeText={(v) => {
              setCookTime(v);
              setFieldErrors((e) => ({ ...e, cookTime: false }));
            }}
            keyboardType="numeric"
          />
          <RequiredLabel error={fieldErrors.difficulty}>
            Difficulty
          </RequiredLabel>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 10 }}
          >
            {DIFFICULTY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.chip, difficulty === opt && styles.chipSelected]}
                onPress={() => {
                  setDifficulty(opt);
                  setFieldErrors((e) => ({ ...e, difficulty: false }));
                }}
              >
                <Text style={{ color: difficulty === opt ? "#fff" : "#333" }}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <RequiredLabel error={fieldErrors.cuisine}>Cuisine</RequiredLabel>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 10 }}
          >
            {CUISINE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.chip, cuisine === opt && styles.chipSelected]}
                onPress={() => {
                  setCuisine(opt);
                  setFieldErrors((e) => ({ ...e, cuisine: false }));
                }}
              >
                <Text style={{ color: cuisine === opt ? "#fff" : "#333" }}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <RequiredLabel error={fieldErrors.category}>Category</RequiredLabel>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 10 }}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.chip, category === opt && styles.chipSelected]}
                onPress={() => {
                  setCategory(opt);
                  setFieldErrors((e) => ({ ...e, category: false }));
                }}
              >
                <Text style={{ color: category === opt ? "#fff" : "#333" }}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.label}>Tags</Text>
          <TextInput
            style={styles.input}
            placeholder="Tags (comma separated)"
            value={tags}
            onChangeText={setTags}
          />
          <RequiredLabel error={fieldErrors.mainImage}>
            Main image
          </RequiredLabel>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Button
              title="Pick image"
              onPress={() => {
                pickMainImage();
                setFieldErrors((e) => ({ ...e, mainImage: false }));
              }}
            />
            {uploadingImage && (
              <ActivityIndicator
                size="small"
                color="#f90"
                style={{ marginLeft: 12 }}
              />
            )}
            {mainImageUrl ? (
              <Image
                source={{ uri: `${api_base}/${mainImageUrl}` }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 8,
                  marginLeft: 12,
                }}
              />
            ) : null}
          </View>
          <RequiredLabel error={fieldErrors.ingredients}>
            Ingredients
          </RequiredLabel>
          {ingredients.map((ing, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <View style={{ flex: 2, marginRight: 4 }}>
                {idx === 0 && <Text style={styles.label}>Ingredient name</Text>}
                <TextInput
                  style={styles.input}
                  placeholder="Ingredient name"
                  value={ing.name}
                  onChangeText={(v) => handleIngredientChange(idx, "name", v)}
                />
              </View>
              <View style={{ flex: 1, marginRight: 4 }}>
                {idx === 0 && <Text style={styles.label}>Amount</Text>}
                <TextInput
                  style={styles.input}
                  placeholder="Amount"
                  value={ing.amount}
                  onChangeText={(v) => handleIngredientChange(idx, "amount", v)}
                />
              </View>
              <View style={{ flex: 1 }}>
                {idx === 0 && <Text style={styles.label}>Unit</Text>}
                <TextInput
                  style={styles.input}
                  placeholder="Unit"
                  value={ing.unit}
                  onChangeText={(v) => handleIngredientChange(idx, "unit", v)}
                />
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveIngredient(idx)}
                disabled={ingredients.length === 1}
              >
                <Ionicons
                  name="remove-circle"
                  size={24}
                  color={ingredients.length === 1 ? "#ccc" : "red"}
                />
              </TouchableOpacity>
            </View>
          ))}
          <Button title="Add ingredient" onPress={handleAddIngredient} />
          <Text style={styles.label}>Steps</Text>
          {steps.map((step, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <View style={{ flex: 4, marginRight: 4 }}>
                <Text style={styles.label}>{`Step ${idx + 1}`}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Step ${idx + 1}`}
                  value={step.description}
                  onChangeText={(v) => handleStepChange(idx, v)}
                  multiline
                />
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveStep(idx)}
                disabled={steps.length === 1}
              >
                <Ionicons
                  name="remove-circle"
                  size={24}
                  color={steps.length === 1 ? "#ccc" : "red"}
                />
              </TouchableOpacity>
            </View>
          ))}
          <Button title="Add step" onPress={handleAddStep} />
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, { height: 60 }]}
            placeholder="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <Text style={styles.label}>Nutrition (per serving)</Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ flex: 1, marginRight: 4 }}>
              <Text style={styles.label}>Calories</Text>
              <TextInput
                style={styles.input}
                placeholder="Calories"
                value={calories}
                onChangeText={setCalories}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginRight: 4 }}>
              <Text style={styles.label}>Protein</Text>
              <TextInput
                style={styles.input}
                placeholder="Protein"
                value={protein}
                onChangeText={setProtein}
              />
            </View>
            <View style={{ flex: 1, marginRight: 4 }}>
              <Text style={styles.label}>Carbs</Text>
              <TextInput
                style={styles.input}
                placeholder="Carbs"
                value={carbs}
                onChangeText={setCarbs}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Fat</Text>
              <TextInput
                style={styles.input}
                placeholder="Fat"
                value={fat}
                onChangeText={setFat}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 10,
            }}
          >
            <Text style={{ flex: 1 }}>Public</Text>
            <Switch value={isPublic} onValueChange={setIsPublic} />
          </View>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#f90"
              style={{ marginVertical: 10 }}
            />
          ) : null}
          <Button title="Publish recipe" onPress={handleSubmit} color="#f90" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backButtonContainer: {
    position: "absolute",
    left: 15,
    zIndex: 10,
    top: 10,
  },
  backButton: {
    backgroundColor: "#eee",
    borderRadius: 20,
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 4,
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#eee",
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: "#f90",
  },
});
