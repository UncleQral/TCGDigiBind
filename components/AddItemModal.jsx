import BottomSheet, {
  BottomSheetFlatList,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/theme";
import { api } from "../utils/api";
import renderBackdrop from "../utils/renderBackdrop";
import CardTabContent from "./tabs/CardTabContent";
import GradedTabContent from "./tabs/GradedTabContent";
import SealedTabContent from "./tabs/SealedTabContent";

const springConfigs = {
  damping: 80,
  overshootClamping: true,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
  stiffness: 500,
};

export default function AddItemModal({ visible, onClose, binder }) {
  const animationConfigs = useBottomSheetSpringConfigs(springConfigs);
  const [cardName, setCardName] = useState("");
  const [image, setImage] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [pickCard, setPickCard] = useState("");
  const [games, setGames] = useState([]);
  const bottomSheetRef = useRef(null);
  const [rarities, setRarities] = useState([]);
  const [selectedRarity, setSelectedRarity] = useState(null);
  const [selectedRarityObj, setSelectedRarityObj] = useState(null);
  const [binderExpansion, setBinderExpansion] = useState(null);
  const [imageAspectRatio, setImageAspectRatio] = useState(3 / 4);
  const [activeTab, setActiveTab] = useState("card");
  const [gradingCompany, setGradingCompany] = useState(null);
  const [grade, setGrade] = useState("");
  const [certNumber, setCertNumber] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        bottomSheetRef.current?.snapToIndex(0);
      }, 100);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  useEffect(() => {
    const loadGames = async () => {
      const data = await api.get("/game");
      setGames(data);
    };
    loadGames();
  }, []);

  useEffect(() => {
    const loadRarities = async () => {
      if (!binder?.game) return;
      const gameObj = games.find((g) => g.name === binder.game);
      if (!gameObj) return;
      const data = await api.get(`/rarity/${gameObj.id}`);
      setRarities(data);
    };
    loadRarities();
  }, [games, binder]);

  useEffect(() => {
    const loadBinderExpansion = async () => {
      if (!binder?.binder_set || !binder?.game) return;
      const gameObj = games.find((g) => g.name === binder.game);
      if (!gameObj) return;
      const data = await api.get(`/expansion/${gameObj.id}`);
      const match = data.find((e) => e.name === binder.binder_set);
      setBinderExpansion(match || null);
    };
    loadBinderExpansion();
  }, [games, binder]);

  useEffect(() => {
    const sub = Keyboard.addListener("keyboardDidHide", () => {
      setTimeout(() => {
        if (visible) bottomSheetRef.current?.snapToIndex(0);
      }, 160);
    });
    return () => sub.remove();
  }, [visible]);

  const applyImage = (uri) => {
    setImage(uri);
    Image.getSize(uri, (w, h) => setImageAspectRatio(w > h ? 4 / 3 : 3 / 4));
  };

  const searchCard = async (searchText) => {
    try {
      const params = new URLSearchParams();
      const gameObj = games.find((g) => g.name === binder?.game);
      if (gameObj) params.append("game_id", gameObj.id);
      if (searchText) params.append("name", searchText);
      const data = await api.get(`/card/search?${params.toString()}`);
      if (binderExpansion) {
        setSearchResults(
          data.filter(
            (c) => c.cm_expansion_id === binderExpansion.cm_expansion_id,
          ),
        );
      } else {
        setSearchResults(data);
      }
    } catch (err) {
      console.log("searchCard error:", err);
    }
  };

  const handleAddCard = async () => {
    if (!binder?.id || !pickCard) return;
    try {
      await api.post("/binder_card", {
        binder_id: binder.id,
        card_id: pickCard,
        quantity: 1,
        foil: false,
        status: "owned",
        image_url: image,
      });
      onClose();
      resetModal();
    } catch (err) {
      console.log("handleAddCard error:", err);
    }
  };

  const handleInsertSealed = async(sealedItem, qty)=>{
    if(!binder?.id || !sealedItem) return;

    try{
      await api.post("/binder_sealed", {
        binder_id: binder.id,
        sealed_id: sealedItem.id,
        quantity: qty || quantity,
      });
      onClose();
      resetModal();
    }
    catch(err){
      console.log("handleSealed error: ", err);
    }
  };

  const resetModal = () => {
    setCardName("");
    setImage(null);
    setSearchResults([]);
    setPickCard("");
    setSelectedRarity(null);
    setSelectedRarityObj(null);
    setGradingCompany(null);
    setGrade("");
    setCertNumber("");
    setQuantity(1);
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["75%"]}
      onClose={() => {
        onClose();
        resetModal();
      }}
      enablePanDownToClose
      animateOnMount
      animationConfigs={animationConfigs}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: "#2A2A2A" }}
      handleIndicatorStyle={{ backgroundColor: "#ff7b00" }}
      keyboardBehavior="extend"
    >
      <BottomSheetFlatList
        data={searchResults}
        keyExtractor={(item) =>
          item.type === "separator" ? item.key : item.card_id.toString()
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  activeTab === "card" && styles.activeTabBtn,
                ]}
                onPress={() => setActiveTab("card")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "card" && styles.activeTabText,
                  ]}
                >
                  Card
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  activeTab === "sealed" && styles.activeTabBtn,
                ]}
                onPress={() => setActiveTab("sealed")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "sealed" && styles.activeTabText,
                  ]}
                >
                  Sealed
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  activeTab === "graded" && styles.activeTabBtn,
                ]}
                onPress={() => setActiveTab("graded")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "graded" && styles.activeTabText,
                  ]}
                >
                  Graded
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === "card" && (
              <CardTabContent
                binder={binder}
                rarities={rarities}
                selectedRarity={selectedRarity}
                setSelectedRarity={setSelectedRarity}
                setSelectedRarityObj={setSelectedRarityObj}
                selectedRarityObj={selectedRarityObj}
                cardName={cardName}
                setCardName={setCardName}
                searchCard={searchCard}
                handleAddCard={handleAddCard}
                pickCard={pickCard}
                binderExpansion={binderExpansion}
                games={games}
                quantity={quantity}
                setQuantity={setQuantity}
                image={image}
                onImageChange={applyImage}
                imageAspectRatio={imageAspectRatio}
              />
            )}
            {activeTab === "sealed" && (
              <SealedTabContent
                binder={binder}
                games={games}
                quantity={quantity}
                setQuantity={setQuantity}
                image={image}
                onImageChange={applyImage}
                imageAspectRatio={imageAspectRatio}
                onInsertSealed={handleInsertSealed}
              />
            )}
            {activeTab === "graded" && (
              <GradedTabContent
                binder={binder}
                games={games}
                cardName={cardName}
                setCardName={setCardName}
                searchCard={searchCard}
                gradingCompany={gradingCompany}
                setGradingCompany={setGradingCompany}
                grade={grade}
                setGrade={setGrade}
                certNumber={certNumber}
                setCertNumber={setCertNumber}
                quantity={quantity}
                setQuantity={setQuantity}
                image={image}
                onImageChange={applyImage}
                imageAspectRatio={imageAspectRatio}
              />
            )}
          </View>
        }
        renderItem={({ item }) => {
          if (item.type === "separator") {
            return (
              <View style={styles.separator}>
                <Text style={styles.separatorText}>{item.label}</Text>
              </View>
            );
          }
          return (
            <View
              style={[
                styles.resultItem,
                pickCard === item.card_id && styles.resultItemSelected,
              ]}
            >
              <View style={styles.resultHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultSet}>{item.expansion_name}</Text>
                </View>
                <Text style={styles.resultPrice}>
                  € {item.trend_price ?? "-"}
                </Text>
              </View>

              <View style={styles.priceRow}>
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>1 Tag</Text>
                  <Text style={styles.priceValue}>€ {item.avg1 ?? "-"}</Text>
                </View>
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>7 Tage</Text>
                  <Text style={styles.priceValue}>€ {item.avg7 ?? "-"}</Text>
                </View>
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>30 Tage</Text>
                  <Text style={styles.priceValue}>€ {item.avg30 ?? "-"}</Text>
                </View>
              </View>

              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={[
                    styles.selectBtn,
                    pickCard === item.card_id && styles.selectBtnActive,
                  ]}
                  onPress={() => setPickCard(item.card_id)}
                >
                  <Text
                    style={[
                      styles.selectBtnText,
                      pickCard === item.card_id && styles.selectBtnTextActive,
                    ]}
                  >
                    {pickCard === item.card_id ? "✓ Ausgewählt" : "Wählen"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </BottomSheet>
  );
}
const styles = StyleSheet.create({
  listContent: { paddingHorizontal: 16, paddingBottom: 12 },
  resultsList: { flex: 1, marginBottom: 12 },
  resultItem: {
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: Colors.borderDark,
  },
  resultItemSelected: { borderColor: Colors.primary, borderWidth: 1 },
  resultName: { color: Colors.textWhite, fontSize: 13, fontWeight: "500" },
  resultSet: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  resultPrice: {
    color: Colors.primaryLight,
    fontSize: 14,
    fontWeight: "500",
  },
  priceRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  priceBox: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 6,
    padding: 6,
    alignItems: "center",
  },
  priceLabel: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  priceValue: {
    color: Colors.textWhite,
    fontSize: 12,
  },
  resultActions: {
    flexDirection: "row",
    gap: 8,
  },
  selectBtn: {
    flex: 1,
    backgroundColor: Colors.borderDark,
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
  },
  selectBtnActive: {
    backgroundColor: Colors.primary,
  },
  selectBtnText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  selectBtnTextActive: {
    color: Colors.textWhite,
    fontWeight: "500",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  activeTabBtn: {
    backgroundColor: Colors.primary,
  },
  tabText: { color: Colors.textMuted, fontWeight: "500" },
  activeTabText: { color: Colors.textWhite },
});
