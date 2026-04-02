import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Keyboard,
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
  const [binderExpansion, setBinderExpansion] = useState(null);
  const [imageAspectRatio, setImageAspectRatio] = useState(3 / 4);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        bottomSheetRef.current?.snapToIndex(0);
      }, 100);
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

  useEffect(() => {
    const loadBinderExpansion = async () => {
      if (!binder?.binder_set || !binder?.game) return;
      const gameObj = games.find((g) => g.name === binder.game);
      if (!gameObj) return;
      const data = await api.get(`/expansion/${gameObj.id}`);
      const match = data.find((e) => e.name === binder.binder_set);
      setBinderExpansion(match || null);
    };
    loadBinderExpansion();
  }, [games, binder]);

  useEffect(() => {
    const sub = Keyboard.addListener("keyboardDidHide", () => {
      setTimeout(() => {
        if (visible) bottomSheetRef.current?.snapToIndex(0);
      }, 160);
    });
    return () => sub.remove();
  }, [visible]);

  const applyImage = (uri) => {
    setImage(uri);
    Image.getSize(uri, (w, h) => setImageAspectRatio(w > h ? 4 / 3 : 3 / 4));
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
      if (binderExpansion) {
        setSearchResults(
          data.filter(
            (c) => c.cm_expansion_id === binderExpansion.cm_expansion_id,
          ),
        );
      } else {
        setSearchResults(data);
      }
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
        image_url: image,
      });
      onClose();
      resetModal();
    } catch (err) {
      console.log("handleAddCard error:", err);
    }
  };
  const resetModal = () => {
    setCardName("");
    setImage(null);
    setSearchResults([]);
    setPickCard("");
    setSelectedRarity(null);
    setSelectedRarityObj(null);
  };

  const getCardmarketUrl = (item) => {
    const cardName = item.name.split("[")[0].trim();
    const gameObj = games.find((g) => g.name === binder?.game);
    const gameName = gameObj?.name?.replace(/\s+/g, "") || "Pokemon";
    const setName = item.expansion_name?.replace(/\s+/g, "-") || "";
    const expansionId =
      binder?.binder_set && binderExpansion
        ? binderExpansion.cm_expansion_id
        : item.cm_expansion_id;
    const rarityId = selectedRarityObj?.cm_rarity_id ?? "";

    return `https://www.cardmarket.com/en/${gameName}/Products/Singles/${setName}?searchMode=v2&idCategory=51&idExpansion=${expansionId}&idRarity=${rarityId}&searchString=${encodeURIComponent(cardName)}`;
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["75%"]}
      onClose={() => {
        onClose();
        resetModal();
      }}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: "#2A2A2A" }}
      handleIndicatorStyle={{ backgroundColor: "#ff7b00" }}
      keyboardBehavior="extend"
    >
      <BottomSheetFlatList
        data={searchResults}
        keyExtractor={(item) =>
          item.type === "separator" ? item.key : item.card_id.toString()
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.topRow}>
            {/* Photo left */}
            <View style={styles.imageContainer}>
              <TouchableOpacity
                style={[styles.imagePlaceholder, { aspectRatio: imageAspectRatio }]}
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
                  style={{
                    color: "#ff7b00",
                    fontSize: 11,
                    textAlign: "center",
                  }}
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
                options={rarities.map((r) => ({
                  label: r.name,
                  value: r.id,
                }))}
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
        }
        renderItem={({ item }) => {
          if (item.type === "separator") {
            return (
              <View style={styles.separator}>
                <Text style={styles.separatorText}>{item.label}</Text>
              </View>
            );
          }
          return (
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
          );
        }}
        ListEmptyComponent={
          <Text
            style={{ color: "#9CA3AF", textAlign: "center", marginTop: 12 }}
          >
            {cardName ? "No Card found" : "Cardname..."}
          </Text>
        }
        ListFooterComponent={
          <View style={styles.footerBtn}>
            <TouchableOpacity
              style={styles.cmFooterBtn}
              onPress={() => {
                const gameObj = games.find((g) => g.name === binder?.game);
                const gameName =
                  gameObj?.name?.replace(/\s+/g, "") || "Pokemon";
                const expansionId = binderExpansion?.cm_expansion_id ?? "";
                const rarityId = selectedRarityObj?.cm_rarity_id ?? "";
                const name = encodeURIComponent(cardName.trim());
                Linking.openURL(
                  `https://www.cardmarket.com/en/${gameName}/Products/Singles?searchMode=v2&idCategory=51&idExpansion=${expansionId}&idRarity=${rarityId}&searchString=${name}`,
                );
              }}
            >
              <Text style={styles.cmFooterBtnText}>Check on Cardmarket ↗</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cmFooterBtn}
              onPress={() => {
                const gameObj = games.find((g) => g.name === binder?.game);
                const gameName =
                  gameObj?.name?.replace(/\s+/g, "") || "Pokemon";
                const expansionId = binderExpansion?.cm_expansion_id ?? "";
                const name = encodeURIComponent(cardName.trim());
                Linking.openURL(
                  `https://www.cardmarket.com/en/${gameName}/Products/Singles?searchMode=v2&idCategory=51&idExpansion=${expansionId}&searchString=${name}`,
                );
              }}
            >
              <Text style={styles.cmFooterBtnText}>Check without Rarity ↗</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addBtn, !pickCard && styles.addBtnDisabled]}
              onPress={handleAddCard}
              disabled={!pickCard}
            >
              <Text style={styles.addBtnText}>Insert Card</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </BottomSheet>
  );
}
const styles = StyleSheet.create({
  listContent: { paddingHorizontal: 16, paddingBottom: 12 },
  footerBtn: { paddingVertical: 12, gap: 8 },
  cmFooterBtn: {
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#444",
  },
  cmFooterBtnText: { color: "#9CA3AF", fontSize: 13 },
  topRow: { flexDirection: "row", gap: 12, marginBottom: 16, paddingTop: 8 },
  imageContainer: { width: 90, gap: 8 },
  imagePlaceholder: {
    width: 90,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ff7b00",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: { width: 90, height: "100%", borderRadius: 12 },
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