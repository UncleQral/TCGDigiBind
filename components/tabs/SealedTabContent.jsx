import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useEffect, useState } from "react";
import {
  FlatList,
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

const getCMUrl = (gameName, cmExpansionId, searchString) => {
  const game = gameName?.replace(/\s+/g, "") || "Pokemon";
  return `https://www.cardmarket.com/en/${game}/Products/Search?searchMode=v2&idCategory=0&idExpansion=${cmExpansionId ?? 0}&searchString=${encodeURIComponent(searchString)}&idRarity=0&perSite=30`;
};

export default function SealedTabContent({
  binder,
  games,
  quantity,
  setQuantity,
  image,
  onImageChange,
  imageAspectRatio,
  onInsertSealed,
}) {
  const [expansions, setExpansions] = useState([]);
  const [selectedExpansionId, setSelectedExpansionId] = useState(null);
  const [sealedProducts, setSealedProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [pickSealed, setPickSealed] = useState(null);
  const [selectedGameId, setSelectedGameId] = useState(null);

  const hasBinderSet = !!binder?.binder_set;
  const selectedExpansion = expansions.find(
    (e) => e.id === selectedExpansionId,
  );

  useEffect(() => {
    if (!games?.length) return;
    const gameId = binder
      ? games.find((g) => g.name === binder.game)?.id
      : selectedGameId;
    if (!gameId) return;

    api
      .get(`/expansion/${gameId}`)
      .then((data) => {
        if (!Array.isArray(data)) return;
        setExpansions(data);
        if (hasBinderSet) {
          const match = data.find((e) => e.name === binder.binder_set);
          if (match) setSelectedExpansionId(match.id);
        }
      })
      .catch(() => {});
  }, [games, binder, selectedGameId]);

  useEffect(() => {
    if (!selectedExpansionId || !games?.length) return;
    const gameId = binder
      ? games.find((g) => g.name === binder.game)?.id
      : selectedGameId;
    if (!gameId) return;

    api
      .get(`/sealed?game_id=${gameId}&expansion_id=${selectedExpansionId}`)
      .then((data) => {
        if (Array.isArray(data)) setSealedProducts(data);
      })
      .catch(() => {});
  }, [selectedExpansionId]);

  const filtered = search.trim()
    ? sealedProducts.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      )
    : sealedProducts;

  return (
    <>
      <View style={styles.topRow}>
        <ImagePickerSection
          image={image}
          onImageChange={onImageChange}
          imageAspectRatio={imageAspectRatio}
        />

        <View style={styles.rightCol}>
          {!binder ? (
            <>
              <SelectModal
                label="Select Game..."
                value={selectedGameId}
                options={games.map((g) => ({ label: g.name, value: g.id }))}
                onSelect={setSelectedGameId}
              />
              <SelectModal
                label="Select Expansion..."
                value={selectedExpansionId}
                options={expansions.map((e) => ({
                  label: e.name,
                  value: e.id,
                }))}
                onSelect={setSelectedExpansionId}
                disabled={!selectedGameId}
              />
            </>
          ) : !hasBinderSet ? (
            <SelectModal
              label="Select Expansion..."
              value={selectedExpansionId}
              options={expansions.map((e) => ({ label: e.name, value: e.id }))}
              onSelect={setSelectedExpansionId}
            />
          ) : null}

          <BottomSheetTextInput
            style={styles.input}
            placeholder="Search product..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.quantityRow}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <BottomSheetTextInput
            style={styles.quantityInput}
            value={String(quantity)}
            onChangeText={(t) => {
              const cleaned = t.replace(/[^0-9]/g, "");
              if (cleaned === "") {
                setQuantity("");
              } else {
                setQuantity(parseInt(cleaned, 10));
              }
            }}
            onBlur={() => {
              if (!quantity || quantity === "") setQuantity(1);
            }}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        <TouchableOpacity
          style={styles.cmFooterBtn}
          onPress={() =>
            Linking.openURL(
              getCMUrl(
                binder?.game,
                selectedExpansion?.cm_expansion_id,
                search,
              ),
            )
          }
        >
          <Text style={styles.cmFooterBtnText}>Check on Cardmarket ↗</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.insertBtn, !pickSealed && styles.insertBtnDisabled]}
          onPress={() => {
            if (onInsertSealed) onInsertSealed(pickSealed, quantity);
          }}
          disabled={!pickSealed}
        >
          <Text style={styles.insertBtnText}>Insert Sealed</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const isSelected = pickSealed?.id === item.id;
          return (
            <View
              style={[
                styles.resultItem,
                isSelected && styles.resultItemSelected,
              ]}
            >
              <View style={styles.resultHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultCategory}>
                    {item.category_name}
                  </Text>
                </View>
                <Text style={styles.resultPrice}>
                  € {item.trend_price ?? "-"}
                </Text>
              </View>

              <View style={styles.priceRow}>
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>Avg Sell</Text>
                  <Text style={styles.priceValue}>
                    € {item.avg_sell ?? "-"}
                  </Text>
                </View>
              </View>

              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={[
                    styles.selectBtn,
                    isSelected && styles.selectBtnActive,
                  ]}
                  onPress={() => setPickSealed(isSelected ? null : item)}
                >
                  <Text
                    style={[
                      styles.selectBtnText,
                      isSelected && styles.selectBtnTextActive,
                    ]}
                  >
                    {isSelected ? "✓ Ausgewählt" : "Select"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          selectedExpansionId ? (
            <Text style={styles.empty}>No products found</Text>
          ) : null
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", gap: 12, marginBottom: 12, paddingTop: 8 },
  rightCol: { flex: 1, gap: 8 },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
    color: Colors.textWhite,
    fontSize: 13,
    alignSelf: "flex-start",
    width: "100%",
  },
  resultItem: {
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: Colors.borderDark,
  },
  resultItemSelected: { borderColor: Colors.primary, borderWidth: 1 },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  resultName: { color: Colors.textWhite, fontSize: 13, fontWeight: "500" },
  resultCategory: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  resultPrice: { color: Colors.primaryLight, fontSize: 14, fontWeight: "500" },
  priceRow: { flexDirection: "row", gap: 6, marginBottom: 8 },
  priceBox: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 6,
    padding: 6,
    alignItems: "center",
  },
  priceLabel: { color: Colors.textMuted, fontSize: 10 },
  priceValue: { color: Colors.textWhite, fontSize: 12 },
  resultActions: { flexDirection: "row", gap: 8 },
  selectBtn: {
    flex: 1,
    backgroundColor: Colors.borderDark,
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
  },
  selectBtnActive: { backgroundColor: Colors.primary },
  selectBtnText: { color: Colors.textMuted, fontSize: 12 },
  selectBtnTextActive: { color: Colors.textWhite, fontWeight: "500" },
  empty: {
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 12,
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
  cmFooterBtn: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  cmFooterBtnText: { color: Colors.textMuted, fontSize: 13 },
  insertBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  insertBtnDisabled: { backgroundColor: Colors.border },
  insertBtnText: { color: Colors.textWhite, fontWeight: "500", fontSize: 15 },
});
