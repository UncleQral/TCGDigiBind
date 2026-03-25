import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { api } from "../utils/api";

export default function BinderCreationModal({ visible, onClose }) {
  const [binderName, setBinderName] = useState("");
  const [binderGame, setBinderGame] = useState("");
  const [binderSet, setBinderSet] = useState("");
  const [binderPic, setBinderPic] = useState(null);
  const bottomSheetRef = useRef(null);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

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
    try {
      const data = await api.post("/binder", {
        name: binderName,
        game: binderGame,
        binder_set: binderSet,
        image_url: binderPic,
      });
      console.log("Response: ", data);
      onClose();
    } catch (err) {
      console.log("Binder Creation error: ", err);
      console.log("Error details: ", JSON.stringify(err));
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={["50%"]}
      onClose={onClose}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: "#2A2A2A" }}
      handleIndicatorStyle={{ backgroundColor: "#ff7b00" }}
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
            <TextInput
              style={styles.input}
              placeholder="Binder Name"
              placeholderTextColor="#9CA3AF"
              value={binderName}
              onChangeText={setBinderName}
            />

            <TextInput
              style={styles.input}
              placeholder="Select Game..."
              placeholderTextColor="#9CA3AF"
              value={binderGame}
              onChangeText={setBinderGame}
            />

            <TextInput
              style={styles.input}
              placeholder="Select Set..."
              placeholderTextColor="#9CA3AF"
              value={binderSet}
              onChangeText={setBinderSet}
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
});
