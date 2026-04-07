import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/theme";

export default function CardEntity({ item, onLongPress, onPress, isSelected }) {
  return (
    <TouchableOpacity
      style={styles.container}
      onLongPress={onLongPress}
      onPress={onPress}
    >
      <View
        style={[
          styles.card,
          { borderColor: isSelected ? "#ff7b00" : "transparent" },
        ]}
      >
        <View style={styles.picBorder}>
          {item.image_url ? (
            <Image style={styles.pic} source={{ uri: item.image_url }} />
          ) : (
            <View style={styles.placeholder}>
              <MaterialCommunityIcons
                name="image-off-outline"
                size={20}
                color="#9CA3AF"
              />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>
            {item.custom_name || item.name.split("[")[0].trim()}
          </Text>

          <Text style={styles.value}>
            {item.trend_price ? `€ ${item.trend_price}` : "-"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "25%",
    padding: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1.5,
  },
  picBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  pic: {
    width: "100%",
    aspectRatio: 0.71,
  },
  placeholder: {
    width: "100%",
    aspectRatio: 0.71,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    padding: 4,
    backgroundColor: Colors.surface,
  },
  name: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: "500",
  },
  value: {
    color: Colors.primaryLight,
    fontSize: 11,
    marginTop: 2,
  },
});
