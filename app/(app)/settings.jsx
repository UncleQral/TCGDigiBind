import Ionicons from "@expo/vector-icons/Ionicons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import ColorPicker, {
    BrightnessSlider,
    HueSlider,
    Preview,
    SaturationSlider,
} from "reanimated-color-picker";
import { Colors } from "../../constants/theme";
import { useSetting } from "../../context/SettingsContext";
import { api } from "../../utils/api";

export default function SettingsScreen() {
  const [pickedGame, setPickedGame] = useState("");
  const [colorModalOpen, setColorModalOpen] = useState(false);

  const { tagColors, updateTagColor } = useSetting();
  const [games, setGames] = useState([]);

  const router = useRouter();
  const bottomSheetRef = useRef(null);

  const getGames = async () => {
    try {
      const data = await api.get("/game");
      setGames(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getGames();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Game Tag Colors</Text>
      </View>

      <FlatList
        style={styles.gameList}
        contentContainerStyle={{ paddingBottom: 80 }}
        data={games}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const color =
            tagColors.find((tc) => tc.game_id === item.id)?.color ||
            Colors.primary;
          return (
            <TouchableOpacity
              style={styles.gameItem}
              onPress={() => {
                setPickedGame(item);
                setColorModalOpen(true);
              }}
            >
              <Text style={styles.gameName}>{item.name}</Text>
              <View style={[styles.colorCircle, { backgroundColor: color }]} />
            </TouchableOpacity>
          );
        }}
      />
      <BottomSheet
        ref={bottomSheetRef}
        index={colorModalOpen ? 0 : -1}
        snapPoints={["60%"]}
        onClose={() => setColorModalOpen(false)}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: Colors.surface }}
        handleIndicatorStyle={{ backgroundColor: Colors.primary }}
      >
        <BottomSheetView style={{ padding: 20 }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{pickedGame?.name}</Text>
            <View
              style={[
                styles.previewTag,
                {
                  backgroundColor:
                    tagColors.find((tc) => tc.game_id === pickedGame?.id)
                      ?.color || Colors.primary,
                },
              ]}
            >
              <Text style={styles.previewTagText}>{pickedGame?.name}</Text>
            </View>
          </View>

          <ColorPicker
            value={
              tagColors.find((tc) => tc.game_id === pickedGame?.id)?.color ||
              Colors.primary
            }
            onComplete={({ hex }) => updateTagColor(pickedGame?.id, hex)}
          >
            <Preview />
            <HueSlider style={{ marginTop: 16 }} />
            <SaturationSlider style={{ marginTop: 12 }} />
            <BrightnessSlider style={{ marginTop: 12 }} />
          </ColorPicker>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => setColorModalOpen(false)}
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.borderDark,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: "500",
  },
  gameList: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  gameItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  gameName: { color: Colors.textWhite, fontSize: 14 },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { color: Colors.textWhite, fontSize: 16, fontWeight: "500" },
  previewTag: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  previewTagText: { color: Colors.textWhite, fontSize: 12, fontWeight: "500" },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnText: { color: Colors.textWhite, fontWeight: "500", fontSize: 15 },
});
