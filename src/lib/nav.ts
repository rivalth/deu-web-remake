export type NavItem = { label: string; href: string; mega?: "about" | "academic" | "research" };

export const NAV: NavItem[] = [
  { label: "Üniversite", href: "/hakkimizda", mega: "about" },
  { label: "Akademik", href: "/akademik", mega: "academic" },
  { label: "Araştırma", href: "/arastirma", mega: "research" },
  { label: "Haberler", href: "/haberler" },
  { label: "Duyurular", href: "/duyurular" },
];

export const ABOUT_LINKS = [
  { label: "Hakkımızda", href: "/hakkimizda", hint: "Misyon, vizyon ve değerler" },
  { label: "Tarihçe", href: "/hakkimizda#tarihce", hint: "1982'den bugüne" },
  { label: "Yönetim", href: "/hakkimizda#yonetim", hint: "Rektörlük ve üst yönetim" },
  { label: "Sayılarla DEÜ", href: "/sayilarla", hint: "Öğrenci, akademisyen, kampüs" },
  { label: "Kurumsal Kimlik", href: "https://kurumsalkimlik.deu.edu.tr/", hint: "Logo ve kılavuz" },
  { label: "Kalite", href: "https://kalite.deu.edu.tr/", hint: "Politika ve süreçler" },
];

export const RESEARCH_LINKS = [
  { label: "Araştırma ekosistemi", href: "/arastirma", hint: "Merkezler, projeler, laboratuvarlar" },
  { label: "BAP", href: "https://bap.deu.edu.tr/", hint: "Bilimsel Araştırma Projeleri" },
  { label: "DEPARK Teknopark", href: "https://www.depark.com/", hint: "Girişimcilik ve inovasyon" },
  { label: "Teknoloji Transfer Ofisi", href: "https://www.dokuzeylultto.com/", hint: "Sanayi iş birlikleri" },
  { label: "AVESİS", href: "https://avesis.deu.edu.tr/", hint: "Akademisyen ve yayın arama" },
  { label: "Kütüphane", href: "https://kutuphane.deu.edu.tr/", hint: "Veritabanları ve kaynaklar" },
];

export const CANDIDATE_URL = "https://adayogrenci.deu.edu.tr/";

export type SearchItem = {
  group: "Sayfalar" | "Akademik birimler" | "Haberler" | "Duyurular";
  title: string;
  href: string;
  hint?: string;
};
