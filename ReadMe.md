# DorkGen – Google Dork Sorgularını Kolaylaştıran Web Uygulaması

Günümüzde siber güvenlik ve penetrasyon testleri, sadece zafiyet tarayıcılarıyla değil, doğru sorgularla hedef sistemleri analiz etmekle de yakından ilgili. İşte bu noktada **DorkGen** devreye giriyor: güvenlik testlerinde kullanılan Google Dork sorgularını hızlı ve güvenilir bir şekilde oluşturmayı sağlayan modern bir web uygulaması.

## Projenin Amacı

DorkGen’in temel amacı, manuel olarak yazılması zor ve karmaşık olabilen Google Dork sorgularını kolayca oluşturmak. Kullanıcılar, bir domain hedefi seçip, anahtar kelimeler, dosya türleri ve zafiyet kategorileri belirleyerek tek tıkla işlevsel dork sorguları elde edebiliyor. Ayrıca oluşturulan sorgular kaydedilebiliyor, yönetilebiliyor ve doğrudan Google üzerinde çalıştırılabiliyor.

---

## Temel ve Gelişmiş Özellikler

DorkGen iki katmanlı bir işlevsellik sunuyor:

### Temel Özellikler

- **Hedef Domain:** Kullanıcılar belirli bir domain üzerinde sorgu oluşturabiliyor.
- **Anahtar Kelimeler:** İstenilen özel kelimelerle sorgular zenginleştirilebiliyor.
- **Dosya Türleri:** PDF, Office, arşiv, kod ve veritabanı dosyalarına özel aramalar yapılabiliyor.
- **Zafiyet Tespiti:** Directory listing, exposed config, log files gibi açıklar kolayca taranabiliyor.
- **CMS Detection:** WordPress, Joomla ve Drupal tespiti yapılabiliyor.
- **Kimlik Doğrulama:** Login sayfaları, admin panelleri ve kullanıcı dosyaları için arama yapılabiliyor.
- **Hata Tespiti:** SQL hataları, stack trace ve debug bilgileri sorgulanabiliyor.

### Gelişmiş Özellikler

- **Sorgu Kaydetme:** Oluşturulan sorgular kaydedilip tekrar kullanılabiliyor.
- **Hızlı Erişim:** Kaydedilen sorgular tek tıkla yüklenebiliyor.
- **Google Entegrasyonu:** Oluşturulan sorgular doğrudan Google’da aratılabiliyor.
- **Responsive Tasarım:** Mobil ve masaüstü cihazlarda uyumlu arayüz sağlanıyor.

---

## Teknik Mimari

Projeyi geliştirirken **Docker tabanlı bir yapı** kullanıldı, böylece bağımlılıklar ve ortamlar izole edildi ve sorunsuz bir geliştirme süreci sağlandı.

### Backend – Go

- **Framework:** Gin web framework ile hızlı API geliştirme.
- **Veritabanı:** SQLite, CGO ile entegre edildi.
- **Docker:** Multi-stage build ile hem development hem production için optimize edildi.
- **API:** RESTful endpoint’ler üzerinden veri akışı sağlandı.

### Frontend – React

- **Framework:** React 18 kullanıldı.
- **Styling:** Tailwind CSS ile modern ve hızlı bir arayüz tasarlandı.
- **Icons:** Lucide React ikon kütüphanesi kullanıldı.
- **HTTP Client:** Axios ile backend ile haberleşme sağlandı.
- **Docker:** Multi-stage build ile development ve nginx tabanlı production yapısı oluşturuldu.

### Docker Yapısı

- **Development:** Hot-reload ve volume mount ile hızlı geliştirme.
- **Production:** Optimize edilmiş imajlar ve nginx ile servis.
- **Networking:** İzole container ağı sayesinde güvenli iletişim.

---

## Kurulum ve Çalıştırma

Projeyi çalıştırmak için yalnızca **Docker** ve **Docker Compose** yeterli.

### Development

```bash
git clone https://github.com/Hatukay/DorkGen
cd dorkgen-docker
docker-compose up --build
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8080](http://localhost:8080)

### Production

```bash
docker-compose -f docker-compose.prod.yml up --build
```

- **Frontend:** [http://localhost](http://localhost)
- **Backend API:** [http://localhost:8080](http://localhost:8080)

---

## Proje Yapısı

```
dorkgen-docker/
├── docker-compose.yml
├── docker-compose.override.yml
├── docker-compose.prod.yml
├── backend/
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   ├── go.mod
│   ├── go.sum
│   └── main.go
├── frontend/
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/
│   └── src/
└── README.md
```

---

## API Endpoints

- `POST /api/generate` → Yeni dork sorgusu oluşturur
- `GET /api/dorks` → Kaydedilen dorkları listeler
- `POST /api/dorks` → Yeni dork kaydeder
- `DELETE /api/dorks/:id` → Dork siler
- `GET /api/categories` → Kategori listesini getirir

---

## Kullanım Örnekleri

### Basit Domain Arama

```
Domain: example.com
Anahtar Kelimeler: admin, config
```

**Oluşturulan Sorgu:**

```
site:example.com admin config
```

### Gelişmiş Zafiyet Arama

```
Domain: example.com
Dosya Türleri: pdf, doc
Zafiyet: directory_listing, exposed_config
CMS: wordpress
```

**Oluşturulan Sorgu:**

```
site:example.com filetype:pdf OR filetype:doc OR filetype:docx intitle:"index of" intext:"config" OR intext:"configuration" intext:"powered by wordpress" OR intext:"wp-content"
```

---

## Sonuç

DorkGen, güvenlik araştırmacıları ve penetration tester’lar için **hem zaman kazandıran hem de düzenli bir şekilde sorgu yönetimi sunan** bir uygulama. Modern web teknolojileri, Docker tabanlı geliştirme ve deployment yapısı sayesinde hem development hem production ortamlarında sorunsuz çalışıyor. Artık tek bir arayüz üzerinden dork sorgularını oluşturmak, kaydetmek ve çalıştırmak çok daha kolay.

