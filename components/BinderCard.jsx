import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BinderEntity({ item }) {
  return (
    <TouchableOpacity>
      <View style={styles.container}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.binderImage}
        ></Image>

        <View style={styles.binderStat}>
          <Text style={styles.binderName}>{item.name}</Text>

          <View style={styles.binderTags}>
            <Text style={styles.binderGame}>{item.game}</Text>
            <Text style={styles.binderSet}>{item.binder_set}</Text>
          </View>
        </View>

        <Text style={styles.binderValue}>0,00 €</Text>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    gap: 12,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: "#333",
  },
  binderImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  binderStat: {
    flex: 1,
  },
  binderName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  binderTags: {
    flexDirection: "row",
    gap: 6,
  },
  binderGame: {
    color: "#ffc300",
    backgroundColor: "#333",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
    borderWidth: 0.5,
    borderColor: "#ff7b00",
  },
  binderSet: {
    color: "#9CA3AF",
    backgroundColor: "#333",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
    borderWidth: 0.5,
    borderColor: "#444",
  },
  binderValue: {
    color: "#ffc300",
    fontWeight: "500",
    fontSize: 14,
  },
});
