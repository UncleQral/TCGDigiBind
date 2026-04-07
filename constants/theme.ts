import { Platform } from "react-native";

export const Colors = {
  // Backgrounds
  background: "#1A1A1A",
  surface: "#2A2A2A",
  inputBg: "#1A1A1A",

  // Primary Lila (from logo)
  primary: "#8340BF",
  primaryLight: "#A972EC",
  primaryMid: "#8340BF",
  primaryDark: "#6D23A5",
  primaryDarkest: "#560489",

  // Text
  textWhite: "#FFFFFF",
  textMuted: "#9CA3AF",

  // Status
  error: "#d00000",

  // Borders
  border: "#444",
  borderDark: "#333",

  // Refresh Control
  refreshSpinner: "#8340BF",
  refreshBackground: "#2A2A2A",

  // Game Tags (defaults — overrideable by user settings)
  tagMagic: "#a78bfa",
  tagPokemon: "#facc15",
  tagYuGiOh: "#f87171",
  tagOnePiece: "#fb923c",
  tagLorcana: "#60a5fa",
  tagRiftbound: "#34d399",
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
});
