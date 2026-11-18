import { Language, LanguageSchema } from "@monkeytype/schemas/languages";

export const LanguageList: Language[] = LanguageSchema._def.values;

// ExamType fork: only English and Hindi word lists ship with the repository.
// The LanguageSchema enum is kept intact (upstream wordlist ids remain valid
// config values) but only the lists below are present on disk and shown in the
// language picker.
export const LanguageGroups: Record<string, Language[]> = {
  english: [
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
  ],
  hindi: ["hindi", "hindi_1k"],
};

export type LanguageGroupName = keyof typeof LanguageGroups;
export const LanguageGroupNames: LanguageGroupName[] = Array.from(
  Object.keys(LanguageGroups),
);

/**
 * Fetches the language group for a given language.
 * @param language The language code.
 * @returns the language group.
 */
export function getGroupForLanguage(
  language: Language,
): LanguageGroupName | undefined {
  return LanguageGroupNames.find((group) => group.includes(language));
}
