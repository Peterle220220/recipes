import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "./screens/components/BackButton";
import { api, api_base } from "./services/api";
import { UserData } from "./services/user_data";

function StarRating({
  rating,
  onChange,
  size = 28,
  disabled = false,
  center = false,
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        marginVertical: 8,
        alignItems: "center",
        ...(center ? { justifyContent: "center" } : {}),
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => !disabled && onChange(star)}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            size={size}
            color="#ff9800"
            style={{ marginHorizontal: 2 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function RecipeDetail() {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = (route.params || {}) as { id: string };

  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentModal, setCommentModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [editComment, setEditComment] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [actionModal, setActionModal] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [recipeRes, commentsRes, relatedRes] = await Promise.all([
        api.get(`/recipes/${id}`),
        api.get(`/comments/recipe/${id}`),
        api.get(`/recipes/${id}/related`),
      ]);
      setRecipe(recipeRes);
      setComments(commentsRes);
      setRelated(relatedRes);
    } catch (e) {
      setError("Failed to load recipe.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || newRating === 0) return;
    setCommentSubmitting(true);
    try {
      const created = await api.post("/comments", {
        recipeId: id,
        content: newComment,
        rating: newRating,
      });
      setComments([created, ...comments]);
      setNewComment("");
      setNewRating(0);
      setCommentModal(false);
    } catch (e) {
      Alert.alert("Error", "Failed to submit comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleShare = async () => {
    try {
      const ingredients = recipe.ingredients
        ?.map(
          (ing) =>
            `- ${ing.amount ? `${ing.amount} ` : ""}${ing.unit ? `${ing.unit} ` : ""
            }${ing.name}`
        )
        .join("\n");

      const steps = recipe.steps
        ?.map((step, idx) => `${idx + 1}. ${step.description}`)
        .join("\n");

      const shareMessage = `
🍳 ${recipe.title}

👨‍🍳 By ${recipe.createdBy?.username}

📝 Description:
${recipe.description}

🥗 Ingredients:
${ingredients}

📋 Instructions:
${steps}

⭐ Rating: ${recipe.rating || "Not rated yet"}

Check out this recipe on our app!
`;

      await Share.share({
        message: shareMessage,
        title: recipe.title,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share recipe");
    }
  };

  const handleEditComment = async () => {
    if (!editContent.trim() || editRating === 0) return;
    setCommentSubmitting(true);
    try {
      const updated = await api.put(`/comments/${editComment._id}`, {
        content: editContent,
        rating: editRating,
      });
      setComments(comments.map((c) => (c._id === updated._id ? updated : c)));
      setEditModal(false);
    } catch (e) {
      Alert.alert("Error", "Failed to update comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    setCommentSubmitting(true);
    try {
      await api.delete(`/comments/${editComment._id}`);
      setComments(comments.filter((c) => c._id !== editComment._id));
      setDeleteModal(false);
    } catch (e) {
      Alert.alert("Error", "Failed to delete comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  if (error) return <Text style={{ color: "red", margin: 20 }}>{error}</Text>;
  if (!recipe) return <Text style={{ margin: 20 }}>Recipe not found</Text>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ position: "relative" }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setImageViewerVisible(true)}
          >
            <Image
              source={{ uri: `${api_base}/${recipe.mainImage}` }}
              style={{ width: "100%", height: 220 }}
            />
          </TouchableOpacity>
          <View style={[styles.backButtonContainer]} pointerEvents="box-none">
            <BackButton
              onPress={() => navigation.goBack()}
              color="#fff"
              style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            />
          </View>
          <View style={styles.actionButtonContainer} pointerEvents="box-none">
            <TouchableOpacity
              onPress={() => setActionModal(true)}
              style={styles.actionButton}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons name="more-vert" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>
            {recipe.title}
          </Text>
          <Text style={{ color: "#888" }}>By {recipe.createdBy?.username}</Text>
          <Text style={{ marginVertical: 8 }}>{recipe.description}</Text>
          <Text style={{ fontWeight: "bold", marginTop: 12 }}>
            Ingredients:
          </Text>
          {recipe.ingredients?.map((ing, idx) => (
            <Text key={idx}>
              - {ing.amount ? `${ing.amount} ` : ""}
              {ing.unit ? `${ing.unit} ` : ""}
              {ing.name}
            </Text>
          ))}
          <Text style={{ fontWeight: "bold", marginTop: 12 }}>
            Instructions:
          </Text>
          {recipe.steps?.map((step, idx) => (
            <Text key={idx}>
              {idx + 1}. {step.description}
            </Text>
          ))}
          <Text style={{ fontWeight: "bold", marginTop: 12 }}>
            Reviews ({comments.length})
          </Text>
          {comments.map((c) => (
            <View
              key={c._id}
              style={{
                borderBottomWidth: 1,
                borderColor: "#eee",
                paddingVertical: 8,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>
                {c.user?.username || "Anonymous"}
              </Text>
              <StarRating
                rating={c.rating}
                onChange={() => { }}
                size={18}
                disabled
                center={false}
              />
              <Text>{c.content}</Text>
            </View>
          ))}
          <TouchableOpacity onPress={() => setCommentModal(true)}>
            <Text style={{ color: "#ff9800", marginVertical: 8 }}>
              Leave a Review
            </Text>
          </TouchableOpacity>
          <Text style={{ fontWeight: "bold", marginTop: 12 }}>
            You Might Also Like
          </Text>
          <ScrollView horizontal>
            {related.map((r) => (
              <TouchableOpacity
                key={r._id}
                onPress={() =>
                  (navigation as any).navigate("RecipeDetail", { id: r._id })
                }
              >
                <Image
                  source={{ uri: `${api_base}/${r.mainImage}` }}
                  style={{ width: 100, height: 80, margin: 8, borderRadius: 8 }}
                />
                <Text style={{ width: 100 }}>{r.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <Modal visible={commentModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={{ fontWeight: "bold" }}>Leave a Review</Text>
              <StarRating rating={newRating} onChange={setNewRating} />
              <TextInput
                placeholder="Your review..."
                value={newComment}
                onChangeText={setNewComment}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={handleSubmitComment}
                style={styles.submitButton}
                disabled={commentSubmitting}
              >
                <Text style={{ color: "#fff" }}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCommentModal(false)}
                style={{ marginTop: 8, alignItems: "center" }}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={actionModal} transparent animationType="fade">
          <TouchableOpacity
            style={styles.actionModalOverlay}
            activeOpacity={1}
            onPress={() => setActionModal(false)}
          >
            <View style={styles.actionModalContent}>
              <TouchableOpacity
                style={styles.actionOption}
                onPress={() => {
                  UserData.getInstance().addFavorite(recipe._id);
                  setActionModal(false);
                }}
              >
                {UserData.isFavorite(recipe._id) ? (
                  <Ionicons
                    name="heart"
                    size={22}
                    color="#ff9800"
                    style={{ marginRight: 8 }}
                  />
                ) : (
                  <Ionicons
                    name="heart-outline"
                    size={22}
                    color="#ff9800"
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text>Favorite</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionOption}
                onPress={() => {
                  UserData.getInstance().addBookmarked(recipe._id);
                  setActionModal(false);
                }}
              >
                {UserData.isBookmarked(recipe._id) ? (
                  <Ionicons
                    name="bookmark"
                    size={22}
                    color="#ff9800"
                    style={{ marginRight: 8 }}
                  />
                ) : (
                  <Ionicons
                    name="bookmark-outline"
                    size={22}
                    color="#ff9800"
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text>Bookmark</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionOption}
                onPress={async () => {
                  await handleShare();
                  setActionModal(false);
                }}
              >
                <Ionicons
                  name="share-social-outline"
                  size={22}
                  color="#ff9800"
                  style={{ marginRight: 8 }}
                />
                <Text>Share</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
        <Modal
          visible={imageViewerVisible}
          transparent={true}
          onRequestClose={() => setImageViewerVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: "#000" }}>
            <BackButton
              onPress={() => setImageViewerVisible(false)}
              color="#fff"
              style={{
                position: "absolute",
                top: 40,
                left: 20,
                zIndex: 10,
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            />
            <ImageViewer
              imageUrls={[{ url: `${api_base}/${recipe.mainImage}` }]}
              enableSwipeDown
              onSwipeDown={() => setImageViewerVisible(false)}
              onCancel={() => setImageViewerVisible(false)}
              renderIndicator={() => null}
              backgroundColor="#000"
              saveToLocalByLongPress={false}
            />
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  backButtonContainer: {
    position: "absolute",
    left: 16,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 8,
  },
  actionButtonContainer: {
    position: "absolute",
    right: 16,
    top: 0,
    zIndex: 10,
    height: 48,
    justifyContent: "center",
  },
  actionButton: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#0008",
  },
  modalContent: {
    backgroundColor: "#fff",
    margin: 32,
    borderRadius: 8,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginVertical: 8,
    padding: 8,
  },
  submitButton: {
    backgroundColor: "#ff9800",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  actionModalOverlay: {
    flex: 1,
    backgroundColor: "#0004",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  actionModalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 60,
    marginRight: 16,
    paddingVertical: 8,
    minWidth: 160,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
