import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SelectModal({
  label,
  value,
  options,
  onSelect,
  enabled = true,
}) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options
    .filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.label.localeCompare(b.label));

  const selectedLabel = options.find((o) => o.value === value)?.label || label;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.trigger, !enabled && styles.triggerDisabled]}
        onPress={() => enabled && setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {selectedLabel}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => {
            setVisible(false);
            setSearch("");
          }}
        >
          <View style={styles.sheet}>
            <Text style={styles.sheetLabel}>{label}</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                    setSearch("");
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Ionicons name="checkmark" size={18} color="#ff7b00" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A1A1A",
    borderWidth: 0.5,
    borderColor: "#444",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  triggerDisabled: {
    opacity: 0.4,
  },
  triggerText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  placeholder: {
    color: "#9CA3AF",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  sheet: {
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#444",
    maxHeight: 400,
    paddingVertical: 8,
  },
  sheetLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  optionSelected: {
    backgroundColor: "#1A1A1A",
  },
  optionText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  optionTextSelected: {
    color: "#ff7b00",
  },
  searchInput: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 10,
    color: "#FFFFFF",
    borderWidth: 0.5,
    borderColor: "#444",
  },
});
