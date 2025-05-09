import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "./services/api";

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
          <Image
            source={{ uri: `http://10.3.2.41:3000/${recipe.mainImage}` }}
            style={{ width: "100%", height: 220 }}
          />
          <View
            style={[styles.backButtonContainer, { top: (insets.top || 0) + 8 }]}
            pointerEvents="box-none"
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="arrow-back" size={28} color="#fff" />
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
          <TouchableOpacity onPress={() => setCommentModal(true)}>
            <Text style={{ color: "#ff9800", marginVertical: 8 }}>
              Leave a Review
            </Text>
          </TouchableOpacity>
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
              <Text>Rating: {c.rating} ⭐</Text>
              <Text>{c.content}</Text>
            </View>
          ))}
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
                  source={{ uri: `http://10.3.2.41:3000/${r.mainImage}` }}
                  style={{ width: 100, height: 80, margin: 8, borderRadius: 8 }}
                />
                <Text style={{ width: 100 }}>{r.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* Modal cho comment mới */}
        <Modal visible={commentModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={{ fontWeight: "bold" }}>Leave a Review</Text>
              <TextInput
                placeholder="Your review..."
                value={newComment}
                onChangeText={setNewComment}
                style={styles.input}
              />
              <TextInput
                placeholder="Rating (1-5)"
                value={String(newRating)}
                onChangeText={(v) => setNewRating(Number(v))}
                keyboardType="numeric"
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
        {/* Modal edit và delete có thể bổ sung tương tự nếu cần */}
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
});
