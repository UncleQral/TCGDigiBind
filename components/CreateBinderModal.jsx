import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BottomSheet, {
    BottomSheetTextInput,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
    Image,
    Keyboard,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { api } from "../utils/api";
import SelectModal from "./SelectModal";

export default function BinderCreationModal({ visible, onClose }) {
  const [binderName, setBinderName] = useState("");
  const [binderGameId, setBinderGameId] = useState(null);
  const [binderSetId, setBinderSetId] = useState(null);
  const [binderPic, setBinderPic] = useState(null);
  const [games, setGames] = useState([]);
  const [expansions, setExpansions] = useState([]);
  const [orientation, setOrientation] = useState("portrait");
  const bottomSheetRef = useRef(null);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(0);
      api
        .get("/game")
        .then((data) => setGames(data))
        .catch(() => {});
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  useEffect(() => {
    if (binderGameId && binderGameId !== "other") {
      api
        .get(`/expansion/${binderGameId}`)
        .then((data) => setExpansions(data))
        .catch(() => setExpansions([]));
    } else {
      setExpansions([]);
    }
    setBinderSetId(null);
  }, [binderGameId]);

  const aspect = orientation === "portrait" ? [3, 4] : [4, 3];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect,
      quality: 1,
    });

    if (!result.canceled) {
      setBinderPic(result.assets[0].uri);
    }
  };
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect,
      quality: 1,
    });

    if (!result.canceled) {
      setBinderPic(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    console.log("handleCreate called!");
    console.log("Data: ", { binderName, binderGameId, binderSetId, binderPic });
    try {
      const selectedGame = games.find((g) => g.id === binderGameId);
      const selectedSet = expansions.find((e) => e.id === binderSetId);

      const data = await api.post("/binder", {
        name: binderName,
        game: binderGameId === "other" ? "Other" : (selectedGame?.name ?? null),
        binder_set:
          binderSetId === "other" ? "Other" : (selectedSet?.name ?? null),
        image_url: binderPic,
      });
      console.log("Response: ", data);
      onClose();
      setBinderName("");
      setBinderGameId(null);
      setBinderSetId(null);
      setBinderPic(null);
    } catch (err) {
      console.log("Binder Creation error: ", err);
      console.log("Error details: ", JSON.stringify(err));
    }
  };
  useEffect(() => {
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setTimeout(() => {
        bottomSheetRef.current?.snapToIndex(0);
      }, 160);
    });
    return () => hideSubscription.remove();
  }, []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={["75%"]}
      onClose={onClose}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: "#2A2A2A" }}
      handleIndicatorStyle={{ backgroundColor: "#ff7b00" }}
      keyboardBehavior="extend"
    >
      <BottomSheetView>
        <View style={styles.popupContainer}>
          <View style={{ gap: 6 }}>
            <View style={styles.orientationRow}>
              <TouchableOpacity
                style={[styles.orientationBtn, orientation === "portrait" && styles.orientationBtnActive]}
                onPress={() => setOrientation("portrait")}
              >
                <Text style={[styles.orientationBtnText, orientation === "portrait" && styles.orientationBtnTextActive]}>P</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.orientationBtn, orientation === "landscape" && styles.orientationBtnActive]}
                onPress={() => setOrientation("landscape")}
              >
                <Text style={[styles.orientationBtnText, orientation === "landscape" && styles.orientationBtnTextActive]}>L</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={pickImage}>
              {binderPic ? (
                <Image source={{ uri: binderPic }} style={styles.binderImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialIcons name="add-a-photo" size={28} color="#9CA3AF" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <BottomSheetTextInput
              style={styles.input}
              placeholder="Binder Name"
              placeholderTextColor="#9CA3AF"
              value={binderName}
              onChangeText={setBinderName}
            />

            <SelectModal
              label="Select Game..."
              value={binderGameId}
              options={[
                ...games.map((g) => ({ label: g.name, value: g.id })),
                { label: "Other", value: "other" },
              ]}
              onSelect={(val) => setBinderGameId(val)}
            />

            <SelectModal
              label="Select Set..."
              value={binderSetId}
              options={[
                ...expansions.map((e) => ({ label: e.name, value: e.id })),
                { label: "Other", value: "other" },
              ]}
              onSelect={(val) => setBinderSetId(val)}
              enabled={!!binderGameId}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
          <Text>Create</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
}
const styles = StyleSheet.create({
  orientationRow: { flexDirection: "row", gap: 4 },
  orientationBtn: { flex: 1, paddingVertical: 4, borderRadius: 6, backgroundColor: "#1A1A1A", borderWidth: 0.5, borderColor: "#444", alignItems: "center" },
  orientationBtnActive: { backgroundColor: "#ff7b00", borderColor: "#ff7b00" },
  orientationBtnText: { color: "#9CA3AF", fontSize: 11 },
  orientationBtnTextActive: { color: "#fff" },
  popupContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 16,
    alignItems: "flex-start",
  },
  binderImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#ff7b00",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  createBtn: {
    backgroundColor: "#ff7b00",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    margin: 20,
    marginTop: 0,
  },
  createBtnText: { color: "#fff", fontWeight: "500", fontSize: 15 },
  input: {
    backgroundColor: "#1A1A1A",
    borderWidth: 0.5,
    borderColor: "#444",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: "#FFFFFF",
  },
  pickerWrapper: {
    backgroundColor: "#1A1A1A",
    borderWidth: 0.5,
    borderColor: "#444",
    borderRadius: 8,
    marginBottom: 10,
    overflow: "hidden",
  },
  picker: {
    color: "#FFFFFF",
  },
});
