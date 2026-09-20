# Fusion 360 Script: erzeugt einen Volumenkoerper mit 50 x 50 mm Grundflaeche.
#
# Ausfuehren ueber: Fusion 360 -> Dienstprogramme -> SKRIPTS UND ADD-INS -> Skripts
#
# Masse in Millimeter anpassen:
WIDTH_MM = 50.0     # Breite (X)
DEPTH_MM = 50.0     # Tiefe  (Y)
HEIGHT_MM = 50.0    # Hoehe  (Z) -- auf z.B. 10.0 setzen fuer eine 50x50x10 Platte

BODY_NAME = 'Block 50x50'

import traceback

import adsk.core
import adsk.fusion

# Die Fusion-API rechnet intern in Zentimetern.
MM_TO_CM = 0.1


def run(context):
    ui = None
    try:
        app = adsk.core.Application.get()
        ui = app.userInterface

        design = adsk.fusion.Design.cast(app.activeProduct)
        if not design:
            ui.messageBox('Bitte zuerst ein Konstruktionsdokument in der Umgebung "Konstruktion" oeffnen.')
            return

        root = design.rootComponent

        # Rechteck 50 x 50 mm mittig um den Ursprung auf der XY-Ebene skizzieren.
        sketch = root.sketches.add(root.xYConstructionPlane)
        sketch.name = 'Grundflaeche {0:g}x{1:g} mm'.format(WIDTH_MM, DEPTH_MM)

        half_width = WIDTH_MM * MM_TO_CM / 2.0
        half_depth = DEPTH_MM * MM_TO_CM / 2.0
        sketch.sketchCurves.sketchLines.addTwoPointRectangle(
            adsk.core.Point3D.create(-half_width, -half_depth, 0.0),
            adsk.core.Point3D.create(half_width, half_depth, 0.0))

        # Profil zu einem Volumenkoerper extrudieren.
        extrudes = root.features.extrudeFeatures
        ext_input = extrudes.createInput(
            sketch.profiles.item(0),
            adsk.fusion.FeatureOperations.NewBodyFeatureOperation)
        ext_input.setDistanceExtent(
            False, adsk.core.ValueInput.createByReal(HEIGHT_MM * MM_TO_CM))
        extrude = extrudes.add(ext_input)
        extrude.name = 'Extrusion {0:g} mm'.format(HEIGHT_MM)
        extrude.bodies.item(0).name = BODY_NAME

        app.activeViewport.fit()

    except:  # noqa: E722 - Fusion erwartet hier einen Catch-all
        if ui:
            ui.messageBox('Fehler beim Erstellen des Koerpers:\n{0}'.format(traceback.format_exc()))
