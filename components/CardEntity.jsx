import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CardEntity({ item, onLongPress, isSelected }) {
  return (
    <TouchableOpacity style={styles.container} onLongPress={onLongPress}>
      <View style={styles.card}>
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
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    overflow: "hidden",
  },
  picBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#444",
  },
  pic: {
    width: "100%",
    aspectRatio: 0.71,
  },
  placeholder: {
    width: "100%",
    aspectRatio: 0.71,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    padding: 4,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "500",
  },
  value: {
    color: "#ffc300",
    fontSize: 9,
    marginTop: 2,
  },
});
