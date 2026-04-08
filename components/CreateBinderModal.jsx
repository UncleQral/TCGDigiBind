import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BottomSheet, {
  BottomSheetTextInput,
  BottomSheetView,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageCropPicker from "react-native-image-crop-picker";
import { Colors } from "../constants/theme";
import { api } from "../utils/api";
import renderBackdrop from "../utils/renderBackdrop";
import SelectModal from "./SelectModal";

const springConfigs = {
  damping: 80,
  overshootClamping: true,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
  stiffness: 500,
};

export default function BinderCreationModal({ visible, onClose }) {
  const animationConfigs = useBottomSheetSpringConfigs(springConfigs);
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

  const pickImage = async () => {
    try {
      const result = await ImageCropPicker.openPicker({
        width: 400,
        height: 300,
        cropping: true,
        freeStyleCropEnabled: true,
      });
      setBinderPic(result.path);
    } catch (_) {}
  };
  const takePhoto = async () => {
    try {
      const result = await ImageCropPicker.openCamera({
        width: 400,
        height: 300,
        cropping: true,
        freeStyleCropEnabled: true,
      });
      setBinderPic(result.path);
    } catch (_) {}
  };

  const handleCreate = async () => {
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
      onClose();
      setBinderName("");
      setBinderGameId(null);
      setBinderSetId(null);
      setBinderPic(null);
    } catch (err) {
      console.log("Binder Creation error: ", err);
    }
  };
  useEffect(() => {
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setTimeout(() => {
        if (visible) bottomSheetRef.current?.snapToIndex(0);
      }, 160);
    });
    return () => hideSubscription.remove();
  }, [visible]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={["75%"]}
      onClose={onClose}
      enablePanDownToClose
      animateOnMount
      animationConfigs={animationConfigs}
      backdropComponent={renderBackdrop}
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
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  createBtn: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    margin: 20,
    marginTop: 0,
  },
  createBtnText: { color: Colors.textWhite, fontWeight: "500", fontSize: 15 },
  input: {
    backgroundColor: Colors.inputBg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: Colors.textWhite,
  },
  pickerWrapper: {
    backgroundColor: Colors.inputBg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: 8,
    marginBottom: 10,
    overflow: "hidden",
  },
  picker: {
    color: Colors.textWhite,
  },
});
