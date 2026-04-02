import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BinderEntity from "../../components/BinderCard";
import CreateBinderModal from "../../components/CreateBinderModal";
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

  const router = useRouter();

  const getBinders = async () => {
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
  };

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
        <TouchableOpacity style={styles.profileIcon}>
          <Ionicons name="person-circle-outline" size={38} color="#ff7b00" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A1A" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#2A2A2A",
    borderBottomWidth: 1,
    borderBottomColor: "#ff7b00",
  },
  headerLabel: { color: "#9CA3AF", fontSize: 11 },
  headerValue: { color: "#ffc300", fontSize: 20, fontWeight: "500" },
  profileIcon: {},
  searchBar: { flexDirection: "row", padding: 12, gap: 8 },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 8,
    gap: 8,
    borderWidth: 0.5,
    borderColor: "#444",
  },
  searchTool: { flex: 1, color: "#FFFFFF", fontSize: 14 },
  filterButton: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 8,
    borderWidth: 0.5,
    borderColor: "#ff7b00",
    justifyContent: "center",
  },
  binderList: { flex: 1, paddingHorizontal: 20 },
  bottomBar: {
    backgroundColor: "#2A2A2A",
    borderTopWidth: 1,
    borderTopColor: "#ff7b00",
    paddingHorizontal: 12,
    paddingVertical: 20,
    paddingBottom: 36,
    alignItems: "center",
  },
  addBtn: {
    backgroundColor: "#ff7b00",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 48,
  },
  addBtnText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  addContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#2A2A2A",
  },
  productBinder: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#ffc300",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  closeAddBtn: {
    width: 44,
    height: 44,
    backgroundColor: "#333",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  cardBinder: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#ffc300",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  optionText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#d00000",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginLeft: 10,
  },
});
