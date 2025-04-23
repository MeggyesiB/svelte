# Personal Finance Dashboard (SvelteKit)
Ez egy SvelteKit alkalmazás személyes pénzügyek követésére, tranzakciók rögzítésére, kategorizálására és megjelenítésére.

## Főbb Funkciók
*   **Tranzakciókezelés:** Új tranzakciók (bevétel/kiadás) hozzáadása, meglévők listázása és törlése.
*   **Kategóriák:** Tranzakciók kategorizálása, kategóriák kezelése.
*   **Dashboard:** Áttekintő műszerfal a legutóbbi tranzakciókkal, havi pénzügyi összesítőkkel (HUF/EUR bontásban), és kiadási diagramokkal.
*   **Diagramok:** Költések megjelenítése kategóriánként (kördiagram) és havi bevétel/kiadás trend (oszlopdiagram) a Chart.js segítségével.
*   **Árfolyamkezelés:** Külső API (Frankfurter.app) használata az EUR/HUF árfolyam lekérdezésére és a számításokhoz való felhasználására.
*   **Adatbázis:** SQLite adatbázis (`better-sqlite3`) a perzisztens adattároláshoz.


## Felhasznált Technológiák
*   TypeScript
*   Vite
*   SQLite (`better-sqlite3`)
*   Chart.js
*   Frankfurter.app API
