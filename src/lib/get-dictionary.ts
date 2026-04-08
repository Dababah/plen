import type { Locale } from "../i18n-config";

const dictionaries: Record<Locale, () => Promise<any>> = {
  en: () => import("../dictionaries/en.json").then((module) => module.default),
  id: () => import("../dictionaries/id.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale] ? dictionaries[locale]() : dictionaries.en();
};
