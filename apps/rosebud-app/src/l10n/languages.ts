export type Language = {
  code: string
  name: string
}

export const kLanguages: Language[] = [
  { code: 'af', name: 'Afrikaans' }, // Afrikaans
  { code: 'arz', name: 'عربي' }, // Arabic
  { code: 'az', name: 'Azərbaycanca' }, // Azerbaijani
  { code: 'be', name: 'Беларуская' }, // Belarusian
  { code: 'bg', name: 'Български' }, // Bulgarian
  { code: 'bho', name: 'भोजपुरी' }, // Bhojpuri
  { code: 'bn', name: 'বাংলা' }, // Bengali
  { code: 'ca', name: 'Català' }, // Catalan
  { code: 'cs', name: 'Čeština' }, // Czech
  { code: 'cy', name: 'Cymraeg' }, // Welsh
  { code: 'da', name: 'Dansk' }, // Danish
  { code: 'de', name: 'Deutsch' }, // German
  { code: 'el', name: 'Ελληνικά' }, // Greek
  { code: 'en', name: 'English' }, // English
  { code: 'es', name: 'Español' }, // Spanish
  { code: 'et', name: 'Eesti' }, // Estonian
  { code: 'fa', name: 'فارسی' }, // Farsi
  { code: 'fi', name: 'Suomi' }, // Finnish
  { code: 'fr', name: 'Français' }, // French
  { code: 'gl', name: 'Galego' }, // Galician
  { code: 'gu', name: 'ગુજરાતી' }, // Gujarati
  { code: 'ha', name: 'Hausa' }, // Hausa
  { code: 'he', name: 'עברית' }, // Hebrew
  { code: 'hi', name: 'हिन्दी' }, // Hindi
  { code: 'hr', name: 'Hrvatski' }, // Croatian
  { code: 'hu', name: 'Magyar' }, // Hungarian
  { code: 'hy', name: 'Հայերեն' }, // Armenian
  { code: 'id', name: 'Bahasa Indonesia' }, // Indonesian
  { code: 'is', name: 'Íslenska' }, // Icelandic
  { code: 'it', name: 'Italiano' }, // Italian
  { code: 'ja', name: '日本語' }, // Japanese
  { code: 'jv', name: 'Basa Jawa' }, // Javanese
  { code: 'kk', name: 'Қазақ тілі' }, // Kazakh
  { code: 'ko', name: '한국어' }, // Korean
  { code: 'lt', name: 'Lietuvių' }, // Lithuanian
  { code: 'lv', name: 'Latviešu' }, // Latvian
  { code: 'mr', name: 'मराठी' }, // Marathi
  { code: 'nl', name: 'Nederlands' }, // Dutch
  { code: 'no', name: 'Norsk' }, // Norwegian
  { code: 'pa', name: 'ਪੰਜਾਬੀ' }, // Punjabi
  { code: 'pl', name: 'Polski' }, // Polish
  { code: 'pt', name: 'Português' }, // Portuguese
  { code: 'ro', name: 'Română' }, // Romanian
  { code: 'ru', name: 'Русский' }, // Russian
  { code: 'sk', name: 'Slovenčina' }, // Slovak
  { code: 'sl', name: 'Slovenščina' }, // Slovenian
  { code: 'sv', name: 'Svenska' }, // Swedish
  { code: 'ta', name: 'தமிழ்' }, // Tamil
  { code: 'te', name: 'తెలుగు' }, // Telugu
  { code: 'tr', name: 'Türkçe' }, // Turkish
  { code: 'uk', name: 'Українська' }, // Ukrainian
  { code: 'ur', name: 'اردو' }, // Urdu
  { code: 'vi', name: 'Tiếng Việt' }, // Vietnamese
  { code: 'wuu', name: '吴语' }, // Shanghainese
  { code: 'yue', name: '粤语' }, // Cantonese
  { code: 'zh', name: '普通话' }, // Mandarin Chinese
]

export const getNearestLanguage = (locale: string | null): Language => {
  if (!locale) {
    return kLanguages.find((language) => language.code === 'en')!
  }

  const languageCodes = kLanguages.map((language) => language.code)
  const localeParts = locale.split('-')
  const localeCode = localeParts[0]

  let nearestLanguageCode = ''
  let maxMatchLength = 0

  for (const code of languageCodes) {
    const matchLength = localeCode.startsWith(code) ? code.length : 0
    if (matchLength > maxMatchLength) {
      maxMatchLength = matchLength
      nearestLanguageCode = code
    }
  }

  const nearestLanguage = kLanguages.find(
    (language) => language.code === nearestLanguageCode
  )

  return (
    nearestLanguage ?? kLanguages.find((language) => language.code === 'en')!
  )
}
