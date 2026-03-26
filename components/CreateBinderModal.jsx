import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BottomSheet, {
    BottomSheetTextInput,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Picker } from "@react-native-picker/picker";
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

export default function BinderCreationModal({ visible, onClose }) {
  const [binderName, setBinderName] = useState("");
  const [binderGameId, setBinderGameId] = useState(null);
  const [binderSetId, setBinderSetId] = useState(null);
  const [binderPic, setBinderPic] = useState(null);
  const [games, setGames] = useState([]);
  const [expansions, setExpansions] = useState([]);
  const bottomSheetRef = useRef(null);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(0);
      api.get("/game").then((data) => setGames(data)).catch(() => {});
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  useEffect(() => {
    if (binderGameId && binderGameId !== "other") {
      api.get(`/expansion/${binderGameId}`)
        .then((data) => setExpansions(data))
        .catch(() => setExpansions([]));
    } else {
      setExpansions([]);
    }
    setBinderSetId(null);
  }, [binderGameId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setBinderPic(result.assets[0].uri);
    }
  };
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setBinderPic(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    console.log("handleCreate called!");
    console.log("Data: ", { binderName, binderGame, binderSet, binderPic });
    console.log("Sending:", { binderName, binderGame, binderSet, binderPic });
    try {
      const selectedGame = games.find((g) => g.id === binderGameId);
      const selectedSet = expansions.find((e) => e.id === binderSetId);

      const data = await api.post("/binder", {
        name: binderName,
        game: binderGameId === "other" ? "Other" : selectedGame?.name ?? null,
        binder_set: binderSetId === "other" ? "Other" : selectedSet?.name ?? null,
        image_url: binderPic,
      });
      console.log("Response: ", data);
      onClose();
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
          <TouchableOpacity onPress={pickImage}>
            {binderPic ? (
              <Image source={{ uri: binderPic }} style={styles.binderImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="add-a-photo" size={28} color="#9CA3AF" />
              </View>
            )}
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <BottomSheetTextInput
              style={styles.input}
              placeholder="Binder Name"
              placeholderTextColor="#9CA3AF"
              value={binderName}
              onChangeText={setBinderName}
            />

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={binderGameId}
                onValueChange={(val) => setBinderGameId(val)}
                style={styles.picker}
                dropdownIconColor="#9CA3AF"
              >
                <Picker.Item label="Select Game..." value={null} color="#9CA3AF" />
                {games.map((g) => (
                  <Picker.Item key={g.id} label={g.name} value={g.id} color="#FFFFFF" />
                ))}
                <Picker.Item label="Other" value="other" color="#FFFFFF" />
              </Picker>
            </View>

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={binderSetId}
                onValueChange={(val) => setBinderSetId(val)}
                style={styles.picker}
                dropdownIconColor="#9CA3AF"
                enabled={!!binderGameId}
              >
                <Picker.Item label="Select Set..." value={null} color="#9CA3AF" />
                {expansions.map((e) => (
                  <Picker.Item key={e.id} label={e.name} value={e.id} color="#FFFFFF" />
                ))}
                <Picker.Item label="Other" value="other" color="#FFFFFF" />
              </Picker>
            </View>
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
