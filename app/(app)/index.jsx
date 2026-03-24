import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { api } from "../../utils/api";

export default function Homescreen() {
  const [binders, setBinders] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterActive, setFilterActive] = useState(false);

  const getBinders = async () => {
    try {
      const data = await api.get("/binder");
      setBinders(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };
  useEffect(() => {
    getBinders();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>Total Value</Text>
          <Text style={styles.headerValue}>€ 0,00</Text>
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
          <View>
            <Text>{item.name}</Text>
          </View>
        )}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowOptions(!showOptions)}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
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
});
