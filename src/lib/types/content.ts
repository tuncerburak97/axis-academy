// src/lib/types/content.ts — site_content bölüm tipleri ve varsayılan metinler
// Varsayılanlar hem public fallback hem admin form başlangıç değeri olarak kullanılır.

export interface HeroContent {
  title: string;
  subtitle: string;
}

export interface ServiceIntroContent {
  title: string;
  description: string;
  body: string;
}

export interface EducationIntroContent {
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqContent {
  items: FaqItem[];
}

export const defaultHero: HeroContent = {
  title: "Akademik işlerinizde net, profesyonel ve güvenilir destek",
  subtitle:
    "İhtiyacınız analiz, ofis programları eğitimi ya da tez düzenleme olsun — süreci sadeleştirir, sonucu garantiye alırız. Ücretsiz kayıt olun, detayları panelinizden takip edin.",
};

export const defaultAnalysisIntro: ServiceIntroContent = {
  title: "Bibliyometrik & İstatistiksel Analiz",
  description: "Araştırma verinizi uzman ellere bırakın; yöntem seçimi, analiz ve raporlama uçtan uca bizde.",
  body: "Analiz talepleri projeye özel değerlendirilir ve fiyatlandırılır. Talep oluşturmak için ücretsiz üye olun; ekibimiz sizinle doğrudan iletişime geçsin.",
};

export const defaultThesisIntro: ServiceIntroContent = {
  title: "Tez Düzenleme",
  description: "Teziniz; biçim, kaynakça ve enstitü şablon kurallarına uygun, teslime hazır hâle getirilir.",
  body: "Tez düzenleme talepleri projeye özel değerlendirilir. Üye olup talebinizi dosyanızla birlikte iletin; size net bir teklifle dönelim.",
};

export const defaultEducationIntro: EducationIntroContent = {
  title: "Ofis Programları Eğitimleri",
  description: "Hazır paketler, sana özel modüller ya da sınıf eğitimleri — öğrenme şeklini sen seç.",
};

export const defaultFaq: FaqContent = {
  items: [
    {
      question: "Ödeme site üzerinden mi yapılıyor?",
      answer: "Hayır. Paket ve hizmet detayları üye panelinde görünür; ödeme süreci ekibimizle doğrudan konuşulur.",
    },
    {
      question: "Eğitim detaylarını neden göremiyorum?",
      answer:
        "Açık sınıflar, paket müfredatları ve katılım seçenekleri üyelere açıktır. Ücretsiz kayıt olduktan sonra tüm detayları panelinizden görebilirsiniz.",
    },
    {
      question: "Analiz ve tez talepleri nasıl işliyor?",
      answer: "Talebinizi panelinizden iletirsiniz; ekibimiz inceleyip size özel teklif ve planlama ile döner.",
    },
  ],
};
