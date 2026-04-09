import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { api } from "../utils/api";

const TAG_COLORS_KEY = "tag_colors_cache";

type TagColor = {
  game_id: number;
  color: string;
};

type SettingsContextType = {
  tagColors: TagColor[];
  updateTagColor: (game_id: number, color: string) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [tagColors, setTagColors] = useState<TagColor[]>([]);

  const getColors = async () => {
    const colors = await api.get("/tag_color");
    if (Array.isArray(colors)) {
      setTagColors(colors);
      AsyncStorage.setItem(TAG_COLORS_KEY, JSON.stringify(colors));
    }
  };

  const updateTagColor = async (game_id: number, color: string) => {
    await api.post("/tag_color", { game_id, color });
    getColors();
  };

  useEffect(() => {
    AsyncStorage.getItem(TAG_COLORS_KEY).then((cached) => {
      if (cached) setTagColors(JSON.parse(cached));
    });
    getColors();
  }, []);

  return (
    <SettingsContext.Provider value={{ tagColors, updateTagColor }}>
      {children}
    </SettingsContext.Provider>
  );
};
export const useSetting = (): SettingsContextType => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSetting must be inside SettingsProvider");
  }
  return ctx;
};
