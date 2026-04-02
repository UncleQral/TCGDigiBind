import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet, {
    BottomSheetTextInput,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../utils/api";

export default function EditCardModal({ visible, onClose, item }) {
  const [activeTab, setActiveTab] = useState("card");
  const [customName, setCustomName] = useState("");
  const [image, setImage] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(3 / 4);

  const bottomSheetRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        bottomSheetRef.current?.snapToIndex(0);
      }, 100);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const applyImage = (uri) => {
    setImage(uri);
    Image.getSize(uri, (w, h) => setAspectRatio(w > h ? 4 / 3 : 3 / 4));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) applyImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) applyImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    try {
      await api.put("/binder_card", {
        id: item.id,
        custom_name: customName || null,
        image_url: image || item.image_url,
        condition_of_card: item.condition_of_card,
        status: item.status,
        foil: item.foil,
      });
      onClose();
    } catch (err) {
      console.log("handleSave error:", err);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["85%"]}
      onClose={onClose}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: "#2A2A2A" }}
      handleIndicatorStyle={{ backgroundColor: "#ff7b00" }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "card" && styles.activeTab]}
            onPress={() => setActiveTab("card")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "card" && styles.activeTabText,
              ]}
            >
              Card
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

        {/* Content */}
        {activeTab === "card" ? (
          <View style={styles.cardTab}>
            {/* Bild */}
            <View style={[styles.imageContainer, { aspectRatio }]}>
              {image || item?.image_url ? (
                <Image
                  source={{ uri: image || item?.image_url }}
                  style={styles.cardImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialCommunityIcons
                    name="image-off-outline"
                    size={32}
                    color="#9CA3AF"
                  />
                  <Text style={styles.imagePlaceholderText}>
                    Tap to add image
                  </Text>
                </View>
              )}
            </View>

            {/* Image source buttons */}
            <View style={styles.imageSourceRow}>
              <TouchableOpacity style={styles.imageSourceBtn} onPress={pickImage}>
                <Text style={styles.imageSourceBtnText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageSourceBtn} onPress={takePhoto}>
                <Text style={styles.imageSourceBtnText}>Camera</Text>
              </TouchableOpacity>
            </View>

            {/* Name */}
            <BottomSheetTextInput
              style={styles.input}
              placeholder={
                item?.custom_name || item?.name?.split("[")[0].trim()
              }
              placeholderTextColor="#9CA3AF"
              value={customName}
              onChangeText={setCustomName}
            />

            {/* Save Button */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statsTab}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Trend</Text>
              <Text style={styles.statValue}>€ {item?.trend_price ?? "-"}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>1 Day</Text>
              <Text style={styles.statValue}>€ {item?.avg1 ?? "-"}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>7 Days</Text>
              <Text style={styles.statValue}>€ {item?.avg7 ?? "-"}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>30 Days</Text>
              <Text style={styles.statValue}>€ {item?.avg30 ?? "-"}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Avg Sell</Text>
              <Text style={styles.statValue}>€ {item?.avg_sell ?? "-"}</Text>
            </View>
          </View>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#1A1A1A",
  },
  activeTab: {
    backgroundColor: "#ff7b00",
  },
  tabText: {
    color: "#9CA3AF",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },
  cardTab: { gap: 12 },
  imageSourceRow: { flexDirection: "row", gap: 8 },
  imageSourceBtn: { flex: 1, backgroundColor: "#1A1A1A", borderRadius: 8, padding: 10, alignItems: "center", borderWidth: 0.5, borderColor: "#444" },
  imageSourceBtnText: { color: "#9CA3AF", fontSize: 13 },
  imageContainer: {
    width: "100%",
    aspectRatio: 1.5,
    borderRadius: 12,
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: "100%" },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#444",
    borderStyle: "dashed",
    gap: 8,
  },
  imagePlaceholderText: { color: "#9CA3AF", fontSize: 12 },
  input: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 12,
    borderWidth: 0.5,
    borderColor: "#444",
    color: "#fff",
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: "#ff7b00",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "500", fontSize: 15 },
  statsTab: { gap: 12 },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 12,
    borderWidth: 0.5,
    borderColor: "#333",
  },
  statLabel: { color: "#9CA3AF", fontSize: 14 },
  statValue: { color: "#ffc300", fontSize: 14, fontWeight: "500" },
});
