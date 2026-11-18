import { z } from "zod";
import { customEnumErrorHandler } from "./util";

export const KnownFontNameSchema = z.enum(
  ["Roboto_Mono", "Lexend_Deca", "Noto_Naskh_Arabic", "Noto_Sans_Lao"],
  {
    errorMap: customEnumErrorHandler("Must be a known font family"),
  },
);
export type KnownFontName = z.infer<typeof KnownFontNameSchema>;

export const FontNameSchema = KnownFontNameSchema.or(
  z
    .string()
    .max(50)
    .regex(/^[a-zA-Z0-9_\-+.]+$/),
);
export type FontName = z.infer<typeof FontNameSchema>;
