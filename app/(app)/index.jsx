import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BinderEntity from "../../components/BinderCard";
import CreateBinderModal from "../../components/CreateBinderModal";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useRefresh } from "../../hooks/useRefresh";
import { api } from "../../utils/api";

export default function Homescreen() {
  const [binders, setBinders] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterActive, setFilterActive] = useState(false);
  const [showBinderModal, setShowBinderModal] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedBinders, setSelectedBinders] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const router = useRouter();

  const getBinders = useCallback(async () => {
    try {
      const data = await api.get("/binder");
      setBinders(data);
      const total = data.reduce(
        (sum, b) => sum + parseFloat(b.total_value || 0),
        0,
      );
      setTotalValue(total);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  }, []);

  const { refreshing, onRefresh } = useRefresh(getBinders);

  const handleLongPress = (id) => {
    setSelectionMode(true);
    setSelectedBinders([id]);
  };

  const handleSelect = (id) => {
    if (selectedBinders.includes(id)) {
      setSelectedBinders(selectedBinders.filter((b) => b !== id));
    } else {
      setSelectedBinders([...selectedBinders, id]);
    }
  };

  const handleDelete = async () => {
    try {
      await Promise.all(
        selectedBinders.map((id) => api.delete(`/binder/${id}`)),
      );
      setSelectionMode(false);
      setSelectedBinders([]);
      getBinders();
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  useEffect(() => {
    getBinders();
  }, []);

  useEffect(() => {
    if (selectedBinders.length === 0 && selectionMode) {
      setSelectionMode(false);
    }
  }, [selectedBinders]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>Total Value</Text>
          <Text style={styles.headerValue}>€ {totalValue.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.profileIcon}
          onPress={() => setProfileMenuOpen(true)}
        >
          <Ionicons
            name="person-circle-outline"
            size={38}
            color={Colors.primaryLight}
          />
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

      <FlatList
        style={styles.binderList}
        contentContainerStyle={{ paddingBottom: 80 }}
        data={binders}
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
          <BinderEntity
            item={item}
            onLongPress={() => handleLongPress(item.id)}
            onPress={() =>
              selectionMode
                ? handleSelect(item.id)
                : router.push(`/(app)/binderDetail/${item.id}`)
            }
            isSelected={selectedBinders.includes(item.id)}
          />
        )}
      />

      <View style={styles.bottomBar}>
        {selectionMode ? (
          <View style={styles.addContainer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setSelectionMode(false);
                setSelectedBinders([]);
              }}
            >
              <Text style={styles.optionText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color="#fff" />
              <Text style={styles.optionText}>
                Delete ({selectedBinders.length})
              </Text>
            </TouchableOpacity>
          </View>
        ) : showOptions ? (
          <View style={styles.addContainer}>
            <TouchableOpacity
              style={styles.productBinder}
              onPress={() => router.push("/(app)/createProduct")}
            >
              <Text style={styles.optionText}>Product Binder</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeAddBtn}
              onPress={() => setShowOptions(false)}
            >
              <Text style={styles.optionText}>x</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardBinder}
              onPress={() => {
                setShowOptions(false);
                setShowBinderModal(true);
              }}
            >
              <Text style={styles.optionText}>Card Binder</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowOptions(!showOptions)}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
      <CreateBinderModal
        visible={showBinderModal}
        onClose={() => {
          setShowBinderModal(false);
          getBinders();
        }}
      />
      {profileMenuOpen && (
        <TouchableOpacity
          style={styles.profileOverlay}
          activeOpacity={1}
          onPress={() => setProfileMenuOpen(false)}
        >
          <View style={styles.profileMenu}>
            <View style={styles.profileMenuHeader}>
              <Ionicons
                name="person-circle-outline"
                size={48}
                color={Colors.primaryLight}
              />
              <View>
                <Text style={styles.profileMenuUsername}>{user?.username}</Text>
                <Text style={styles.profileMenuEmail}>{user?.email}</Text>
              </View>
            </View>
            <View style={styles.profileMenuDivider} />
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => {
                setProfileMenuOpen(false);
                router.push("/(app)/settings");
              }}
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color={Colors.textWhite}
              />
              <Text style={styles.profileMenuItemText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => {
                setProfileMenuOpen(false);
                logout();
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={Colors.error} />
              <Text
                style={[styles.profileMenuItemText, { color: Colors.error }]}
              >
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
  },
  headerLabel: { color: Colors.textMuted, fontSize: 11 },
  headerValue: { color: Colors.primaryLight, fontSize: 20, fontWeight: "500" },
  profileIcon: {},
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
  binderList: { flex: 1, paddingHorizontal: 20 },
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
  addBtnText: { color: Colors.textWhite, fontSize: 20, fontWeight: "bold" },
  addContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  productBinder: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  closeAddBtn: {
    width: 44,
    height: 44,
    backgroundColor: Colors.borderDark,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  cardBinder: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  optionText: {
    color: Colors.textWhite,
    fontWeight: "500",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.borderDark,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: Colors.error,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginLeft: 10,
  },
  profileOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  profileMenu: {
    position: "absolute",
    top: 90,
    right: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    minWidth: 220,
    zIndex: 101,
    elevation: 8,
  },
  profileMenuHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  profileMenuUsername: {
    color: Colors.textWhite,
    fontSize: 15,
    fontWeight: "600",
  },
  profileMenuEmail: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  profileMenuDivider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  profileMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  profileMenuItemText: {
    color: Colors.textWhite,
    fontSize: 15,
  },
});
