import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { api } from "../utils/api";

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
    setTagColors(colors);
  };

  const updateTagColor = async (game_id: number, color: string) => {
    const results = await api.post("/tag_color", { game_id, color });
    getColors();
  };

  useEffect(() => {
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
