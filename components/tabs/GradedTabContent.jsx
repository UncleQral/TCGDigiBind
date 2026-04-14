import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";
import { api } from "../../utils/api";
import ImagePickerSection from "../ImagePickerSection";
import SelectModal from "../SelectModal";

export default function GradedTabContent({
  binder,
  games,
  cardName,
  setCardName,
  searchCard,
  gradingCompany,
  setGradingCompany,
  grade,
  setGrade,
  certNumber,
  setCertNumber,
  quantity,
  setQuantity,
  image,
  onImageChange,
  imageAspectRatio,
}) {
  const [gradingCompanies, setGradingCompanies] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [selectedExpansionId, setSelectedExpansionId] = useState(null);
  const [expansions, setExpansions] = useState([]);

  useEffect(() => {
    api
      .get("/grading_company")
      .then((data) => {
        if (Array.isArray(data)) setGradingCompanies(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedGameId) return;
    api
      .get(`/expansion/${selectedGameId}`)
      .then((data) => {
        if (Array.isArray(data)) setExpansions(data);
      })
      .catch(() => {});
  }, [selectedGameId]);

  return (
    <View style={styles.topRow}>
      <ImagePickerSection
        image={image}
        onImageChange={onImageChange}
        imageAspectRatio={imageAspectRatio}
      />

      <View style={styles.container}>
        {binder ? (
          <>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyLabel}>Game</Text>
              <Text style={styles.readOnlyValue}>{binder.game || "-"}</Text>
            </View>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyLabel}>Set</Text>
              <Text style={styles.readOnlyValue}>{binder.binder_set || "-"}</Text>
            </View>
          </>
        ) : (
          <>
            <SelectModal
              label="Select Game..."
              value={selectedGameId}
              options={(games ?? []).map((g) => ({ label: g.name, value: g.id }))}
              onSelect={(val) => {
                setSelectedGameId(val);
                setSelectedExpansionId(null);
                setExpansions([]);
              }}
            />
            <SelectModal
              label="Select Set..."
              value={selectedExpansionId}
              options={expansions.map((e) => ({ label: e.name, value: e.id }))}
              onSelect={setSelectedExpansionId}
              disabled={!selectedGameId}
            />
          </>
        )}

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

        <SelectModal
          label="Grading Company..."
          value={gradingCompany}
          options={gradingCompanies.map((c) => ({ label: c.name, value: c.id }))}
          onSelect={setGradingCompany}
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Grade</Text>
            <BottomSheetTextInput
              style={styles.input}
              placeholder="1 – 10"
              placeholderTextColor="#9CA3AF"
              value={grade}
              onChangeText={setGrade}
              keyboardType="decimal-pad"
              maxLength={4}
            />
          </View>

          <View style={styles.halfField}>
            <Text style={styles.label}>Cert Number</Text>
            <BottomSheetTextInput
              style={styles.input}
              placeholder="e.g. 12345678"
              placeholderTextColor="#9CA3AF"
              value={certNumber}
              onChangeText={setCertNumber}
              keyboardType="number-pad"
            />
          </View>
        </View>

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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", gap: 12, marginBottom: 16, paddingTop: 8 },
  container: { flex: 1, gap: 8 },
  readOnlyField: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    borderWidth: 0.5,
    borderColor: Colors.borderDark,
  },
  readOnlyLabel: { color: Colors.textMuted, fontSize: 10, marginBottom: 2 },
  readOnlyValue: { color: Colors.textWhite, fontSize: 13 },
  row: { flexDirection: "row", gap: 8 },
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
  halfField: { flex: 1, gap: 4 },
  label: { color: Colors.textMuted, fontSize: 10, paddingLeft: 2 },
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
