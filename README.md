# Online-Shop

Ein Beispiel-Online-Shop mit **Next.js** im Frontend und **NestJS** im Backend, entwickelt als Demonstration für Bewerbungen und Projekte.

## Anstehende Features

- Admin-Funktion: **Nutzer löschen** 
- Produkt Detail
  - Updaten der Bilder des Produktes
- Navigation über eine **Navbar**  
- Grundlegende Warenfunktionen:
  - **Warenkorb-Funktion:** Produkte in den Warenkorb legen  
  - **Filter & Suche:** Produkte nach Kategorien, Name oder Preis filtern  
  - **Bestellung drucken:** Möglichkeit, den aktuellen Warenkorb als Bestellung zu drucken 

## Installation

1. Repository klonen:
```bash
  git clone https://github.com/till-priv-acc/Online-shop-CoBe.git
```

2. Frontend benutzen

```bash
  cd frontend
  npm install
  npm run dev
```

3. Backend benutzen
```bash
  cd backend
  npm install
  npm run start:dev
```

## Technologie-Stack

- **Frontend**: Next.js, Material UI

- **Backend**: NestJS, SQLite (oder andere DB)

- **Authentifizierung**: Session-basiert (bereits implementiert)

## Nutzung

Frontend unter http://localhost:3000

Backend unter http://localhost:3001

## Projektstruktur

```text
  /frontend
    /api
    /login
    /userpage
    /product
      /create
      /[id]
  /lib
  /components
  /constants
  /public

  /backend
    /src
      /users
        /entity
      /products
        /entity
        /DTO
```

## Aufbau Struktur

### Frontend

- **/api**  
  Enthält interne Next.js API-Routen, für Bild Uploads oder löschen

- **/login**  
  Seiten für Login-Funktionalität.

- **/userpage**  
  Seiten für User-Dashboard oder Profilansichten.

- **/product**  
  Enthält alles rund um Produktseiten:  
  - `/create` → Seite zum Anlegen neuer Produkte  
  - `/[id]` → dynamische Route für einzelne Produktdetails oder Editieren

- **/components**  
  Seiten für User-Dashboard oder Profilansichten.

- **/lib**  
  Allgemeine Bibliotheken, Hooks oder Utilities, z. B. API-Clients, Form-Handler, Auth-Helper.

- **/constants**  
  Globale Konstanten wie Farbwerte, Kategorien, Enum-Typen, Rollen etc.

- **/public**  
  Statische Dateien wie Bilder, Icons, Fonts, die direkt vom Frontend geladen werden.

---

## Backend

- **/src/users/entity**  
  Datenbank-Entities für User (TypeORM), z. B. `UserEntity`.  
  Definiert Tabellenstruktur und Relations zu anderen Entities.

- **/src/products/entity**  
  Datenbank-Entities für Produkte (TypeORM), z. B. `ProductEntity` und `PictureEntity`.  
  Enthält Spalten, Primärschlüssel, Foreign Keys, Relation-Optionen (z. B. `CASCADE`).

- **/src/products/DTO**  
  Data Transfer Objects für Produkte, z. B.:  
  - `ProductCreateDTO`  
  - `ProductUpdateDTO`  
  - `PictureCallDTO`  
  Diese definieren die Datenstruktur für Requests und Responses zwischen Frontend und Backend.

## Aktuelle Bilder

![User Bereich](./screenshots/user-details.png)

**User-Detailbereich**  
Aktuell werden hier Pro-Forma-Invoices dargestellt und die Userdaten.

![Admin User Tabelle](./screenshots/user-table.png)

**Admin-Bereich – User-Tabelle**  
Zentrale Übersicht aller registrierten Nutzer.  
Es stehen aktuell **2 Filtermöglichkeiten** sowie **3 Sortieroptionen** zur Verfügung.

![Alle Produkte](./screenshots/products.png)

**Produkt Bereich**  
Hier werden einmal alle Produkte dargestellt

![Produkt Detail](./screenshots/product-detail.png)

**User-Detailbereich**  
Produkt Detail Daten und Aktionen wie upadte und Delete