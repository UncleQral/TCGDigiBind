import { StyleSheet, Image, Text, TouchableOpacity, View } from "react-native";
import ImageCropPicker from "react-native-image-crop-picker";
import { Colors } from "../constants/theme";

export default function ImagePickerSection({ image, onImageChange, imageAspectRatio }) {
  const pickImage = async () => {
    try {
      const result = await ImageCropPicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        freeStyleCropEnabled: true,
      });
      onImageChange(result.path);
    } catch (_) {}
  };

  const takePhoto = async () => {
    try {
      const result = await ImageCropPicker.openCamera({
        width: 300,
        height: 400,
        cropping: true,
        freeStyleCropEnabled: true,
      });
      onImageChange(result.path);
    } catch (_) {}
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.imagePlaceholder, { aspectRatio: imageAspectRatio }]}
        onPress={pickImage}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>Gallery</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cameraBtn} onPress={takePhoto}>
        <Text style={styles.cameraBtnText}>Camera</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 90, gap: 8 },
  imagePlaceholder: {
    width: 90,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: 90, height: "100%", borderRadius: 12 },
  placeholderText: { color: "#9CA3AF", fontSize: 11, textAlign: "center" },
  cameraBtn: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 6,
    borderWidth: 0.5,
    borderColor: Colors.primary,
    alignItems: "center",
  },
  cameraBtnText: { color: Colors.primary, fontSize: 11, textAlign: "center" },
});
