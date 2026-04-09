import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/theme";
import { useSetting } from "../context/SettingsContext";

export default function BinderEntity({
  item,
  onLongPress,
  onPress,
  isSelected,
}) {
  const { tagColors } = useSetting();

  const tagColor =
    (tagColors || []).find((tc) => tc.game_id == item.game_id)?.color ||
    Colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.container, isSelected && styles.selected]}
    >
      <View style={styles.container}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.binderImage}
        ></Image>

        <View style={styles.binderStat}>
          <Text style={styles.binderName}>{item.name}</Text>

          <View style={styles.binderTags}>
            <Text
              style={[
                styles.binderGame,
                {
                  color: tagColor,
                  borderColor: tagColor,
                  backgroundColor: tagColor + "22",
                },
              ]}
            >
              {item.game}
            </Text>
            <Text style={styles.binderSet}>{item.binder_set}</Text>
          </View>
        </View>

        <Text style={styles.binderValue}>
          {item?.total_value
            ? `€ ${parseFloat(item.total_value).toFixed(2)}`
            : "0,00 €"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    gap: 12,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: Colors.borderDark,
  },
  binderImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: Colors.borderDark,
  },
  binderStat: {
    flex: 1,
  },
  binderName: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  binderTags: {
    flexDirection: "row",
    gap: 6,
  },
  binderGame: {
    color: Colors.primaryLight,
    backgroundColor: Colors.borderDark,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
    borderWidth: 0.5,
    borderColor: Colors.primary,
  },
  binderSet: {
    color: Colors.textMuted,
    backgroundColor: Colors.borderDark,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  binderValue: {
    color: Colors.primaryLight,
    fontWeight: "500",
    fontSize: 14,
  },
  selected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
});
