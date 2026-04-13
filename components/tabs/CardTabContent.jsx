import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";
import ImagePickerSection from "../ImagePickerSection";
import SelectModal from "../SelectModal";

export default function CardTabContent({
  binder,
  rarities,
  selectedRarity,
  setSelectedRarity,
  setSelectedRarityObj,
  cardName,
  setCardName,
  searchCard,
  image,
  onImageChange,
  imageAspectRatio,
}) {
  return (
    <View style={styles.topRow}>
      <ImagePickerSection
        image={image}
        onImageChange={onImageChange}
        imageAspectRatio={imageAspectRatio}
      />

      <View style={styles.inputContainer}>
        <View style={styles.readOnlyField}>
          <Text style={styles.readOnlyLabel}>Game</Text>
          <Text style={styles.readOnlyValue}>{binder?.game || "-"}</Text>
        </View>

        <View style={styles.readOnlyField}>
          <Text style={styles.readOnlyLabel}>Set</Text>
          <Text style={styles.readOnlyValue}>{binder?.binder_set || "-"}</Text>
        </View>

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
});
