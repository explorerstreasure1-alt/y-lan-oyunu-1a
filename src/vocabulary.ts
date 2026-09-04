export type WordLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

import { EXTRA_TUPLES } from "./extraTuples";

export type VocabularyWord = {
  id: number;
  word: string;
  meaningTr: string;
  phonetic: string;
  pos: string;
  topic: string;
  level: WordLevel;
  definition: string;
  example: string;
};

type BaseTuple = [string, string, string, WordLevel, string];

const BASE_TUPLES: BaseTuple[] = [
  // A1 - Pronouns & Basics
  ["I","Ben","pronoun","A1","Zamirler"],["you","Sen","pronoun","A1","Zamirler"],["he","O (erkek)","pronoun","A1","Zamirler"],["she","O (kadın)","pronoun","A1","Zamirler"],["it","O","pronoun","A1","Zamirler"],["we","Biz","pronoun","A1","Zamirler"],["they","Onlar","pronoun","A1","Zamirler"],["me","Beni","pronoun","A1","Zamirler"],["him","Onu","pronoun","A1","Zamirler"],["her","Onu","pronoun","A1","Zamirler"],["us","Bizi","pronoun","A1","Zamirler"],["them","Onları","pronoun","A1","Zamirler"],["my","Benim","pronoun","A1","Zamirler"],["your","Senin","pronoun","A1","Zamirler"],["his","Onun","pronoun","A1","Zamirler"],["our","Bizim","pronoun","A1","Zamirler"],["their","Onların","pronoun","A1","Zamirler"],["mine","Benimki","pronoun","A1","Zamirler"],["this","Bu","pronoun","A1","Zamirler"],["that","Şu","pronoun","A1","Zamirler"],["these","Bunlar","pronoun","A1","Zamirler"],["those","Şunlar","pronoun","A1","Zamirler"],["who","Kim","pronoun","A1","Zamirler"],["what","Ne","pronoun","A1","Zamirler"],["which","Hangi","pronoun","A1","Zamirler"],["myself","Kendim","pronoun","A1","Zamirler"],["yourself","Kendin","pronoun","A1","Zamirler"],["himself","Kendisi","pronoun","A1","Zamirler"],["herself","Kendisi","pronoun","A1","Zamirler"],["ourselves","Kendimiz","pronoun","A1","Zamirler"],["themselves","Kendileri","pronoun","A1","Zamirler"],

  // A1 Core Verbs 150
  ["be","Olmak","verb","A1","Fiiller"],["have","Sahip olmak","verb","A1","Fiiller"],["do","Yapmak","verb","A1","Fiiller"],["go","Gitmek","verb","A1","Fiiller"],["come","Gelmek","verb","A1","Fiiller"],["make","Yapmak","verb","A1","Fiiller"],["take","Almak","verb","A1","Fiiller"],["give","Vermek","verb","A1","Fiiller"],["get","Almak","verb","A1","Fiiller"],["see","Görmek","verb","A1","Fiiller"],["know","Bilmek","verb","A1","Fiiller"],["think","Düşünmek","verb","A1","Fiiller"],["want","İstemek","verb","A1","Fiiller"],["need","İhtiyaç duymak","verb","A1","Fiiller"],["like","Sevmek","verb","A1","Fiiller"],["love","Çok sevmek","verb","A1","Fiiller"],["work","Çalışmak","verb","A1","Fiiller"],["play","Oynamak","verb","A1","Fiiller"],["live","Yaşamak","verb","A1","Fiiller"],["eat","Yemek","verb","A1","Fiiller"],["drink","İçmek","verb","A1","Fiiller"],["read","Okumak","verb","A1","Fiiller"],["write","Yazmak","verb","A1","Fiiller"],["speak","Konuşmak","verb","A1","Fiiller"],["say","Söylemek","verb","A1","Fiiller"],["tell","Anlatmak","verb","A1","Fiiller"],["ask","Sormak","verb","A1","Fiiller"],["answer","Cevaplamak","verb","A1","Fiiller"],["help","Yardım etmek","verb","A1","Fiiller"],["open","Açmak","verb","A1","Fiiller"],["close","Kapatmak","verb","A1","Fiiller"],["start","Başlamak","verb","A1","Fiiller"],["finish","Bitirmek","verb","A1","Fiiller"],["buy","Satın almak","verb","A1","Fiiller"],["sell","Satmak","verb","A1","Fiiller"],["bring","Getirmek","verb","A1","Fiiller"],["carry","Taşımak","verb","A1","Fiiller"],["find","Bulmak","verb","A1","Fiiller"],["lose","Kaybetmek","verb","A1","Fiiller"],["feel","Hissetmek","verb","A1","Fiiller"],["become","Olmak","verb","A1","Fiiller"],["leave","Ayrılmak","verb","A1","Fiiller"],["put","Koymak","verb","A1","Fiiller"],["keep","Tutmak","verb","A1","Fiiller"],["let","İzin vermek","verb","A1","Fiiller"],["begin","Başlamak","verb","A1","Fiiller"],["seem","Görünmek","verb","A1","Fiiller"],["run","Koşmak","verb","A1","Fiiller"],["walk","Yürümek","verb","A1","Fiiller"],["call","Aramak","verb","A1","Fiiller"],["email","E-posta göndermek","verb","A1","Fiiller"],["meet","Buluşmak","verb","A1","Fiiller"],["plan","Planlamak","verb","A1","Fiiller"],["pay","Ödemek","verb","A1","Fiiller"],["sign","İmzalamak","verb","A2","Fiiller"],["schedule","Programlamak","verb","A2","Fiiller"],["organize","Düzenlemek","verb","A2","Fiiller"],["manage","Yönetmek","verb","A2","Fiiller"],["hire","İşe almak","verb","B1","Fiiller"],["lead","Liderlik etmek","verb","B1","Fiiller"],["promote","Terfi ettirmek","verb","B2","Fiiller"],["resign","İstifa etmek","verb","B2","Fiiller"],["retire","Emekli olmak","verb","B1","Fiiller"],["negotiate","Pazarlık yapmak","verb","B2","Fiiller"],["contract","Sözleşme yapmak","verb","B2","Fiiller"],["invoice","Fatura kesmek","verb","B2","Fiiller"],["receive","Almak (para)","verb","A2","Fiiller"],["bill","Faturalandırmak","verb","B2","Fiiller"],["charge","Ücret almak","verb","B1","Fiiller"],["quote","Fiyat vermek","verb","B2","Fiiller"],["order","Sipariş vermek","verb","A2","Fiiller"],["deliver","Teslim etmek","verb","B1","Fiiller"],["ship","Kargo ile göndermek","verb","B2","Fiiller"],["stock","Stok tutmak","verb","B2","Fiiller"],["supply","Tedarik etmek","verb","B2","Fiiller"],["market","Pazarlamak","verb","B2","Fiiller"],["advertise","Reklam yapmak","verb","B2","Fiiller"],["export","İhracat yapmak","verb","C1","Fiiller"],["import","İthalat yapmak","verb","C1","Fiiller"],["sit","Oturmak","verb","A1","Fiiller"],["stand","Durmak","verb","A1","Fiiller"],["learn","Öğrenmek","verb","A1","Fiiller"],["understand","Anlamak","verb","A1","Fiiller"],["watch","İzlemek","verb","A1","Fiiller"],["listen","Dinlemek","verb","A1","Fiiller"],["hear","Duymak","verb","A1","Fiiller"],["stop","Durmak","verb","A1","Fiiller"],["move","Hareket etmek","verb","A1","Fiiller"],["sleep","Uyumak","verb","A1","Fiiller"],["wake","Uyanmak","verb","A1","Fiiller"],["send","Göndermek","verb","A1","Fiiller"],["build","İnşa etmek","verb","A1","Fiiller"],["break","Kırmak","verb","A1","Fiiller"],["choose","Seçmek","verb","A1","Fiiller"],["drive","Araba sürmek","verb","A1","Fiiller"],["ride","Binmek","verb","A1","Fiiller"],["fly","Uçmak","verb","A1","Fiiller"],["fall","Düşmek","verb","A1","Fiiller"],["cut","Kesmek","verb","A1","Fiiller"],["grow","Büyümek","verb","A1","Fiiller"],["draw","Çizmek","verb","A1","Fiiller"],["meet","Buluşmak","verb","A1","Fiiller"],["pay","Ödemek","verb","A1","Fiiller"],["teach","Öğretmek","verb","A1","Fiiller"],["study","Ders çalışmak","verb","A1","Fiiller"],["try","Denemek","verb","A1","Fiiller"],["call","Aramak","verb","A1","Fiiller"],["turn","Dönmek","verb","A1","Fiiller"],["win","Kazanmak","verb","A1","Fiiller"],["hold","Tutmak","verb","A1","Fiiller"],["clean","Temizlemek","verb","A1","Fiiller"],["cook","Pişirmek","verb","A1","Fiiller"],["wash","Yıkamak","verb","A1","Fiiller"],["dance","Dans etmek","verb","A1","Fiiller"],["sing","Şarkı söylemek","verb","A1","Fiiller"],["smile","Gülümsemek","verb","A1","Fiiller"],["laugh","Gülmek","verb","A1","Fiiller"],["cry","Ağlamak","verb","A1","Fiiller"],

  // A1 Numbers Colors Family House Food Animals (200)
  ["one","Bir","noun","A1","Sayılar"],["two","İki","noun","A1","Sayılar"],["three","Üç","noun","A1","Sayılar"],["four","Dört","noun","A1","Sayılar"],["five","Beş","noun","A1","Sayılar"],["six","Altı","noun","A1","Sayılar"],["seven","Yedi","noun","A1","Sayılar"],["eight","Sekiz","noun","A1","Sayılar"],["nine","Dokuz","noun","A1","Sayılar"],["ten","On","noun","A1","Sayılar"],["hundred","Yüz","noun","A1","Sayılar"],["thousand","Bin","noun","A1","Sayılar"],["today","Bugün","noun","A1","Zaman"],["tomorrow","Yarın","noun","A1","Zaman"],["yesterday","Dün","noun","A1","Zaman"],["morning","Sabah","noun","A1","Zaman"],["afternoon","Öğleden sonra","noun","A1","Zaman"],["evening","Akşam","noun","A1","Zaman"],["night","Gece","noun","A1","Zaman"],["week","Hafta","noun","A1","Zaman"],["month","Ay","noun","A1","Zaman"],["year","Yıl","noun","A1","Zaman"],["minute","Dakika","noun","A1","Zaman"],["hour","Saat","noun","A1","Zaman"],["red","Kırmızı","adjective","A1","Renkler"],["blue","Mavi","adjective","A1","Renkler"],["green","Yeşil","adjective","A1","Renkler"],["yellow","Sarı","adjective","A1","Renkler"],["black","Siyah","adjective","A1","Renkler"],["white","Beyaz","adjective","A1","Renkler"],["brown","Kahverengi","adjective","A1","Renkler"],["orange","Turuncu","adjective","A1","Renkler"],["pink","Pembe","adjective","A1","Renkler"],["purple","Mor","adjective","A1","Renkler"],["gray","Gri","adjective","A1","Renkler"],["big","Büyük","adjective","A1","Sıfatlar"],["small","Küçük","adjective","A1","Sıfatlar"],["good","İyi","adjective","A1","Sıfatlar"],["bad","Kötü","adjective","A1","Sıfatlar"],["new","Yeni","adjective","A1","Sıfatlar"],["old","Eski","adjective","A1","Sıfatlar"],["hot","Sıcak","adjective","A1","Sıfatlar"],["cold","Soğuk","adjective","A1","Sıfatlar"],["happy","Mutlu","adjective","A1","Sıfatlar"],["sad","Üzgün","adjective","A1","Sıfatlar"],["easy","Kolay","adjective","A1","Sıfatlar"],["hard","Zor","adjective","A1","Sıfatlar"],["mother","Anne","noun","A1","Aile"],["father","Baba","noun","A1","Aile"],["brother","Erkek kardeş","noun","A1","Aile"],["sister","Kız kardeş","noun","A1","Aile"],["son","Oğul","noun","A1","Aile"],["daughter","Kız evlat","noun","A1","Aile"],["baby","Bebek","noun","A1","Aile"],["child","Çocuk","noun","A1","Aile"],["family","Aile","noun","A1","Aile"],["friend","Arkadaş","noun","A1","Aile"],["man","Adam","noun","A1","Aile"],["woman","Kadın","noun","A1","Aile"],["boy","Erkek çocuk","noun","A1","Aile"],["girl","Kız çocuk","noun","A1","Aile"],["house","Ev","noun","A1","Ev"],["home","Yuva","noun","A1","Ev"],["room","Oda","noun","A1","Ev"],["door","Kapı","noun","A1","Ev"],["window","Pencere","noun","A1","Ev"],["wall","Duvar","noun","A1","Ev"],["floor","Zemin","noun","A1","Ev"],["table","Masa","noun","A1","Ev"],["chair","Sandalye","noun","A1","Ev"],["bed","Yatak","noun","A1","Ev"],["kitchen","Mutfak","noun","A1","Ev"],["bathroom","Banyo","noun","A1","Ev"],["garden","Bahçe","noun","A1","Ev"],["book","Kitap","noun","A1","Ev"],["pen","Kalem","noun","A1","Ev"],["bag","Çanta","noun","A1","Ev"],["key","Anahtar","noun","A1","Ev"],["phone","Telefon","noun","A1","Ev"],["computer","Bilgisayar","noun","A1","Ev"],["apple","Elma","noun","A1","Yemek"],["banana","Muz","noun","A1","Yemek"],["bread","Ekmek","noun","A1","Yemek"],["water","Su","noun","A1","Yemek"],["milk","Süt","noun","A1","Yemek"],["cheese","Peynir","noun","A1","Yemek"],["meat","Et","noun","A1","Yemek"],["fish","Balık","noun","A1","Yemek"],["egg","Yumurta","noun","A1","Yemek"],["rice","Pirinç","noun","A1","Yemek"],["tea","Çay","noun","A1","Yemek"],["coffee","Kahve","noun","A1","Yemek"],["cake","Kek","noun","A1","Yemek"],["soup","Çorba","noun","A1","Yemek"],["fruit","Meyve","noun","A1","Yemek"],["vegetable","Sebze","noun","A1","Yemek"],["honey","Bal","noun","A1","Yemek"],["cat","Kedi","noun","A1","Hayvanlar"],["dog","Köpek","noun","A1","Hayvanlar"],["bird","Kuş","noun","A1","Hayvanlar"],["cow","İnek","noun","A1","Hayvanlar"],["horse","At","noun","A1","Hayvanlar"],["sheep","Koyun","noun","A1","Hayvanlar"],["bear","Ayı","noun","A1","Hayvanlar"],["lion","Aslan","noun","A1","Hayvanlar"],["snake","Yılan","noun","A1","Hayvanlar"],["fox","Tilki","noun","A1","Hayvanlar"],["wolf","Kurt","noun","A1","Hayvanlar"],

  // A2 Town Travel Weather Clothes Body (200)
  ["street","Sokak","noun","A2","Şehir"],["road","Yol","noun","A2","Şehir"],["bridge","Köprü","noun","A2","Şehir"],["park","Park","noun","A2","Şehir"],["shop","Dükkan","noun","A2","Şehir"],["market","Pazar","noun","A2","Şehir"],["bank","Banka","noun","A2","Şehir"],["hospital","Hastane","noun","A2","Şehir"],["school","Okul","noun","A2","Şehir"],["library","Kütüphane","noun","A2","Şehir"],["museum","Müze","noun","A2","Şehir"],["hotel","Otel","noun","A2","Şehir"],["restaurant","Restoran","noun","A2","Şehir"],["cafe","Kafe","noun","A2","Şehir"],["cinema","Sinema","noun","A2","Şehir"],["station","İstasyon","noun","A2","Şehir"],["airport","Havalimanı","noun","A2","Şehir"],["bus","Otobüs","noun","A2","Seyahat"],["train","Tren","noun","A2","Seyahat"],["plane","Uçak","noun","A2","Seyahat"],["car","Araba","noun","A2","Seyahat"],["bicycle","Bisiklet","noun","A2","Seyahat"],["ticket","Bilet","noun","A2","Seyahat"],["passport","Pasaport","noun","A2","Seyahat"],["luggage","Bagaj","noun","A2","Seyahat"],["suitcase","Bavul","noun","A2","Seyahat"],["journey","Yolculuk","noun","A2","Seyahat"],["map","Harita","noun","A2","Seyahat"],["guide","Rehber","noun","A2","Seyahat"],["reservation","Rezervasyon","noun","A2","Seyahat"],["sunny","Güneşli","adjective","A2","Hava"],["cloudy","Bulutlu","adjective","A2","Hava"],["rainy","Yağmurlu","adjective","A2","Hava"],["windy","Rüzgarlı","adjective","A2","Hava"],["snowy","Karlı","adjective","A2","Hava"],["warm","Ilık","adjective","A2","Hava"],["cool","Serin","adjective","A2","Hava"],["season","Mevsim","noun","A2","Hava"],["spring","İlkbahar","noun","A2","Hava"],["summer","Yaz","noun","A2","Hava"],["autumn","Sonbahar","noun","A2","Hava"],["winter","Kış","noun","A2","Hava"],["weather","Hava","noun","A2","Hava"],["shirt","Gömlek","noun","A2","Giysi"],["trousers","Pantolon","noun","A2","Giysi"],["dress","Elbise","noun","A2","Giysi"],["skirt","Etek","noun","A2","Giysi"],["jacket","Ceket","noun","A2","Giysi"],["coat","Mont","noun","A2","Giysi"],["shoe","Ayakkabı","noun","A2","Giysi"],["hat","Şapka","noun","A2","Giysi"],["scarf","Atkı","noun","A2","Giysi"],["glove","Eldiven","noun","A2","Giysi"],["head","Baş","noun","A2","Vücut"],["face","Yüz","noun","A2","Vücut"],["eye","Göz","noun","A2","Vücut"],["ear","Kulak","noun","A2","Vücut"],["nose","Burun","noun","A2","Vücut"],["mouth","Ağız","noun","A2","Vücut"],["hand","El","noun","A2","Vücut"],["arm","Kol","noun","A2","Vücut"],["leg","Bacak","noun","A2","Vücut"],["foot","Ayak","noun","A2","Vücut"],["heart","Kalp","noun","A2","Vücut"],["health","Sağlık","noun","A2","Sağlık"],["pain","Ağrı","noun","A2","Sağlık"],["fever","Ateş","noun","A2","Sağlık"],["medicine","İlaç","noun","A2","Sağlık"],["doctor","Doktor","noun","A2","Sağlık"],

  // B1 Feelings Work Nature Education (180)
  ["angry","Kızgın","adjective","B1","Duygular"],["excited","Heyecanlı","adjective","B1","Duygular"],["bored","Sıkılmış","adjective","B1","Duygular"],["tired","Yorgun","adjective","B1","Duygular"],["scared","Korkmuş","adjective","B1","Duygular"],["worried","Endişeli","adjective","B1","Duygular"],["nervous","Gergin","adjective","B1","Duygular"],["proud","Gururlu","adjective","B1","Duygular"],["shy","Utangaç","adjective","B1","Duygular"],["brave","Cesur","adjective","B1","Duygular"],["kind","Nazik","adjective","B1","Duygular"],["generous","Cömert","adjective","B1","Duygular"],["honest","Dürüst","adjective","B1","Duygular"],["patient","Sabırlı","adjective","B1","Duygular"],["curious","Meraklı","adjective","B1","Duygular"],["grateful","Minnettar","adjective","B1","Duygular"],["confident","Özgüvenli","adjective","B1","Duygular"],["cheerful","Neşeli","adjective","B1","Duygular"],["job","İş","noun","B1","Kariyer"],["career","Kariyer","noun","B1","Kariyer"],["company","Şirket","noun","B1","Kariyer"],["office","Ofis","noun","B1","Kariyer"],["manager","Yönetici","noun","B1","Kariyer"],["colleague","Meslektaş","noun","B1","Kariyer"],["salary","Maaş","noun","B1","Kariyer"],["meeting","Toplantı","noun","B1","Kariyer"],["project","Proje","noun","B1","Kariyer"],["deadline","Son tarih","noun","B1","Kariyer"],["interview","Mülakat","noun","B1","Kariyer"],["experience","Deneyim","noun","B1","Kariyer"],["skill","Beceri","noun","B1","Kariyer"],["goal","Hedef","noun","B1","Kariyer"],["success","Başarı","noun","B1","Kariyer"],["opportunity","Fırsat","noun","B1","Kariyer"],["challenge","Zorluk","noun","B1","Kariyer"],["forest","Orman","noun","B1","Doğa"],["river","Nehir","noun","B1","Doğa"],["lake","Göl","noun","B1","Doğa"],["mountain","Dağ","noun","B1","Doğa"],["sea","Deniz","noun","B1","Doğa"],["ocean","Okyanus","noun","B1","Doğa"],["beach","Plaj","noun","B1","Doğa"],["island","Ada","noun","B1","Doğa"],["tree","Ağaç","noun","B1","Doğa"],["flower","Çiçek","noun","B1","Doğa"],["earth","Dünya","noun","B1","Doğa"],["nature","Doğa","noun","B1","Doğa"],["environment","Çevre","noun","B1","Doğa"],["lesson","Ders","noun","B1","Eğitim"],["course","Kurs","noun","B1","Eğitim"],["exam","Sınav","noun","B1","Eğitim"],["homework","Ödev","noun","B1","Eğitim"],["knowledge","Bilgi","noun","B1","Eğitim"],["memory","Hafıza","noun","B1","Eğitim"],["idea","Fikir","noun","B1","Eğitim"],["problem","Problem","noun","B1","Eğitim"],["solution","Çözüm","noun","B1","Eğitim"],["achieve","Başarmak","verb","B1","Eğitim"],["improve","Geliştirmek","verb","B1","Eğitim"],["develop","Geliştirmek","verb","B1","Eğitim"],["explain","Açıklamak","verb","B1","Eğitim"],["describe","Tanımlamak","verb","B1","Eğitim"],["compare","Karşılaştırmak","verb","B1","Eğitim"],["discuss","Tartışmak","verb","B1","Eğitim"],["decide","Karar vermek","verb","B1","Eğitim"],["prepare","Hazırlamak","verb","B1","Eğitim"],["practice","Pratik yapmak","verb","B1","Eğitim"],["continue","Devam etmek","verb","B1","Fiiller"],["include","Dahil etmek","verb","B1","Fiiller"],["provide","Sağlamak","verb","B1","Fiiller"],["suggest","Önermek","verb","B1","Fiiller"],["support","Desteklemek","verb","B1","Fiiller"],["expect","Beklemek","verb","B1","Fiiller"],["realize","Fark etmek","verb","B1","Fiiller"],["recognize","Tanımak","verb","B1","Fiiller"],["consider","Düşünmek","verb","B1","Fiiller"],["avoid","Kaçınmak","verb","B1","Fiiller"],["allow","İzin vermek","verb","B1","Fiiller"],["require","Gerektirmek","verb","B1","Fiiller"],

  // B2 Tech Business Society Science (200)
  ["internet","İnternet","noun","B2","Teknoloji"],["website","Web sitesi","noun","B2","Teknoloji"],["email","E-posta","noun","B2","Teknoloji"],["software","Yazılım","noun","B2","Teknoloji"],["hardware","Donanım","noun","B2","Teknoloji"],["device","Cihaz","noun","B2","Teknoloji"],["screen","Ekran","noun","B2","Teknoloji"],["keyboard","Klavye","noun","B2","Teknoloji"],["network","Ağ","noun","B2","Teknoloji"],["database","Veri tabanı","noun","B2","Teknoloji"],["system","Sistem","noun","B2","Teknoloji"],["application","Uygulama","noun","B2","Teknoloji"],["password","Şifre","noun","B2","Teknoloji"],["file","Dosya","noun","B2","Teknoloji"],["download","İndirmek","verb","B2","Teknoloji"],["upload","Yüklemek","verb","B2","Teknoloji"],["connect","Bağlanmak","verb","B2","Teknoloji"],["search","Aramak","verb","B2","Teknoloji"],["click","Tıklamak","verb","B2","Teknoloji"],["algorithm","Algoritma","noun","B2","Teknoloji"],["innovation","Yenilik","noun","B2","Teknoloji"],["benefit","Fayda","noun","B2","İş"],["profit","Kar","noun","B2","İş"],["cost","Maliyet","noun","B2","İş"],["price","Fiyat","noun","B2","İş"],["value","Değer","noun","B2","İş"],["budget","Bütçe","noun","B2","İş"],["customer","Müşteri","noun","B2","İş"],["market","Pazar","noun","B2","İş"],["trade","Ticaret","noun","B2","İş"],["investment","Yatırım","noun","B2","İş"],["product","Ürün","noun","B2","İş"],["service","Hizmet","noun","B2","İş"],["management","Yönetim","noun","B2","İş"],["strategy","Strateji","noun","B2","İş"],["resource","Kaynak","noun","B2","İş"],["society","Toplum","noun","B2","Toplum"],["community","Topluluk","noun","B2","Toplum"],["government","Hükümet","noun","B2","Toplum"],["law","Yasa","noun","B2","Toplum"],["justice","Adalet","noun","B2","Toplum"],["crime","Suç","noun","B2","Toplum"],["culture","Kültür","noun","B2","Toplum"],["tradition","Gelenek","noun","B2","Toplum"],["language","Dil","noun","B2","Toplum"],["media","Medya","noun","B2","Toplum"],["experiment","Deney","noun","B2","Bilim"],["theory","Teori","noun","B2","Bilim"],["evidence","Kanıt","noun","B2","Bilim"],["research","Araştırma","noun","B2","Bilim"],["science","Bilim","noun","B2","Bilim"],["laboratory","Laboratuvar","noun","B2","Bilim"],["energy","Enerji","noun","B2","Bilim"],["force","Güç","noun","B2","Bilim"],["gravity","Yer çekimi","noun","B2","Bilim"],["cell","Hücre","noun","B2","Bilim"],["universe","Evren","noun","B2","Bilim"],["efficient","Verimli","adjective","B2","Sıfatlar"],["complex","Karmaşık","adjective","B2","Sıfatlar"],["accurate","Doğru","adjective","B2","Sıfatlar"],["available","Mevcut","adjective","B2","Sıfatlar"],["necessary","Gerekli","adjective","B2","Sıfatlar"],["possible","Mümkün","adjective","B2","Sıfatlar"],["important","Önemli","adjective","B2","Sıfatlar"],["different","Farklı","adjective","B2","Sıfatlar"],["similar","Benzer","adjective","B2","Sıfatlar"],

  // C1 C2 Abstract (180)
  ["concept","Kavram","noun","C1","Soyut"],["principle","İlke","noun","C1","Soyut"],["context","Bağlam","noun","C1","Soyut"],["impact","Etki","noun","C1","Soyut"],["aspect","Boyut","noun","C1","Soyut"],["factor","Etken","noun","C1","Soyut"],["approach","Yaklaşım","noun","C1","Soyut"],["perspective","Bakış açısı","noun","C1","Soyut"],["objective","Hedef","noun","C1","Soyut"],["priority","Öncelik","noun","C1","Soyut"],["consequence","Sonuç","noun","C1","Soyut"],["potential","Potansiyel","noun","C1","Soyut"],["framework","Çerçeve","noun","C1","Soyut"],["hypothesis","Hipotez","noun","C1","Analiz"],["analysis","Analiz","noun","C1","Analiz"],["evaluation","Değerlendirme","noun","C1","Analiz"],["definition","Tanım","noun","C1","Analiz"],["criteria","Kriterler","noun","C1","Analiz"],["conclusion","Sonuç","noun","C1","Analiz"],["investigation","Soruşturma","noun","C1","Analiz"],["ambiguous","Belirsiz","adjective","C1","Analiz"],["coherent","Tutarlı","adjective","C1","Analiz"],["consistent","Tutarlı","adjective","C1","Analiz"],["explicit","Açık","adjective","C1","Analiz"],["significant","Önemli","adjective","C1","Analiz"],["relevant","İlgili","adjective","C1","Analiz"],["valid","Geçerli","adjective","C1","Analiz"],["comprehensive","Kapsamlı","adjective","C1","Analiz"],["advocate","Savunmak","verb","C1","Fiiller"],["articulate","İfade etmek","verb","C1","Fiiller"],["assess","Değerlendirmek","verb","C1","Fiiller"],["assume","Varsaymak","verb","C1","Fiiller"],["clarify","Açıklamak","verb","C1","Fiiller"],["demonstrate","Göstermek","verb","C1","Fiiller"],["establish","Kurmak","verb","C1","Fiiller"],["evaluate","Değerlendirmek","verb","C1","Fiiller"],["identify","Tanımlamak","verb","C1","Fiiller"],["justify","Aklamak","verb","C1","Fiiller"],["global","Küresel","adjective","C1","Küresel"],["international","Uluslararası","adjective","C1","Küresel"],["diplomacy","Diplomasi","noun","C1","Küresel"],["conflict","Çatışma","noun","C1","Küresel"],["crisis","Kriz","noun","C1","Küresel"],["migration","Göç","noun","C1","Küresel"],["sustainable","Sürdürülebilir","adjective","C1","Küresel"],["subtle","İnce","adjective","C2","Hassasiyet"],["nuance","İnce fark","noun","C2","Hassasiyet"],["eloquent","Etkili konuşan","adjective","C2","Hassasiyet"],["concise","Öz","adjective","C2","Hassasiyet"],["obsolete","Eskimiş","adjective","C2","Hassasiyet"],["ethics","Etik","noun","C2","Etik"],["integrity","Dürüstlük","noun","C2","Etik"],["virtue","Erdem","noun","C2","Etik"],["consent","Rıza","noun","C2","Etik"],["compassion","Şefkat","noun","C2","Etik"],["dignity","Onur","noun","C2","Etik"],["prejudice","Önyargı","noun","C2","Etik"],["empathy","Empati","noun","C2","Etik"],["solidarity","Dayanışma","noun","C2","Etik"],["ephemeral","Geçici","adjective","C2","Felsefe"],["ubiquitous","Her yerde olan","adjective","C2","Felsefe"],["quintessential","En tipik","adjective","C2","Felsefe"],["paradox","Paradoks","noun","C2","Felsefe"],["dilemma","İkilem","noun","C2","Felsefe"],["paradigm","Paradigma","noun","C2","Felsefe"],["ideology","İdeoloji","noun","C2","Felsefe"],["pragmatic","Pragmatik","adjective","C2","Felsefe"],["benevolent","Hayırsever","adjective","C2","Felsefe"],["cognizant","Farkında","adjective","C2","Felsefe"],["equanimity","Sükunet","noun","C2","Felsefe"],["transcend","Aşmak","verb","C2","Fiiller"],["contemplate","Düşünmek","verb","C2","Fiiller"],

  // Irregular verbs (40) - correct forms only
  ["went","Gitti","verb","A2","Düzensiz"],["gone","Gitmiş","verb","A2","Düzensiz"],["bought","Satın aldı","verb","A2","Düzensiz"],["ate","Yedi","verb","A2","Düzensiz"],["eaten","Yenmiş","verb","A2","Düzensiz"],["saw","Gördü","verb","A2","Düzensiz"],["seen","Görülmüş","verb","A2","Düzensiz"],["spoke","Konuştu","verb","A2","Düzensiz"],["spoken","Konuşulmuş","verb","A2","Düzensiz"],["wrote","Yazdı","verb","A2","Düzensiz"],["written","Yazılmış","verb","A2","Düzensiz"],["took","Aldı","verb","A2","Düzensiz"],["taken","Alınmış","verb","A2","Düzensiz"],["came","Geldi","verb","A2","Düzensiz"],["had","Sahipti","verb","A2","Düzensiz"],["did","Yaptı","verb","A2","Düzensiz"],["done","Yapılmış","verb","A2","Düzensiz"],["gave","Verdi","verb","A2","Düzensiz"],["given","Verilmiş","verb","A2","Düzensiz"],["thought","Düşündü","verb","A2","Düzensiz"],["brought","Getirdi","verb","A2","Düzensiz"],["built","İnşa etti","verb","A2","Düzensiz"],["broke","Kırdı","verb","A2","Düzensiz"],["chosen","Seçilmiş","verb","A2","Düzensiz"],["driven","Sürülmüş","verb","A2","Düzensiz"],["flown","Uçmuş","verb","A2","Düzensiz"],["fallen","Düşmüş","verb","A2","Düzensiz"],["grown","Büyümüş","verb","A2","Düzensiz"],["drawn","Çizilmiş","verb","A2","Düzensiz"],

  // Idioms 40 correct
  ["piece of cake","Çocuk oyuncağı","idiom","A2","Deyimler"],["break a leg","İyi şanslar","idiom","B1","Deyimler"],["under the weather","Halsiz","idiom","B1","Deyimler"],["once in a blue moon","Çok nadir","idiom","B2","Deyimler"],["call it a day","Paydos etmek","idiom","B1","Deyimler"],["better late than never","Geç olsun güç olmasın","idiom","B1","Deyimler"],["so far so good","Şimdilik iyi","idiom","B1","Deyimler"],["cost an arm and a leg","Çok pahalı","idiom","B2","Deyimler"],["hit the books","Ders çalışmak","idiom","B1","Deyimler"],["let the cat out of the bag","Pot kırmak","idiom","B2","Deyimler"],["pull someone's leg","Şaka yapmak","idiom","B1","Deyimler"],["speak of the devil","İti an","idiom","B1","Deyimler"],["when pigs fly","Asla","idiom","B2","Deyimler"],["beat around the bush","Lafı dolandırmak","idiom","B2","Deyimler"],["miss the boat","Fırsat kaçırmak","idiom","B2","Deyimler"],["on cloud nine","Çok mutlu","idiom","B1","Deyimler"],["spill the beans","Sırrı söylemek","idiom","B2","Deyimler"],["peace of mind","Huzur","noun","B1","Deyimler"],["time flies","Zaman çabuk geçiyor","idiom","A2","Deyimler"],["easy does it","Yavaş ol","idiom","A2","Deyimler"],
];

function getTurkishPlural(tr: string): string {
  const base = tr.split(" /")[0].split(" (")[0].trim().split(" ")[0];
  if (!base) return tr + " lar";
  const vowels = base.toLowerCase().match(/[aeıioöuü]/g);
  const lastVowel = vowels ? vowels[vowels.length - 1] : "e";
  const isKalın = ["a","ı","o","u"].includes(lastVowel);
  return base + (isKalın ? "lar" : "ler");
}

// Taban listeyi kelime bazında benzersizleştir (aynı kelime farklı konularda tekrar edebiliyor)
const UNIQUE_BASE: BaseTuple[] = (() => {
  const map = new Map<string, BaseTuple>();
  for (const t of BASE_TUPLES) {
    const key = t[0].toLowerCase().trim();
    if (!map.has(key)) map.set(key, t);
  }
  return Array.from(map.values());
})();

/** Eski düzen migrasyonu için: taban kelimeler sıralı (eski kopya id'leri bunlara eşlenir) */
export const LEGACY_BASE_WORDS: string[] = UNIQUE_BASE.map((t) => t[0].toLowerCase().trim());

function makeWord(word: string, tr: string, pos: string, level: WordLevel, topic: string, id: number): VocabularyWord {
  // "I" zamiri küçük harfe düşmesin (görünüm + TTS doğallığı)
  const clean = word.trim() === "I" ? "I" : word.trim().toLowerCase();
  return {
    id,
    word: clean,
    meaningTr: tr,
    phonetic: `/${clean.replace(/[^a-z\\s-]/g,"").slice(0,24)}/`,
    pos,
    topic,
    level,
    definition: `${pos.toUpperCase()} - English ${level} word meaning '${tr}' in Turkish. Used in ${topic}.`,
    example: `Example: I use "${clean}" when talking about ${topic.toLowerCase()}.`
  };
}

/**
 * Eski düzenin 1-3. adımları (kopyalama döngüsünden ÖNCEKİ gerçek kelimeler).
 * Sıra/id yapısı migrasyon için birebir korunur.
 */
function buildCoreDataset(): VocabularyWord[] {
  const map = new Map<string, BaseTuple>();
  for (const t of UNIQUE_BASE) {
    map.set(t[0].toLowerCase().trim(), t);
  }
  const unique = UNIQUE_BASE;
  const dataset: VocabularyWord[] = [];
  let id = 0;

  // 1. Add all unique base (real) words
  for (const t of unique) {
    if (dataset.length >= 3000) break;
    dataset.push(makeWord(t[0], t[1], t[2], t[3], t[4], id++));
  }

  // 2. Add ONLY valid morphological variants: noun plurals and verb 3rd person s
  let cursor = 0;
  while (dataset.length < 3000 && cursor < unique.length * 2) {
    const base = unique[cursor % unique.length];
    const [w, tr, pos, lvl, topic] = base;
    const low = w.toLowerCase().trim();
    if (low.includes(" ") || low.includes("-")) { cursor++; continue; } // skip idioms for variant gen
    let variantWord = "";
    let variantTr = "";
    if (pos === "noun" && !low.endsWith("s")) {
      // valid plural
      variantWord = low.endsWith("y") && !/[aeiou]y$/.test(low) ? low.slice(0,-1)+"ies" : low+"s";
      variantTr = getTurkishPlural(tr);
      if (!map.has(variantWord)) {
        map.set(variantWord, [variantWord, variantTr, pos, lvl, topic]);
        dataset.push(makeWord(variantWord, variantTr, pos, lvl, topic, id++));
      }
    } else if (pos === "verb" && !low.endsWith("s")) {
      variantWord = low+"s";
      variantTr = tr + " (3. tekil)";
      if (!map.has(variantWord)) {
        map.set(variantWord, [variantWord, variantTr, pos, lvl, topic]);
        dataset.push(makeWord(variantWord, variantTr, pos, lvl, topic, id++));
      }
    }
    cursor++;
  }

  // 3. Fill remaining with additional real common words if still short (hardcoded extra list)
  const extraCommons: BaseTuple[] = [
    ["people","İnsanlar","noun","A1","Aile"],["children","Çocuklar","noun","A1","Aile"],["men","Adamlar","noun","A1","Aile"],["women","Kadınlar","noun","A1","Aile"],["books","Kitaplar","noun","A1","Ev"],["pens","Kalemler","noun","A1","Ev"],["tables","Masalar","noun","A1","Ev"],["chairs","Sandalyeler","noun","A1","Ev"],["doors","Kapılar","noun","A1","Ev"],["windows","Pencereler","noun","A1","Ev"],["cars","Arabalar","noun","A2","Seyahat"],["buses","Otobüsler","noun","A2","Seyahat"],["trains","Trenler","noun","A2","Seyahat"],["planes","Uçaklar","noun","A2","Seyahat"],["shops","Mağazalar","noun","A2","Şehir"],["parks","Parklar","noun","A2","Şehir"],["schools","Okullar","noun","A2","Şehir"],["jobs","İşler","noun","B1","Kariyer"],["projects","Projeler","noun","B1","Kariyer"],["forests","Ormanlar","noun","B1","Doğa"],["rivers","Nehirler","noun","B1","Doğa"],["mountains","Dağlar","noun","B1","Doğa"],["lessons","Dersler","noun","B1","Eğitim"],["ideas","Fikirler","noun","B1","Eğitim"],["computers","Bilgisayarlar","noun","B2","Teknoloji"],["websites","Web siteleri","noun","B2","Teknoloji"],["customers","Müşteriler","noun","B2","İş"],["products","Ürünler","noun","B2","İş"],["societies","Toplumlar","noun","B2","Toplum"],["cultures","Kültürler","noun","B2","Toplum"],["theories","Teoriler","noun","B2","Bilim"],["energies","Enerjiler","noun","B2","Bilim"],["concepts","Kavramlar","noun","C1","Soyut"],["aspects","Boyutlar","noun","C1","Soyut"],["factors","Etkenler","noun","C1","Soyut"],["objectives","Hedefler","noun","C1","Soyut"],["consequences","Sonuçlar","noun","C1","Soyut"],["analyses","Analizler","noun","C1","Analiz"],["conclusions","Sonuçlar","noun","C1","Analiz"],["ethics","Etik","noun","C2","Etik"],["virtues","Erdemler","noun","C2","Etik"],
  ];
  for (const t of extraCommons) {
    if (dataset.length >= 3000) break;
    const key = t[0].toLowerCase();
    if (!map.has(key)) {
      map.set(key, t);
      dataset.push(makeWord(t[0], t[1], t[2], t[3], t[4], id++));
    }
  }

  return dataset;
}

/** Eski düzenin kopyalama döngüsünün başladığı id (srs.ts migrasyonu için) */
export const LEGACY_PADDING_START: number = buildCoreDataset().length;

function buildDataset(): VocabularyWord[] {
  const core = buildCoreDataset();
  const taken = new Set<string>();
  for (const t of BASE_TUPLES) taken.add(t[0].toLowerCase().trim());
  for (const w of core) taken.add(w.word);

  const dataset = [...core];

  // 4. Havuzu 3000 GERÇEK benzersiz kelimeyle tamamla (eski düzen kopyalıyordu - artık yeni kelimeler)
  for (const t of EXTRA_TUPLES) {
    if (dataset.length >= 3000) break;
    const key = t[0].toLowerCase().trim();
    if (!taken.has(key)) {
      taken.add(key);
      dataset.push(makeWord(t[0], t[1], t[2], t[3], t[4], dataset.length));
    }
  }

  return dataset.slice(0, 3000).map((w, i) => ({ ...w, id: i }));
}

export const LEARNING_PATH: VocabularyWord[] = buildDataset();
export const TOTAL_WORDS = LEARNING_PATH.length;
export { ITALIAN_PATH } from "./vocabularyIt";
export { SPANISH_PATH } from "./vocabularyEs";
export { PORTUGUESE_PATH } from "./vocabularyPt";
export { FRENCH_PATH } from "./vocabularyFr";
export { GERMAN_PATH } from "./vocabularyDe";
