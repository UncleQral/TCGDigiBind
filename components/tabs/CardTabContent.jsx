import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useEffect, useState } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";
import { api } from "../../utils/api";
import ImagePickerSection from "../ImagePickerSection";
import SelectModal from "../SelectModal";

export default function CardTabContent({
  binder,
  rarities,
  selectedRarity,
  setSelectedRarity,
  setSelectedRarityObj,
  selectedRarityObj,
  cardName,
  setCardName,
  searchCard,
  handleAddCard,
  pickCard,
  binderExpansion,
  games,
  quantity,
  setQuantity,
  image,
  onImageChange,
  imageAspectRatio,
}) {
  const buildCMUrl = (withRarity) => {
    const gameObj = games.find((g) => g.name === binder?.game);
    const gameName = gameObj?.name?.replace(/\s+/g, "") || "Pokemon";
    const expansionId = binderExpansion?.cm_expansion_id ?? "";
    const rarityId = withRarity ? (selectedRarityObj?.cm_rarity_id ?? "") : "";
    const name = encodeURIComponent(cardName.trim());
    return `https://www.cardmarket.com/en/${gameName}/Products/Singles?searchMode=v2&idCategory=51&idExpansion=${expansionId}&idRarity=${rarityId}&searchString=${name}`;
  };
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedExpansion, setSelectedExpansion] = useState("");
  const [expansions, setExpansions] = useState([]);

  useEffect(() => {
    if (!selectedGame) return;
    api.get(`/expansion/${selectedGame}`).then((data) => {
      if (Array.isArray(data)) setExpansions(data);
    });
  }, [selectedGame]);

  return (
    <>
      <View style={styles.topRow}>
        <ImagePickerSection
          image={image}
          onImageChange={onImageChange}
          imageAspectRatio={imageAspectRatio}
        />

        <View style={styles.inputContainer}>
          {binder ? (
            <>
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
            </>
          ) : (
            <>
              <SelectModal
                label="Select Game..."
                value={selectedGame}
                options={games.map((g) => ({ label: g.name, value: g.id }))}
                onSelect={(val) => {
                  setSelectedGame(val);
                }}
              />
              <SelectModal
                label="Select Set..."
                value={selectedExpansion}
                options={expansions.map((e) => ({
                  label: e.name,
                  value: e.id,
                }))}
                onSelect={(val) => {
                  setSelectedExpansion(val);
                }}
              />
            </>
          )}

          <SelectModal
            label="Select Rarity..."
            value={selectedRarity}
            options={rarities.map((r) => ({ label: r.name, value: r.id }))}
            onSelect={(val) => {
              setSelectedRarity(val);
              setSelectedRarityObj(rarities.find((r) => r.id === val));
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

      <View style={styles.footer}>
        <View style={styles.quantityRow}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <BottomSheetTextInput
            style={styles.quantityInput}
            value={String(quantity)}
            onChangeText={(t) => setQuantity(Number(t.replace(/[^0-9]/g, "")) || 1)}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        <TouchableOpacity
          style={styles.cmBtn}
          onPress={() => Linking.openURL(buildCMUrl(true))}
        >
          <Text style={styles.cmBtnText}>Check on Cardmarket ↗</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cmBtn}
          onPress={() => Linking.openURL(buildCMUrl(false))}
        >
          <Text style={styles.cmBtnText}>Check without Rarity ↗</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addBtn, !pickCard && styles.addBtnDisabled]}
          onPress={handleAddCard}
          disabled={!pickCard}
        >
          <Text style={styles.addBtnText}>Insert Card</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", gap: 12, marginBottom: 16, paddingTop: 8 },
  inputContainer: { flex: 1, gap: 8 },
  readOnlyField: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    borderWidth: 0.5,
    borderColor: Colors.borderDark,
  },
  readOnlyLabel: { color: Colors.textMuted, fontSize: 10, marginBottom: 2 },
  readOnlyValue: { color: Colors.textWhite, fontSize: 13 },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
    color: Colors.textWhite,
    fontSize: 13,
  },
  footer: { gap: 8, paddingVertical: 12 },
  quantityRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  quantityLabel: { color: Colors.textMuted, fontSize: 13, flex: 1 },
  quantityInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 8,
    borderWidth: 0.5,
    borderColor: Colors.border,
    color: Colors.textWhite,
    fontSize: 13,
    width: 64,
    textAlign: "center",
  },
  cmBtn: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  cmBtnText: { color: Colors.textMuted, fontSize: 13 },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  addBtnDisabled: { backgroundColor: Colors.border },
  addBtnText: { color: Colors.textWhite, fontWeight: "500", fontSize: 15 },
});
