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
  title: "Excel'den teze, işini bitiren akademik destek",
  subtitle:
    "Grup dönemleri, birebir dersler, analiz ve tez düzenleme. Fiyatı ve tarihi önden gör, başvurunu panelinden adım adım takip et.",
};

export const defaultAnalysisIntro: ServiceIntroContent = {
  title: "Bibliyometrik & İstatistiksel Analiz",
  description: "Verini uzman ekibe bırak; yöntem seçimi, analiz ve raporlama uçtan uca bizde.",
  body: "Her analiz projeye özel değerlendirilir. Kısa formu doldur, dosyanı ekle; ekibimiz inceleyip panelinde net bir teklif sunsun.",
};

export const defaultThesisIntro: ServiceIntroContent = {
  title: "Tez Düzenleme",
  description: "Tezin; biçim, kaynakça ve enstitü şablon kurallarına uygun, teslime hazır hâle gelir.",
  body: "Tezini ve enstitü yönergeni gönder; sayfa sayısı ve ihtiyaca göre net bir teklifle dönelim. Onaylarsan süreç başlar, her adımı panelinden izlersin.",
};

export const defaultCorporateIntro: ServiceIntroContent = {
  title: "Kurumsal Eğitim",
  description: "Ekibine özel Excel, Word ve PowerPoint programları; online, yerinde ya da karma.",
  body: "Ekibinin seviyesine ve iş senaryolarına göre program kurgularız. Kişi sayısına göre fiyat aralıkları program sayfalarında açıkça yazar.",
};

export const defaultEducationIntro: EducationIntroContent = {
  title: "Excel, Word ve PowerPoint programları",
  description: "Grup dönemine katıl, birebir çalış ya da ekibinle öğren. Tarih, kontenjan ve fiyat önden belli.",
};

export const defaultFaq: FaqContent = {
  items: [
    {
      question: "Ödeme site üzerinden mi yapılıyor?",
      answer: "Hayır. Fiyatlar sitede açıkça yazar; ödeme ekibimizle doğrudan konuşulur.",
    },
    {
      question: "Bir döneme nasıl kayıt olurum?",
      answer:
        'Program sayfasından dönemi seçip "Yerimi ayır" demen yeterli. Başvurun onaylanınca e-posta ve panel bildirimi alırsın.',
    },
    {
      question: "Dönem doluysa ne olur?",
      answer: "Bekleme listesine katılırsın. Yer açılır açılmaz sana haber veririz.",
    },
    {
      question: "Analiz ve tez talepleri nasıl işliyor?",
      answer:
        "Kısa bir formla ihtiyacını anlatırsın, dosyanı eklersin. Ekibimiz inceleyip panelinde teklif sunar; onaylarsan süreç başlar ve her adımı panelinden izlersin.",
    },
    {
      question: "Eğitim sonunda belge alıyor muyum?",
      answer:
        "Evet. Dönemi tamamlayan herkes doğrulama kodlu bir katılım belgesi alır; belge panelindeki Belgelerim bölümünde durur.",
    },
  ],
};
