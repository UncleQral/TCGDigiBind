import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AddCardModal from "../../../components/AddCardModal";
import CardEntity from "../../../components/CardEntity";
import EditCardModal from "../../../components/EditCardModal";
import { Colors } from "../../../constants/theme";
import { useRefresh } from "../../../hooks/useRefresh";
import { api } from "../../../utils/api";

export default function BinderDetailScreen() {
  const { id } = useLocalSearchParams();

  const [binder, setBinder] = useState(null);
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cards");
  const [filterActive, setFilterActive] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showEditCard, setShowEditCard] = useState(false);

  const router = useRouter();

  const getBinder = async () => {
    try {
      const data = await api.get(`/binder/${id}`);
      setBinder(data);
      setLoading(false);
    } catch (err) {
      console.log("getBinder error: ", err);
      setLoading(false);
    }
  };

  const getCards = async () => {
    try {
      const data = await api.get(`/binder_card?binder_id=${id}`);
      setCards(data);
    } catch (err) {
      console.log("getCards error:", err);
    }
  };

  const fetchAll = useCallback(async () => {
    await Promise.all([getBinder(), getCards()]);
  }, [id]);

  const { refreshing, onRefresh } = useRefresh(fetchAll);

  const handleLongPress = (cardId) => {
    if (!editMode) {
      setEditMode(true);
    }
    setSelectedCards((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId],
    );
  };

  const handlePress = (item) => {
    if (editMode) {
      setSelectedCards((prev) =>
        prev.includes(item.id)
          ? prev.filter((id) => id !== item.id)
          : [...prev, item.id],
      );
    } else {
      setSelectedCard(item);
      setShowEditCard(true);
    }
  };

  const handleDelete = async () => {
    try {
      for (const cardId of selectedCards) {
        await api.delete("/binder_card", { id: cardId });
      }
      setEditMode(false);
      setSelectedCards([]);
      getCards();
    } catch (err) {
      console.log("handleDelete error: ", err);
    }
  };

  useEffect(() => {
    getBinder();
    getCards();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1A1A1A",
        }}
      >
        <ActivityIndicator size="large" color="#ff7b00" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.binderInfo}>
          <View style={styles.nameRow}>
            <View style={styles.nameAndTags}>
              <Text style={styles.name}>{binder?.name}</Text>
              <View style={styles.binderTags}>
                <Text style={styles.game}>{binder?.game}</Text>
                <Text style={styles.set}>{binder?.binder_set}</Text>
              </View>
            </View>
            <Text style={styles.value}>
              {binder?.total_value
                ? `€ ${parseFloat(binder.total_value).toFixed(2)}`
                : "0,00€"}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editBtn}>
          <Feather name="edit-2" size={24} color="#ff7b00" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <TextInput
            style={styles.searchTool}
            placeholder="Search..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterActive(!filterActive)}
        >
          {filterActive ? (
            <FontAwesome name="filter" size={24} color="#ff7b00" />
          ) : (
            <Feather name="filter" size={24} color="#ff7b00" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "cards" && styles.activeTab]}
          onPress={() => setActiveTab("cards")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "cards" && styles.activeTabText,
            ]}
          >
            Cards
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "stats" && styles.activeTab]}
          onPress={() => setActiveTab("stats")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "stats" && styles.activeTabText,
            ]}
          >
            Price Stats
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === "cards" ? (
          <FlatList
            data={cards}
            numColumns={4}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#8340BF"]}
                progressBackgroundColor="#2A2A2A"
              />
            }
            renderItem={({ item }) => (
              <CardEntity
                item={item}
                onLongPress={() => handleLongPress(item.id)}
                onPress={() => handlePress(item)}
                isSelected={selectedCards.includes(item.id)}
              />
            )}
            ListEmptyComponent={
              <Text
                style={{
                  color: "#9CA3AF",
                  textAlign: "center",
                  marginTop: 20,
                }}
              >
                Binder is empty.
              </Text>
            }
          />
        ) : (
          <Text style={{ color: "#fff" }}>Price Stats coming soon...</Text>
        )}
      </View>

      <View style={styles.bottomBar}>
        {editMode ? (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setEditMode(false);
                setSelectedCards([]);
              }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>
                Delete ({selectedCards.length})
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              setShowAddCard(true);
            }}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
      <AddCardModal
        visible={showAddCard}
        onClose={() => {
          setShowAddCard(false);
          getCards();
        }}
        binder={binder}
      />
      <EditCardModal
        visible={showEditCard}
        onClose={() => {
          setShowEditCard(false);
          setSelectedCard(null);
          getCards();
        }}
        item={selectedCard}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    gap: 12,
  },
  backBtn: { padding: 4 },
  binderInfo: { flex: 1 },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameAndTags: { flex: 1 },
  name: { color: Colors.textWhite, fontSize: 16, fontWeight: "500" },
  value: { color: Colors.primaryLight, fontSize: 20, fontWeight: "500" },
  binderTags: { flexDirection: "row", gap: 6 },
  game: {
    color: Colors.primaryLight,
    backgroundColor: Colors.borderDark,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
    borderWidth: 0.5,
    borderColor: Colors.primary,
  },
  set: {
    color: Colors.textMuted,
    backgroundColor: Colors.borderDark,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  editBtn: { padding: 4 },
  searchBar: { flexDirection: "row", padding: 12, gap: 8 },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 8,
    gap: 8,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  searchTool: { flex: 1, color: Colors.textWhite, fontSize: 14 },
  filterButton: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 8,
    borderWidth: 0.5,
    borderColor: Colors.primary,
    justifyContent: "center",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  activeTab: { backgroundColor: Colors.primary },
  tabText: { color: Colors.textMuted, fontWeight: "500" },
  activeTabText: { color: Colors.textWhite },
  content: { flex: 1, paddingHorizontal: 16 },
  bottomBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 20,
    paddingBottom: 36,
    alignItems: "center",
  },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 48,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    color: Colors.textMuted,
    fontWeight: "500",
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: Colors.error,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  deleteBtnText: {
    color: Colors.textWhite,
    fontWeight: "500",
  },
});
