import { useEffect, useState } from "react";

export type Lang = "en" | "ru" | "de" | "es" | "fr" | "pt" | "zh" | "ja" | "hi";

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English",    flag: "🇬🇧" },
  { code: "ru", label: "Русский",    flag: "🇷🇺" },
  { code: "de", label: "Deutsch",    flag: "🇩🇪" },
  { code: "es", label: "Español",    flag: "🇪🇸" },
  { code: "fr", label: "Français",   flag: "🇫🇷" },
  { code: "pt", label: "Português",  flag: "🇵🇹" },
  { code: "zh", label: "中文",        flag: "🇨🇳" },
  { code: "ja", label: "日本語",      flag: "🇯🇵" },
  { code: "hi", label: "हिन्दी",       flag: "🇮🇳" },
];

const dict: Record<string, Partial<Record<Lang, string>>> = {
  tagline:      { en: "Check 4 a Mate!", ru: "Шах и Мат — на новый лад!", de: "Such dir einen Gegner!", es: "¡Busca tu rival!", fr: "Cherche ton adversaire !", pt: "Encontre seu rival!", zh: "来一局吗？", ja: "対戦相手を探そう！", hi: "मुकाबला!" },
  play_now:     { en: "Play Now", ru: "Играть", de: "Spielen", es: "Jugar", fr: "Jouer", pt: "Jogar", zh: "开始", ja: "プレイ", hi: "खेलें" },
  sign_in:      { en: "Sign In", ru: "Войти", de: "Anmelden", es: "Entrar", fr: "Connexion", pt: "Entrar", zh: "登录", ja: "サインイン", hi: "साइन इन" },
  play_ai:      { en: "Play vs AI", ru: "Против ИИ", de: "Gegen KI", es: "Contra IA", fr: "Contre IA", pt: "Contra IA", zh: "对战 AI", ja: "AI と対戦", hi: "AI से खेलें" },
  play_pvp:     { en: "Play vs Player", ru: "Против игрока", de: "Gegen Spieler", es: "Contra jugador", fr: "Contre joueur", pt: "Contra jogador", zh: "对战玩家", ja: "対人戦", hi: "खिलाड़ी से खेलें" },
  training:     { en: "Training", ru: "Тренировка", de: "Training", es: "Entreno", fr: "Entraînement", pt: "Treino", zh: "训练", ja: "トレーニング", hi: "अभ्यास" },
  profile:      { en: "Profile", ru: "Профиль", de: "Profil", es: "Perfil", fr: "Profil", pt: "Perfil", zh: "档案", ja: "プロフィール", hi: "प्रोफ़ाइल" },
  tournaments:  { en: "Tournaments", ru: "Турниры", de: "Turniere", es: "Torneos", fr: "Tournois", pt: "Torneios", zh: "锦标赛", ja: "トーナメント", hi: "टूर्नामेंट" },
  settings:     { en: "Settings", ru: "Настройки", de: "Einstellungen", es: "Ajustes", fr: "Paramètres", pt: "Configurações", zh: "设置", ja: "設定", hi: "सेटिंग्स" },
  resign:       { en: "Resign", ru: "Сдаться", de: "Aufgeben", es: "Rendirse", fr: "Abandonner", pt: "Desistir", zh: "认输", ja: "投了", hi: "हार मानें" },
  hint:         { en: "Hint", ru: "Подсказка", de: "Tipp", es: "Pista", fr: "Indice", pt: "Dica", zh: "提示", ja: "ヒント", hi: "संकेत" },
};

let currentLang: Lang = (typeof window !== "undefined" && (localStorage.getItem("navy_lang") as Lang)) || "en";
const listeners = new Set<(l: Lang) => void>();

export function setLang(l: Lang) {
  currentLang = l;
  if (typeof window !== "undefined") localStorage.setItem("navy_lang", l);
  listeners.forEach(fn => fn(l));
}
export function getLang() { return currentLang; }
export function t(key: keyof typeof dict): string {
  return dict[key]?.[currentLang] || dict[key]?.en || String(key);
}
export function useLang() {
  const [l, setL] = useState<Lang>(currentLang);
  useEffect(() => {
    const fn = (nl: Lang) => setL(nl);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return { lang: l, t, setLang };
}