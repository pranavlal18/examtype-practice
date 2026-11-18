import { KnownFontName } from "@monkeytype/schemas/fonts";

export type FontConfig = {
  display?: string;
  weight?: number;
} & {
  systemFont?: never;
  fileName: string;
};

export const Fonts: Record<KnownFontName, FontConfig> = {
  Roboto_Mono: {
    fileName: "RobotoMono-Regular.woff2",
  },
  Lexend_Deca: {
    fileName: "LexendDeca-Regular.woff2",
  },
  Noto_Naskh_Arabic: {
    fileName: "NotoNaskhArabic-Regular.woff2",
  },
  Noto_Sans_Lao: {
    fileName: "NotoSansLao-Regular.woff2",
  },
};
