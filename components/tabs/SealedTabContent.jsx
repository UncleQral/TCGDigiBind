import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useEffect, useState } from "react";
import { FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/theme";
import { api } from "../../utils/api";
import ImagePickerSection from "../ImagePickerSection";
import SelectModal from "../SelectModal";

const getCMUrl = (gameName, productName) => {
  const game = gameName?.replace(/\s+/g, "") || "Pokemon";
  return `https://www.cardmarket.com/en/${game}/Products/Sealed-Products?searchString=${encodeURIComponent(productName)}`;
};

export default function SealedTabContent({ binder, games, image, onImageChange, imageAspectRatio }) {
  const [expansions, setExpansions] = useState([]);
  const [selectedExpansionId, setSelectedExpansionId] = useState(null);
  const [sealedProducts, setSealedProducts] = useState([]);
  const [search, setSearch] = useState("");

  const hasBinderSet = !!binder?.binder_set;

  useEffect(() => {
    if (!binder?.game || !games?.length) return;
    const gameObj = games.find((g) => g.name === binder.game);
    if (!gameObj) return;

    api
      .get(`/expansion/${gameObj.id}`)
      .then((data) => {
        if (!Array.isArray(data)) return;
        setExpansions(data);
        if (hasBinderSet) {
          const match = data.find((e) => e.name === binder.binder_set);
          if (match) setSelectedExpansionId(match.id);
        }
      })
      .catch(() => {});
  }, [games, binder]);

  useEffect(() => {
    if (!selectedExpansionId || !binder?.game || !games?.length) return;
    const gameObj = games.find((g) => g.name === binder.game);
    if (!gameObj) return;

    api
      .get(`/sealed?game_id=${gameObj.id}&expansion_id=${selectedExpansionId}`)
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
    <View style={styles.topRow}>
      <ImagePickerSection
        image={image}
        onImageChange={onImageChange}
        imageAspectRatio={imageAspectRatio}
      />

      <View style={styles.rightCol}>
      {!hasBinderSet && (
        <SelectModal
          label="Select Expansion..."
          value={selectedExpansionId}
          options={expansions.map((e) => ({ label: e.name, value: e.id }))}
          onSelect={setSelectedExpansionId}
        />
      )}

      <BottomSheetTextInput
        style={styles.input}
        placeholder="Search product..."
        placeholderTextColor="#9CA3AF"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <View style={styles.resultHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultCategory}>{item.category_name}</Text>
              </View>
              <Text style={styles.resultPrice}>
                € {item.trend_price ?? "-"}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Avg Sell</Text>
                <Text style={styles.priceValue}>€ {item.avg_sell ?? "-"}</Text>
              </View>
            </View>

            <View style={styles.resultActions}>
              <TouchableOpacity
                style={styles.selectBtn}
                onPress={() =>
                  Linking.openURL(getCMUrl(binder?.game, item.name))
                }
              >
                <Text style={styles.selectBtnText}>CM ↗</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.selectBtn}>
                <Text style={styles.selectBtnText}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          selectedExpansionId ? (
            <Text style={styles.empty}>No products found</Text>
          ) : null
        }
      />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", gap: 12, marginBottom: 16, paddingTop: 8 },
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
    width: "70%",
  },
  resultItem: {
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: Colors.borderDark,
  },
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
  selectBtnText: { color: Colors.textMuted, fontSize: 12 },
  empty: {
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 12,
    fontSize: 13,
  },
});
