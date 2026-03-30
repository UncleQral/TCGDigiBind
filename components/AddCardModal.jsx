import BottomSheet, {
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../utils/api";
import SelectModal from "./SelectModal";

export default function AddCardModal({ visible, onClose, binder }) {
  const [cardName, setCardName] = useState("");
  const [image, setImage] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [pickCard, setPickCard] = useState("");
  const [games, setGames] = useState([]);
  const bottomSheetRef = useRef(null);
  const [rarities, setRarities] = useState([]);
  const [selectedRarity, setSelectedRarity] = useState(null);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  useEffect(() => {
    const loadGames = async () => {
      const data = await api.get("/game");
      setGames(data);
    };
    loadGames();
  }, []);

  useEffect(() => {
    const loadRarities = async () => {
      if (!binder?.game) return;
      const gameObj = games.find((g) => g.name === binder.game);
      if (!gameObj) return;
      const data = await api.get(`/rarity/${gameObj.id}`);
      setRarities(data);
    };
    loadRarities();
  }, [games, binder]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const searchCard = async () => {
    console.log("Game loaded: ", games);
    console.log("Binder game:", binder?.game);

    try {
      const params = new URLSearchParams();
      const gameObj = games.find((g) => g.name === binder?.game);
      console.log("GameObj found:", gameObj);
      if (gameObj) params.append("game_id", gameObj.id);
      if (cardName) params.append("name", cardName);
      //if (binder?.binder_set) params.append("expansion_id", binder.binder_set);

      console.log("Search params: ", params.toString());
      const data = await api.get(`/card/search?${params.toString()}`);
      console.log("Search results: ", data);

      setSearchResults(data);
    } catch (err) {
      console.log("searchCard error:", err);
    }
  };

  const handleAddCard = async () => {
    try {
      await api.post("/binder_card", {
        binder_id: binder.id,
        card_id: pickCard,
        quantity: 1,
        foil: false,
        status: "owned",
      });
      onClose();
      setCardName("");
      setImage(null);
      setSearchResults([]);
      setPickCard("");
    } catch (err) {
      console.log("handleAddCard error:", err);
    }
  };

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
      <BottomSheetView style={styles.container}>
        {/* Photo + Inputs side by side */}
        <View style={styles.topRow}>
          {/* Photo left */}
          <View style={styles.imageContainer}>
            <TouchableOpacity
              style={styles.imagePlaceholder}
              onPress={pickImage}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.cardImage} />
              ) : (
                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: 11,
                    textAlign: "center",
                  }}
                >
                  Galery
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraBtn} onPress={takePhoto}>
              <Text
                style={{ color: "#ff7b00", fontSize: 11, textAlign: "center" }}
              >
                Camera
              </Text>
            </TouchableOpacity>
          </View>

          {/* Inputs rechts */}
          <View style={styles.inputContainer}>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyLabel}>Game</Text>
              <Text style={styles.readOnlyValue}>{binder?.game || "-"}</Text>
            </View>

            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyLabel}>Set</Text>
              <Text style={styles.readOnlyValue}>
                {binder?.binder_set || "-"}
              </Text>
            </View>

            <SelectModal
              label="Select Rarity..."
              value={selectedRarity}
              options={rarities.map((r) => ({ label: r.name, value: r.id }))}
              onSelect={(val) => setSelectedRarity(val)}
            />

            <BottomSheetTextInput
              style={styles.input}
              placeholder="Cardname..."
              placeholderTextColor="#9CA3AF"
              value={cardName}
              onChangeText={(text) => {
                setCardName(text);
                if (text.length >= 2) searchCard();
              }}
            />
          </View>
        </View>

        {/* Suchergebnisse */}
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.card_id.toString()}
          style={styles.resultsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.resultItem,
                pickCard === item.card_id && styles.resultItemSelected,
              ]}
              onPress={() => setPickCard(item.card_id)}
            >
              <Text style={styles.resultName}>{item.name}</Text>
              <Text style={styles.resultSet}>{item.expansion_name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text
              style={{ color: "#9CA3AF", textAlign: "center", marginTop: 12 }}
            >
              {cardName ? "No Card found" : "Cardname..."}
            </Text>
          }
        />

        {/* Add Button */}
        <TouchableOpacity
          style={[styles.addBtn, !pickCard && styles.addBtnDisabled]}
          onPress={handleAddCard}
          disabled={!pickCard}
        >
          <Text style={styles.addBtnText}>Insert Card</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  topRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  imageContainer: { width: 90, gap: 8 },
  imagePlaceholder: {
    width: 90,
    height: 90,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ff7b00",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: { width: 90, height: 90, borderRadius: 12 },
  cameraBtn: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 6,
    borderWidth: 0.5,
    borderColor: "#ff7b00",
    alignItems: "center",
  },
  inputContainer: { flex: 1, gap: 8 },
  readOnlyField: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 10,
    borderWidth: 0.5,
    borderColor: "#333",
  },
  readOnlyLabel: { color: "#9CA3AF", fontSize: 10, marginBottom: 2 },
  readOnlyValue: { color: "#fff", fontSize: 13 },
  input: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 10,
    borderWidth: 0.5,
    borderColor: "#444",
    color: "#fff",
    fontSize: 13,
  },
  resultsList: { flex: 1, marginBottom: 12 },
  resultItem: {
    padding: 12,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: "#333",
  },
  resultItemSelected: { borderColor: "#ff7b00", borderWidth: 1 },
  resultName: { color: "#fff", fontSize: 13, fontWeight: "500" },
  resultSet: { color: "#9CA3AF", fontSize: 11, marginTop: 2 },
  addBtn: {
    backgroundColor: "#ff7b00",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  addBtnDisabled: { backgroundColor: "#555" },
  addBtnText: { color: "#fff", fontWeight: "500", fontSize: 15 },
});
