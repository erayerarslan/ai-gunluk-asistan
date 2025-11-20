# AI Günlük Asistanım

AI Günlük Asistanım, React Native CLI ile geliştirilen ve tamamen ücretsiz servislerle çalışan basit bir mobil günlük asistanıdır. Kullanıcılar günlük duygu durumlarını tek cümleyle paylaşıp Hugging Face inference API'leri üzerinden duygu analizi yaptırabilir, özet ve küçük öneriler alabilir. Tüm sonuçlar cihazda saklandığı için geçmiş her zaman çevrimdışı görüntülenebilir.

## Özellikler
- 🧠 **AI Analizi:** Hugging Face `distilbert-base-uncased-finetuned-sst-2-english` modeliyle duygu analizi, `facebook/bart-large-cnn` ile kısa özet üretimi
- ✍️ **Günlük Girdi Ekranı:** Metni yaz, tek tuşla analiz et, sonuçları anında gör
- 📚 **Geçmiş ve Haftalık Özet:** AsyncStorage üzerinde saklanan tüm kayıtlar, duygu renginde kartlarla listelenir; son 7 gün özeti ayrıca gösterilir
- 🌗 **Duyguya Göre Arka Plan:** Son analizin ruh haline göre ekran renkleri değişir
- 📴 **Çevrimdışı Erişim:** İnternet olmasa bile geçmiş kayıtlar ve özetler okunabilir
- 🧩 **Context API Durum Yönetimi:** Analiz akışı ve depolama tek context üzerinden yönetilir

## Teknolojiler
| Kategori | Teknoloji |
| --- | --- |
| Mobil | React Native CLI (TypeScript)
| UI | React Native Paper + Material Community Icons
| State | React Context API
| Depolama | `@react-native-async-storage/async-storage`
| AI | Hugging Face Inference API (ücretsiz katman)

## Kurulum
```bash
# 1. Depoyu klonla
cd /Users/erayerarslan/React
# (veya kendi çalışma dizinin)

# 2. Bağımlılıkları yükle
npm install

# 3. iOS için CocoaPods
cd ios && pod install && cd ..
```

### Hugging Face API anahtarı
1. [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) üzerinden ücretsiz bir "Access Token" oluştur.
2. `src/services/huggingFace.ts` dosyasındaki `HUGGING_FACE_API_KEY` değerini kendi token'ınla değiştir.
3. Güvenlik için bu dosyayı kendi reposunda gizlemek istersen `huggingFace.example.ts` benzeri bir yapı kullanabilirsin.

> Token eklenmezse Hugging Face istekleri 401 döner ve uygulama kullanıcıya hatayı gösterir.

### Çalıştırma
```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

## Mimarinin Kısa Özeti
- `src/context/JournalContext.tsx`: AI analiz akışı, AsyncStorage yazma/okuma ve ekranlar arası paylaşım
- `src/services/huggingFace.ts`: Duygu ve özet için iki ayrı Hugging Face modeli ile iletişim
- `src/screens/*`: Günlük girişi ve geçmiş ekranları
- `src/components/*`: Kart bileşenleri, haftalık özet vb.
- `src/storage/journalStorage.ts`: AsyncStorage erişimi

## AI Araç Kullanım Notu
Bu proje hazırlanırken Cursor + ChatGPT (GPT-5.1 Codex) yardımıyla bazı kısımlar (özellikle UI düzenleri ve dokümantasyon) otomatik olarak üretildi. Tüm kod gözden geçirilip proje ihtiyaçlarına göre düzenlendi.

## Ekran Görüntüleri / Demo
`/docs` klasörüne çalışır halden alınmış ekran görüntüsü veya kısa ekran kaydı ekleyip README'de bağlantı paylaşabilirsiniz.

## Yol Haritası
- ✅ MVP: Günlük giriş + geçmiş listeleme + haftalık özet
- ⏳ Gelecek: Hatırlatma bildirimleri, gelişmiş öneriler, çoklu dil desteği
