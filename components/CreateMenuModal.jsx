import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import BottomSheet, {
    BottomSheetView,
    useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Colors } from "../constants/theme";
import renderBackdrop from "../utils/renderBackdrop";
import AddItemModal from "./AddItemModal";

const springConfigs = {
  damping: 80,
  overshootClamping: true,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
  stiffness: 500,
};

export default function CreateMenuModal({ visible, onClose, onCreateBinder, onAddItem }) {
  const animationConfigs = useBottomSheetSpringConfigs(springConfigs);
  const router = useRouter();
  const bottomSheetRef = useRef(null);

  const [showAddItemModal, setAddItemModal] = useState(false);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={["40%"]}
      onClose={onClose}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: Colors.surface }}
      handleIndicatorStyle={{ backgroundColor: Colors.primary }}
      animationConfigs={animationConfigs}
    >
      <BottomSheetView style={{ paddingBottom: 16 }}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.btn}
            onPress={onCreateBinder}
          >
            <View style={styles.iconBtn}>
              <MaterialCommunityIcons
                name="book-open-page-variant-outline"
                size={24}
                color={Colors.primary}
              />
            </View>
            <View style={styles.textBtn}>
              <Text style={styles.titleBtn}>Create Binder</Text>
              <Text style={styles.subtitleBtn}>
                Organize cards, sealed products & graded cards in one collecion
              </Text>
            </View>
            <View style={styles.arrowBtn}>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color={Colors.primary}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { marginBottom: 16 }]}
            onPress={onAddItem}
          >
            <View style={styles.iconBtn}>
              <MaterialCommunityIcons
                name="cards-outline"
                size={24}
                color={Colors.primary}
              />
            </View>
            <View style={styles.textBtn}>
              <Text style={styles.titleBtn}>Add Single Item</Text>
              <Text style={styles.subtitleBtn}>
                Quickly add a card, sealed product & graded card
              </Text>
            </View>
            <View style={styles.arrowBtn}>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color={Colors.primary}
              />
            </View>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
const styles = StyleSheet.create({
  container: { backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.borderDark,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: "500",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 20,
    margin: 16,
    marginBottom: 0,
    borderWidth: 0.5,
    borderColor: Colors.border,
    gap: 16,
  },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.borderDark,
    alignItems: "center",
    justifyContent: "center",
  },
  textBtn: { flex: 1 },
  titleBtn: {
    color: Colors.textWhite,
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  subtitleBtn: { color: Colors.textMuted, fontSize: 12 },
  arrowBtn: { paddingLeft: 8 },
});
