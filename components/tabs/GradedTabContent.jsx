import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";
import { api } from "../../utils/api";
import ImagePickerSection from "../ImagePickerSection";
import SelectModal from "../SelectModal";

export default function GradedTabContent({
  cardName,
  setCardName,
  searchCard,
  gradingCompany,
  setGradingCompany,
  grade,
  setGrade,
  certNumber,
  setCertNumber,
  image,
  onImageChange,
  imageAspectRatio,
}) {
  const [gradingCompanies, setGradingCompanies] = useState([]);

  useEffect(() => {
    api
      .get("/grading_company")
      .then((data) => {
        if (Array.isArray(data)) setGradingCompanies(data);
      })
      .catch(() => {});
  }, []);

  return (
    <View style={styles.topRow}>
      <ImagePickerSection
        image={image}
        onImageChange={onImageChange}
        imageAspectRatio={imageAspectRatio}
      />

      <View style={styles.container}>
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
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", gap: 12, marginBottom: 16, paddingTop: 8 },
  container: { flex: 1, gap: 8 },
  row: { flexDirection: "row", gap: 8 },
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
