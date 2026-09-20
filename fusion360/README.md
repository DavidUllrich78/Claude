# Fusion 360 Skripte

## CreateBox50x50

Erzeugt einen Volumenkörper mit 50 × 50 mm Grundfläche (Standardhöhe 50 mm, also ein Würfel),
mittig um den Ursprung auf der XY-Ebene.

### Installation

1. Ordner `CreateBox50x50` (mit `.py` und `.manifest`) in das Fusion-Skriptverzeichnis kopieren:
   - **Windows:** `%APPDATA%\Autodesk\Autodesk Fusion 360\API\Scripts\`
   - **macOS:** `~/Library/Application Support/Autodesk/Autodesk Fusion 360/API/Scripts/`

   Alternativ in Fusion über *Dienstprogramme → SKRIPTS UND ADD-INS → Skripts → „+“* den Ordner hinzufügen.

### Ausführen

1. Ein Konstruktionsdokument öffnen (Umgebung *Konstruktion*).
2. *Dienstprogramme → SKRIPTS UND ADD-INS* (Tastenkürzel `Shift+S`).
3. `CreateBox50x50` auswählen → *Ausführen*.

### Maße ändern

Die Konstanten am Anfang von `CreateBox50x50.py` anpassen (alle Werte in mm):

```python
WIDTH_MM  = 50.0   # Breite (X)
DEPTH_MM  = 50.0   # Tiefe  (Y)
HEIGHT_MM = 50.0   # Höhe   (Z) – z. B. 10.0 für eine 50 × 50 × 10 mm Platte
```
