import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AddItemModal from "../../../components/AddItemModal";
import CardEntity from "../../../components/CardEntity";
import EditCardModal from "../../../components/EditCardModal";
import { Colors } from "../../../constants/theme";
import { useSetting } from "../../../context/SettingsContext";
import { useRefresh } from "../../../hooks/useRefresh";
import { api } from "../../../utils/api";

export default function BinderDetailScreen() {
  const { id } = useLocalSearchParams();

  const [binder, setBinder] = useState(null);
  const [cards, setCards] = useState([]);
  const [sealedItems, setSealedItems] = useState([]);
  const [gradedItems, setGradedItems] = useState([]);
  const [stats, setStats] = useState(null);
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

  const getSealed = async () => {
    try {
      const data = await api.get(`/binder_sealed?binder_id=${id}`);
      if (Array.isArray(data)) setSealedItems(data);
    } catch (err) {
      console.log("getSealed error:", err);
    }
  };

  const getGraded = async () => {
    try {
      const data = await api.get(`/graded_card?binder_id=${id}`);
      if (Array.isArray(data)) setGradedItems(data);
    } catch (err) {
      console.log("getGraded error:", err);
    }
  };

  const getStats = async () => {
    try {
      const data = await api.get(`/binder/${id}/stats`);
      console.log("stats data: ", JSON.stringify(data));
      if (data && typeof data === "object") setStats(data);
    } catch (err) {
      console.log("getStats error:", err);
    }
  };

  const fetchAll = useCallback(async () => {
    await Promise.all([
      getBinder(),
      getCards(),
      getSealed(),
      getGraded(),
      getStats(),
    ]);
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
    getSealed();
    getGraded();
    getStats();
  }, []);

  const { tagColors } = useSetting();
  const tagColor =
    (tagColors || []).find((tc) => tc.game_id == binder?.game_id)?.color ||
    Colors.primary;

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
                <Text
                  style={[
                    styles.game,
                    {
                      color: tagColor,
                      borderColor: tagColor,
                      backgroundColor: tagColor + "22",
                    },
                  ]}
                >
                  {binder?.game}
                </Text>
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
          style={[styles.tab, activeTab === "sealed" && styles.activeTab]}
          onPress={() => setActiveTab("sealed")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "sealed" && styles.activeTabText,
            ]}
          >
            Sealed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "graded" && styles.activeTab]}
          onPress={() => setActiveTab("graded")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "graded" && styles.activeTabText,
            ]}
          >
            Graded
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
        {activeTab === "cards" && (
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
              <Text style={styles.emptyText}>Binder is empty.</Text>
            }
          />
        )}

        {activeTab === "sealed" && (
          <FlatList
            data={sealedItems}
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
              <View style={styles.listItem}>
                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.listItemImage}
                    resizeMode="cover"
                  />
                ) : null}
                <View style={styles.listItemLeft}>
                  <Text style={styles.listItemName}>{item.name}</Text>
                  <Text style={styles.listItemSub}>
                    {item.category_name}
                    {item.quantity > 1 ? `  ×${item.quantity}` : ""}
                  </Text>
                </View>
                <View style={styles.listItemRight}>
                  <Text style={styles.listItemPrice}>
                    € {item.trend_price ?? "-"}
                  </Text>
                  <Text style={styles.listItemPriceSub}>
                    avg € {item.avg_sell ?? "-"}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No sealed products.</Text>
            }
          />
        )}

        {activeTab === "graded" && (
          <FlatList
            data={gradedItems}
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
              <View style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Text style={styles.listItemName}>{item.card_name}</Text>
                  <Text style={styles.listItemSub}>
                    {item.grading_company_name}
                  </Text>
                </View>
                <View style={styles.listItemRight}>
                  <Text style={styles.listItemPrice}>{item.grade}</Text>
                  {item.cert_number ? (
                    <Text style={styles.listItemPriceSub}>
                      #{item.cert_number}
                    </Text>
                  ) : null}
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No graded cards.</Text>
            }
          />
        )}

        {activeTab === "stats" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.statsScroll}
          >
            {!stats ? (
              <Text style={styles.emptyText}>No data available</Text>
            ) : (
              <>
                {/* Item counts */}
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxValue}>
                      {stats.cardCount ?? 0}
                    </Text>
                    <Text style={styles.statBoxLabel}>Cards</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxValue}>
                      {stats.sealedCount ?? 0}
                    </Text>
                    <Text style={styles.statBoxLabel}>Sealed</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxValue}>
                      {stats.gradedCount ?? 0}
                    </Text>
                    <Text style={styles.statBoxLabel}>Graded</Text>
                  </View>
                </View>

                {/* Price overview */}
                <View style={styles.statsRow}>
                  <View style={[styles.statBox, { flex: 1 }]}>
                    <Text style={styles.statBoxValue}>
                      {stats.avgPrice != null ? `€ ${stats.avgPrice}` : "—"}
                    </Text>
                    <Text style={styles.statBoxLabel}>Avg Card Price</Text>
                  </View>
                  <View style={[styles.statBox, { flex: 1 }]}>
                    <Text
                      style={[
                        styles.statBoxValue,
                        stats.totalTrend != null && stats.totalAvg != null
                          ? stats.totalTrend >= stats.totalAvg
                            ? styles.statPositive
                            : styles.statNegative
                          : null,
                      ]}
                    >
                      {stats.totalTrend != null && stats.totalAvg != null
                        ? `${stats.totalTrend >= stats.totalAvg ? "+" : ""}€ ${(stats.totalTrend - stats.totalAvg).toFixed(2)}`
                        : "—"}
                    </Text>
                    <Text style={styles.statBoxLabel}>Trend vs Avg</Text>
                  </View>
                </View>

                {/* Most expensive + Cheapest */}
                <Text style={styles.statsSectionLabel}>Highlights</Text>
                <View style={styles.statsRow}>
                  <View style={[styles.statCard, { flex: 1 }]}>
                    <Text style={styles.statCardHeader}>Most Expensive</Text>
                    {stats.mostExpensive ? (
                      <>
                        {stats.mostExpensive.image_url ? (
                          <Image
                            source={{ uri: stats.mostExpensive.image_url }}
                            style={styles.statCardImage}
                            resizeMode="cover"
                          />
                        ) : null}
                        <Text style={styles.statCardName} numberOfLines={2}>
                          {stats.mostExpensive.name}
                        </Text>
                        <Text style={styles.statCardPrice}>
                          € {stats.mostExpensive.price}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.statCardEmpty}>No data</Text>
                    )}
                  </View>
                  <View style={[styles.statCard, { flex: 1 }]}>
                    <Text style={styles.statCardHeader}>Cheapest</Text>
                    {stats.cheapest ? (
                      <>
                        {stats.cheapest.image_url ? (
                          <Image
                            source={{ uri: stats.cheapest.image_url }}
                            style={styles.statCardImage}
                            resizeMode="cover"
                          />
                        ) : null}
                        <Text style={styles.statCardName} numberOfLines={2}>
                          {stats.cheapest.name}
                        </Text>
                        <Text style={styles.statCardPrice}>
                          € {stats.cheapest.price}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.statCardEmpty}>No data</Text>
                    )}
                  </View>
                </View>

                {/* Foil ratio */}
                <Text style={styles.statsSectionLabel}>Foil Ratio</Text>
                <View style={styles.statCard}>
                  {stats.totalCards > 0 ? (
                    <>
                      <View style={styles.foilBarBg}>
                        <View
                          style={[
                            styles.foilBarFill,
                            {
                              width: `${Math.round((stats.foilCount / stats.totalCards) * 100)}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.foilLabel}>
                        {stats.foilCount} / {stats.totalCards} foil
                        {"  "}
                        <Text style={styles.statBoxValue}>
                          {Math.round(
                            (stats.foilCount / stats.totalCards) * 100,
                          )}
                          %
                        </Text>
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.statCardEmpty}>No data</Text>
                  )}
                </View>

                {/* Condition distribution */}
                <Text style={styles.statsSectionLabel}>Condition</Text>
                <View style={styles.statCard}>
                  {stats.conditionDistribution?.length > 0 ? (
                    stats.conditionDistribution.map((row) => {
                      const pct =
                        stats.totalCards > 0
                          ? Math.round((row.count / stats.totalCards) * 100)
                          : 0;
                      return (
                        <View key={row.condition} style={styles.conditionRow}>
                          <Text style={styles.conditionLabel}>
                            {row.condition || "Unknown"}
                          </Text>
                          <View style={styles.conditionBarBg}>
                            <View
                              style={[
                                styles.conditionBarFill,
                                { width: `${pct}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.conditionCount}>{row.count}</Text>
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.statCardEmpty}>No data</Text>
                  )}
                </View>
              </>
            )}
          </ScrollView>
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
      <AddItemModal
        visible={showAddCard}
        onClose={() => {
          setShowAddCard(false);
          getCards();
          getSealed();
          getGraded();
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
  emptyText: { color: "#9CA3AF", textAlign: "center", marginTop: 20 },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: Colors.borderDark,
  },
  listItemImage: { width: 44, height: 44, borderRadius: 6, marginRight: 10 },
  listItemLeft: { flex: 1 },
  listItemName: { color: Colors.textWhite, fontSize: 13, fontWeight: "500" },
  listItemSub: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  listItemRight: { alignItems: "flex-end" },
  listItemPrice: {
    color: Colors.primaryLight,
    fontSize: 14,
    fontWeight: "500",
  },
  listItemPriceSub: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  // Stats tab
  statsScroll: { paddingBottom: 24, paddingTop: 4 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  statsSectionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: Colors.borderDark,
  },
  statBoxValue: { color: Colors.textWhite, fontSize: 18, fontWeight: "600" },
  statBoxLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 4 },
  statPositive: { color: "#4ade80" },
  statNegative: { color: Colors.error },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 0.5,
    borderColor: Colors.borderDark,
    marginBottom: 8,
  },
  statCardHeader: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  statCardImage: {
    width: "100%",
    height: 80,
    borderRadius: 6,
    marginBottom: 6,
  },
  statCardName: { color: Colors.textWhite, fontSize: 12, fontWeight: "500" },
  statCardPrice: {
    color: Colors.primaryLight,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  statCardEmpty: { color: Colors.textMuted, fontSize: 12 },
  foilBarBg: {
    height: 8,
    backgroundColor: Colors.borderDark,
    borderRadius: 4,
    marginBottom: 6,
    overflow: "hidden",
  },
  foilBarFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  foilLabel: { color: Colors.textMuted, fontSize: 12 },
  conditionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  conditionLabel: { color: Colors.textMuted, fontSize: 11, width: 60 },
  conditionBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.borderDark,
    borderRadius: 3,
    overflow: "hidden",
  },
  conditionBarFill: {
    height: "100%",
    backgroundColor: Colors.primaryLight,
    borderRadius: 3,
  },
  conditionCount: {
    color: Colors.textWhite,
    fontSize: 11,
    width: 24,
    textAlign: "right",
  },
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
