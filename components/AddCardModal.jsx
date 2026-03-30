import BottomSheet, {
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
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
  const [selectedRarityObj, setSelectedRarityObj] = useState(null);

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

  const searchCard = async (searchText) => {
    try {
      const params = new URLSearchParams();
      const gameObj = games.find((g) => g.name === binder?.game);
      console.log("searchText:", searchText);
      console.log("gameObj:", gameObj);
      console.log("binder.game:", binder?.game);
      if (gameObj) params.append("game_id", gameObj.id);
      if (searchText) params.append("name", searchText);

      console.log("URL:", `/card/search?${params.toString()}`);
      const data = await api.get(`/card/search?${params.toString()}`);
      console.log("Results:", data);
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

  const getCardmarketUrl = (item) => {
    const cardName = item.name.split("[")[0].trim();
    const gameObj = games.find((g) => g.name === binder?.game);
    const gameName = gameObj?.name?.replace(/\s+/g, "") || "Pokemon";

    let url = `https://www.cardmarket.com/en/${gameName}/Products/Singles?idExpansion=${item.cm_expansion_id}&searchString=${encodeURIComponent(cardName)}`;

    if (selectedRarityObj?.cm_rarity_id) {
      url += `&idRarity=${selectedRarityObj.cm_rarity_id}`;
    }

    return url;
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
              onSelect={(val) => {
                setSelectedRarity(val);
                const rarityObj = rarities.find((r) => r.id === val);
                setSelectedRarityObj(rarityObj);
              }}
            />

            <BottomSheetTextInput
              style={styles.input}
              placeholder="Cardname..."
              placeholderTextColor="#9CA3AF"
              value={cardName}
              onChangeText={(text) => {
                setCardName(text);
                searchCard(text);
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
            <View
              style={[
                styles.resultItem,
                pickCard === item.card_id && styles.resultItemSelected,
              ]}
            >
              <View style={styles.resultHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultSet}>{item.expansion_name}</Text>
                </View>
                <Text style={styles.resultPrice}>
                  € {item.trend_price ?? "-"}
                </Text>
              </View>

              <View style={styles.priceRow}>
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>1 Tag</Text>
                  <Text style={styles.priceValue}>€ {item.avg1 ?? "-"}</Text>
                </View>
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>7 Tage</Text>
                  <Text style={styles.priceValue}>€ {item.avg7 ?? "-"}</Text>
                </View>
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>30 Tage</Text>
                  <Text style={styles.priceValue}>€ {item.avg30 ?? "-"}</Text>
                </View>
              </View>

              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={styles.cmBtn}
                  onPress={() => Linking.openURL(getCardmarketUrl(item))}
                >
                  <Text style={styles.cmBtnText}>Auf CM ansehen ↗</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectBtn,
                    pickCard === item.card_id && styles.selectBtnActive,
                  ]}
                  onPress={() => setPickCard(item.card_id)}
                >
                  <Text
                    style={[
                      styles.selectBtnText,
                      pickCard === item.card_id && styles.selectBtnTextActive,
                    ]}
                  >
                    {pickCard === item.card_id ? "✓ Ausgewählt" : "Wählen"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  resultPrice: {
    color: "#ffc300",
    fontSize: 14,
    fontWeight: "500",
  },
  priceRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  priceBox: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 6,
    padding: 6,
    alignItems: "center",
  },
  priceLabel: {
    color: "#9CA3AF",
    fontSize: 10,
  },
  priceValue: {
    color: "#fff",
    fontSize: 12,
  },
  resultActions: {
    flexDirection: "row",
    gap: 8,
  },
  cmBtn: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderWidth: 0.5,
    borderColor: "#444",
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
  },
  cmBtnText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  selectBtn: {
    flex: 1,
    backgroundColor: "#333",
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
  },
  selectBtnActive: {
    backgroundColor: "#ff7b00",
  },
  selectBtnText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  selectBtnTextActive: {
    color: "#000",
    fontWeight: "500",
  },
});
