import { Language } from "@monkeytype/schemas/languages";

const englishLanguages: Language[] = [
  "english",
  "english_1k",
  "english_5k",
  "english_10k",
  "english_25k",
  "english_450k",
  "english_commonly_misspelled",
  "english_contractions",
  "english_doubleletter",
  "english_shakespearean",
  "english_old",
  "english_medical",
  "english_legal",
];
const hindiLanguages: Language[] = ["hindi", "hindi_1k"];

// ExamType fork: only English and Hindi word lists ship with the repository.
// The LanguageSchema enum is kept intact (upstream wordlist ids remain valid
// config values) but only the lists below are present on disk and shown in the
// language picker.
export type LanguageGroupName = "english" | "hindi";

export const LanguageGroups: Record<LanguageGroupName, readonly Language[]> = {
  english: englishLanguages,
  hindi: hindiLanguages,
};

export const LanguageGroupNames: LanguageGroupName[] = ["english", "hindi"];

export const LanguageList: Language[] = [
  ...englishLanguages,
  ...hindiLanguages,
];

/**
 * Fetches the language group for a given language.
 * @param language The language code.
 * @returns the language group.
 */
export function getGroupForLanguage(
  language: Language,
): LanguageGroupName | undefined {
  return LanguageGroupNames.find((group) =>
    LanguageGroups[group].includes(language),
  );
}
