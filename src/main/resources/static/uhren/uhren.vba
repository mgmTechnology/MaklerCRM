Option Explicit    ' Sorgt dafür, dass alle Variablen deklariert sein müssen


' ----------------------------------------------------------
'  GLOBALE VARIABLEN
'  (Scripting.Dictionary für Uhrtypen und Hersteller)
' ----------------------------------------------------------
Dim dictUhrtyp As Object
Dim dictHersteller As Object


'===========================================================
'        1) GRUNDFUNKTIONEN (Hauptablauf / Hauptmakros)
'===========================================================

' ----------------------------------------------------------
'  Sub: BlattVerzeichnisErstellen
'  Zweck:
'   - Erzeugt / aktualisiert das "Verzeichnis"-Blatt
'   - Schreibt die Daten aller Uhrenblätter (B5, B6, B7, B8, B10, B11) ins Verzeichnis
'   - Führt Statistik durch (Uhrtypen, Hersteller)
'   - Zeigt Gesamtpreis an und Anzahl verkaufter Uhren
' ----------------------------------------------------------
Sub BlattVerzeichnisErstellen()
    Dim ws As Worksheet             ' Schleifenvariable für alle Blätter
    Dim verzeichnisWs As Worksheet  ' Zielblatt "Verzeichnis"
    Dim lastRow As Long             ' Letzte verwendete Zeile im Verzeichnis
    Dim i As Long                   ' Zähler für "Laufende Nummer"
    Dim gesamtSummePreis As Double  ' Gesamtsumme Preise
    Dim anzahlVerkaufterUhren As Long
    
    ' 1) Blattnamen nach B6/B8 aktualisieren
    BlattNamenErstellen
    
    ' 2) Laufende Nummer in jedem Blatt eintragen
    TrageLaufendeNummerEin
    
    ' 3) "Verzeichnis" (neu) anlegen oder zuweisen
    SetOrCreateWorksheet verzeichnisWs, "Verzeichnis"
    
    ' 4) Alte Inhalte entfernen und Kopfzeilen setzen
    ClearAndSetHeadings verzeichnisWs
    
    ' 5) Links in B10/E8: "Shop"/"YT" anpassen
    ChangeTextOfShopAndVideoLinks
    
    ' 6) Zoomfaktor (95%) auf allen Blättern (außer "Verzeichnis"/"Template")
    SetzeZoomFaktor
    
    ' 7) Daten in "Verzeichnis" kopieren (alle Blätter außer "Verzeichnis"/"Template")
    i = 1
    For Each ws In Worksheets
        If ws.Name <> "Verzeichnis" And ws.Name <> "Template" Then
            lastRow = verzeichnisWs.Cells(verzeichnisWs.Rows.Count, "A").End(xlUp).Row + 1
            
            ' Füllt Verzeichniszeile mit Daten aus diesem Blatt
            FillDirectory verzeichnisWs, ws, lastRow, i
            i = i + 1
            
            ' Zähle verkaufte Uhren = leere B5
            If IsEmpty(ws.Range("B5")) Then
                anzahlVerkaufterUhren = anzahlVerkaufterUhren + 1
            End If
        End If
    Next ws
    
    ' 8) Statistische Auswertung (Uhrtyp, Hersteller)
    Set dictUhrtyp = CreateObject("Scripting.Dictionary")
    Set dictHersteller = CreateObject("Scripting.Dictionary")
    PerformStatisticalAnalysis verzeichnisWs, lastRow, dictUhrtyp, dictHersteller
    
    ' 9) Preise summieren
    gesamtSummePreis = CalculateTotalPrice(verzeichnisWs, lastRow)
    
    ' 10) Gesamtsumme, Anzahl etc. ausgeben
    lastRow = lastRow + 1
    
    With verzeichnisWs
        ' Schriftzug
        .Cells(lastRow + 1, 1).Value = "Gesamtsumme der Preise:"
        .Cells(lastRow + 1, 1).Font.Bold = True
        
        ' Gesamtpreis in Spalte C
        .Cells(lastRow + 1, 3).Value = gesamtSummePreis
        .Cells(lastRow + 1, 3).NumberFormat = "#,##0.00 €"
        .Cells(lastRow + 1, 3).Font.Bold = True
        
        ' Anzahl "aktiver" (verkaufter vs. nicht verkaufter)
        .Cells(lastRow + 1, 2).Value = (lastRow - 2) - anzahlVerkaufterUhren
        .Cells(lastRow + 1, 2).Font.Bold = True
        
        ' Ausgeben der Anzahl verkaufter Uhren
        .Cells(lastRow + 1, 5).Value = "Anzahl verkaufter Uhren:"
        .Cells(lastRow + 1, 5).Font.Bold = True
        .Cells(lastRow + 1, 6).Value = anzahlVerkaufterUhren
        .Cells(lastRow + 1, 6).Font.Bold = True
    End With
End Sub


' ----------------------------------------------------------
'  Sub: PerformStatisticalAnalysis
'  Zweck:
'    - Füllt die Dictionary-Objekte (dictUhrtyp, dictHersteller)
'    - Ruft WriteStatistics auf, damit Statistik ins Blatt geschrieben wird
' ----------------------------------------------------------
Sub PerformStatisticalAnalysis(ByRef verzeichnisWs As Worksheet, ByVal lastRow As Long, ByRef dictUhrtyp As Object, ByRef dictHersteller As Object)
    Dim i As Long
    Dim uhrtyp As Variant
    Dim Hersteller As Variant
    
    ' Auslesen 2..lastRow aus dem "Verzeichnis"
    For i = 2 To lastRow
        uhrtyp = verzeichnisWs.Cells(i, 6).Value      ' Spalte F = Uhrtyp
        Hersteller = verzeichnisWs.Cells(i, 4).Value  ' Spalte D = Hersteller
        
        ' Uhrtyp hochzählen
        If Not dictUhrtyp.Exists(uhrtyp) Then
            dictUhrtyp(uhrtyp) = 1
        Else
            dictUhrtyp(uhrtyp) = dictUhrtyp(uhrtyp) + 1
        End If
        
        ' Hersteller hochzählen
        If Not dictHersteller.Exists(Hersteller) Then
            dictHersteller(Hersteller) = 1
        Else
            dictHersteller(Hersteller) = dictHersteller(Hersteller) + 1
        End If
    Next i
    
    ' Statistik (Häufigkeitstabellen) unten anfügen
    WriteStatistics verzeichnisWs, lastRow, dictUhrtyp, dictHersteller
End Sub


'===========================================================
'     2) HILFSFUNKTIONEN (zur Datenerfassung/-ausgabe)
'===========================================================

' ----------------------------------------------------------
'  Function: CalculateTotalPrice
'  Zweck:
'    - Summiert die Werte in Spalte C von Zeile 2 bis lastRow
'    - Rückgabewert: Double (Gesamtsumme)
' ----------------------------------------------------------
Function CalculateTotalPrice(ByVal ws As Worksheet, ByVal lastRow As Long) As Double
    Dim totalPrice As Double
    Dim i As Long
    
    totalPrice = 0
    
    For i = 2 To lastRow
        totalPrice = totalPrice + ws.Cells(i, 3).Value
    Next i
    
    CalculateTotalPrice = totalPrice
End Function


' ----------------------------------------------------------
'  Sub: ClearAndSetHeadings
'  Zweck:
'    - Löscht den Inhaltsbereich ab Zeile 2 in "Verzeichnis"
'    - Setzt die Kopfzeilen in Zeile 1 (A..K)
' ----------------------------------------------------------
Sub ClearAndSetHeadings(ByRef ws As Worksheet)
    With ws
        .Range("A2:Z" & .Rows.Count).Clear   ' Inhalt ab Zeile 2 löschen
        
        ' Überschriften definieren
        .Range("A1").Value = "Laufende Nummer"
        .Range("B1").Value = "Blattname"
        .Range("C1").Value = "Preis"
        .Range("D1").Value = "Hersteller"
        .Range("E1").Value = "Typ"       ' Spalte 5
        .Range("F1").Value = "Untertyp"  ' B7
        .Range("G1").Value = "Google"
        .Range("H1").Value = "YouTube"
        .Range("I1").Value = "eBay"
        .Range("J1").Value = "Review"    ' Spalte 10
        .Range("K1").Value = "aka"
    End With
End Sub


' ----------------------------------------------------------
'  Sub: FillDirectory
'  Zweck:
'    - Schreibt Informationen (B5, B6, B7, B8, B11...) ins Verzeichnis
'    - Erzeugt Hyperlinks (zum Blatt, Review-Spalte J, Google/YouTube/eBay)
'    - Graue Hinterlegung bei leeren B5 (verkauft)
' ----------------------------------------------------------
Sub FillDirectory(ByRef verzeichnisWs As Worksheet, ByRef ws As Worksheet, ByVal lastRow As Long, ByVal i As Long)
    With verzeichnisWs
        ' Spalte A: Laufende Nummer
        .Cells(lastRow, 1).Value = i
        
        ' Spalte B: Hyperlink zum Datenblatt
        .Hyperlinks.Add Anchor:=.Cells(lastRow, 2), _
                        Address:="", _
                        SubAddress:="'" & ws.Name & "'!A1", _
                        textToDisplay:=ws.Name
        
        ' Spalte C: Preis (B5)
        .Cells(lastRow, 3).Value = ws.Range("B5").Value
        .Cells(lastRow, 3).NumberFormat = "#,##0.00 €"
        
        ' Spalte D: Hersteller (B6)
        .Cells(lastRow, 4).Value = ws.Range("B6").Value
        
        ' Spalte E: Modell (B8)
        .Cells(lastRow, 5).Value = ws.Range("B8").Value
        .Cells(lastRow, 5).HorizontalAlignment = xlLeft
        
        ' Spalte F: Untertyp (B7)
        .Cells(lastRow, 6).Value = ws.Range("B7").Value
        
        ' Spalte K: aka (B11)
        .Cells(lastRow, 11).Value = ws.Range("B11").Value
        
        ' Graue Hinterlegung, wenn B5 leer (verkauft)
        If IsEmpty(ws.Range("B5")) Then
            .Range(.Cells(lastRow, 1), .Cells(lastRow, 11)).Interior.Color = RGB(240, 240, 240)
        End If
        
        ' Review-Link (B10) in Spalte J
        If ws.Range("B10").Hyperlinks.Count > 0 Then
            Dim linkAddress As String
            linkAddress = ws.Range("B10").Hyperlinks(1).Address
            
            ' Entferne Prefix "https://www.youtube.com/results?search_query="
            linkAddress = Replace(linkAddress, "https://www.youtube.com/results?search_query=", "")
            
            .Hyperlinks.Add Anchor:=.Cells(lastRow, 10), _
                            Address:=linkAddress, _
                            textToDisplay:="Review"
        End If
        
        ' Google/YouTube/eBay-Suchlinks in Spalten G/H/I
        AddHyperlinks verzeichnisWs, ws, lastRow
    End With
End Sub


' ----------------------------------------------------------
'  Sub: AddHyperlinks
'  Zweck:
'    - Fügt Such-Hyperlinks zu Google, YouTube, eBay in Zeile "lastRow" ein
'    - Greift auf B6 (Hersteller) und B8 (Modell) zu
' ----------------------------------------------------------
Sub AddHyperlinks(ByRef verzeichnisWs As Worksheet, ByRef ws As Worksheet, ByVal lastRow As Long)
    Dim searchQueryGoogle As String
    Dim searchQueryYouTube As String
    Dim searchQueryEbay As String
    
    searchQueryGoogle = "https://www.google.com/search?q=" & ws.Range("B6").Value & "+" & ws.Range("B8").Value
    searchQueryYouTube = "https://www.youtube.com/results?search_query=" & ws.Range("B6").Value & "+" & ws.Range("B8").Value
    searchQueryEbay = "https://www.ebay.de/sch/i.html?_nkw=" & ws.Range("B6").Value & "+" & ws.Range("B8").Value & "&_sacat=0"
    
    verzeichnisWs.Hyperlinks.Add Anchor:=verzeichnisWs.Cells(lastRow, 7), Address:=searchQueryGoogle, textToDisplay:="Google"
    verzeichnisWs.Hyperlinks.Add Anchor:=verzeichnisWs.Cells(lastRow, 8), Address:=searchQueryYouTube, textToDisplay:="YT"
    verzeichnisWs.Hyperlinks.Add Anchor:=verzeichnisWs.Cells(lastRow, 9), Address:=searchQueryEbay, textToDisplay:="eBay"
End Sub


' ----------------------------------------------------------
'  Sub: WriteStatistics
'  Zweck:
'    - Ruft WriteFrequencyTable für Uhrtyp & Hersteller auf
'    - Bestimmt die Start-Zeilen unterhalb der letzten Einträge
' ----------------------------------------------------------
Sub WriteStatistics(ByRef verzeichnisWs As Worksheet, ByVal lastRow As Long, ByRef dictUhrtyp As Object, ByRef dictHersteller As Object)
    Dim startRowUhrtyp As Long
    Dim startRowHersteller As Long
    Dim rowCounterUhrtyp As Long
    Dim rowCounterHersteller As Long
    Dim totalUhrtyp As Long
    Dim totalHersteller As Long
    
    startRowUhrtyp = lastRow + 4
    startRowHersteller = startRowUhrtyp + dictUhrtyp.Count + 4
    rowCounterUhrtyp = 1
    rowCounterHersteller = 1
    
    ' Uhrtypen und ihre Häufigkeiten
    WriteFrequencyTable verzeichnisWs, startRowUhrtyp, dictUhrtyp, rowCounterUhrtyp, totalUhrtyp
    
    ' Hersteller und ihre Häufigkeiten
    WriteFrequencyTable verzeichnisWs, startRowHersteller, dictHersteller, rowCounterHersteller, totalHersteller
End Sub


' ----------------------------------------------------------
'  Sub: WriteFrequencyTable
'  Zweck:
'    - Schreibt Dictionary-Inhalte (Key=Name, Value=Häufigkeit)
'      in Tabelle, beginnend ab "startRow"
'    - Spalte A = Key, Spalte C = Häufigkeit, Spalte D = Zwischensumme
' ----------------------------------------------------------
Sub WriteFrequencyTable(ByRef verzeichnisWs As Worksheet, ByVal startRow As Long, ByRef dict As Object, ByRef rowCounter As Long, ByRef total As Long)
    Dim key As Variant
    Dim sumColumnC As Long
    sumColumnC = 0
    
    ' Überschrift: unterscheidet je nachdem, ob dict = dictUhrtyp
    verzeichnisWs.Cells(startRow, 1).Value = IIf(dict Is dictUhrtyp, "Uhrtyp", "Hersteller")
    verzeichnisWs.Cells(startRow, 1).Font.Bold = True
    
    verzeichnisWs.Cells(startRow, 3).Value = "Häufigkeit"
    verzeichnisWs.Cells(startRow, 3).Font.Bold = True
    
    ' Dictionary durchlaufen
    For Each key In dict.Keys
        verzeichnisWs.Cells(startRow + rowCounter, 1).Value = key
        verzeichnisWs.Cells(startRow + rowCounter, 3).Value = dict(key)
        
        sumColumnC = sumColumnC + dict(key)
        verzeichnisWs.Cells(startRow + rowCounter, 4).Value = sumColumnC  ' Kumulative Summe
        rowCounter = rowCounter + 1
        
        total = total + dict(key)
    Next key
End Sub


'===========================================================
'        3) NAVIGATION (Zwischen den Blättern springen)
'===========================================================

' ----------------------------------------------------------
'  Sub: GeheZumBlattVerzeichnis
'  Zweck: Aktiviert das Blatt "Verzeichnis"
' ----------------------------------------------------------
Sub GeheZumBlattVerzeichnis()
    Sheets("Verzeichnis").Activate
End Sub

' ----------------------------------------------------------
'  Sub: GeheZumNaechstenBlatt
'  Zweck: Aktiviert das nächste Blatt (Index + 1)
' ----------------------------------------------------------
Sub GeheZumNaechstenBlatt()
    Dim currentSheet As Worksheet
    Set currentSheet = ActiveSheet
    
    On Error Resume Next
    Sheets(currentSheet.Index + 1).Activate
    On Error GoTo 0
End Sub

' ----------------------------------------------------------
'  Sub: GeheZumVorherigenBlatt
'  Zweck: Aktiviert das vorherige Blatt (Index - 1)
' ----------------------------------------------------------
Sub GeheZumVorherigenBlatt()
    Dim currentSheet As Worksheet
    Set currentSheet = ActiveSheet
    
    On Error Resume Next
    Sheets(currentSheet.Index - 1).Activate
    On Error GoTo 0
End Sub

' ----------------------------------------------------------
'  Sub: GeheZumLetztenBlatt
'  Zweck: Aktiviert das letzte (rechts) Blatt
' ----------------------------------------------------------
Sub GeheZumLetztenBlatt()
    Sheets(Sheets.Count).Activate
End Sub


'===========================================================
' 4) WEITERE HILFSMAKROS (Blatt erstellen, Zoom, etc.)
'===========================================================

' ----------------------------------------------------------
'  Sub: TrageLaufendeNummerEin
'  Zweck:
'    - Weist jedem Datenblatt (außer Verzeichnis/Template)
'      eine fortlaufende Nummer in H16 zu
' ----------------------------------------------------------
Sub TrageLaufendeNummerEin()
    Dim ws As Worksheet
    Dim laufendeNummer As Integer
    
    laufendeNummer = 1
    
    For Each ws In Worksheets
        If ws.Name <> "Verzeichnis" And ws.Name <> "Template" Then
            With ws.Range("H16")
                .Value = laufendeNummer
                .HorizontalAlignment = xlCenter
                .VerticalAlignment = xlCenter
            End With
            laufendeNummer = laufendeNummer + 1
        End If
    Next ws
End Sub

' ----------------------------------------------------------
'  Sub: SetOrCreateWorksheet
'  Zweck:
'    - Prüft, ob ein Blatt "sheetName" existiert, sonst anlegen
' ----------------------------------------------------------
Sub SetOrCreateWorksheet(ByRef ws As Worksheet, ByVal sheetName As String)
    On Error Resume Next
    Set ws = Worksheets(sheetName)
    On Error GoTo 0
    
    If ws Is Nothing Then
        Set ws = Worksheets.Add(After:=Sheets(Sheets.Count))
        ws.Name = sheetName
    End If
End Sub

' ----------------------------------------------------------
'  Sub: ErstelleNeuesBlatt
'  Zweck:
'    - Kopiert das "Template"-Blatt
'    - Fragt nach neuem Namen (InputBox)
'    - Schreibt aktuelles Datum in B4
' ----------------------------------------------------------
Sub ErstelleNeuesBlatt()
    Dim templateSheet As Worksheet
    Dim newSheet As Worksheet
    Dim newName As String
    
    On Error Resume Next
    Set templateSheet = Worksheets("Template")
    On Error GoTo 0
    
    If Not templateSheet Is Nothing Then
        newName = InputBox("Geben Sie einen Namen für das neue Blatt ein:", _
                           "Neues Blatt erstellen", "NeuesBlatt")
        
        If newName <> "" Then
            templateSheet.Copy After:=Sheets(Sheets.Count)
            Set newSheet = ActiveSheet
            newSheet.Name = newName
            
            newSheet.Range("B4").Value = Date
        Else
            MsgBox "Der Vorgang wurde abgebrochen. Das neue Blatt wurde nicht erstellt.", vbInformation
        End If
    Else
        MsgBox "Das Blatt 'Template' wurde nicht gefunden.", vbExclamation
    End If
End Sub


' ----------------------------------------------------------
'  Sub: BlattNamenErstellen
'  Zweck:
'    - Liest aus jedem Datenblatt B6 und B8, generiert daraus
'      einen neuen Blattnamen
'    - Kürzt auf 30 Zeichen
' ----------------------------------------------------------
Sub BlattNamenErstellen()
    Dim targetSheet As Worksheet
    Dim newName As String
    Dim existingSheet As Boolean
    
    For Each targetSheet In ThisWorkbook.Sheets
        If targetSheet.Name <> "Verzeichnis" And targetSheet.Name <> "Template" Then
            newName = targetSheet.Range("B6").Value & "-" & targetSheet.Range("B8").Value
            
            ' Kürzen auf maximal 30 Zeichen
            If Len(newName) > 30 Then
                newName = Left(newName, 30)
            End If
            
            ' Prüfen, ob dieser Blattname schon existiert
            existingSheet = False
            On Error Resume Next
            existingSheet = (ThisWorkbook.Sheets(newName).Name = newName)
            On Error GoTo 0
            
            ' Falls existiert, hänge G1 dran
            If existingSheet Then
                newName = newName & "-" & targetSheet.Range("G1").Value
            End If
            
            ' Name setzen
            On Error Resume Next
            targetSheet.Name = newName
            On Error GoTo 0
        End If
    Next targetSheet
End Sub


' ----------------------------------------------------------
'  Sub: SelektiereZelleA1
'  Zweck:
'    - Aktiviert nacheinander jedes Blatt und wählt A1 aus
' ----------------------------------------------------------
Sub SelektiereZelleA1()
    Dim ws As Worksheet
    
    For Each ws In Worksheets
        ws.Activate
        ws.Range("A1").Select
    Next ws
End Sub

' ----------------------------------------------------------
'  Sub: SetzeZoomFaktor
'  Zweck:
'    - Aktiviert jedes Blatt (außer Verzeichnis/Template)
'      und setzt Zoom = 95%
' ----------------------------------------------------------
Sub SetzeZoomFaktor()
    Dim ws As Worksheet
    For Each ws In Worksheets
        If ws.Name <> "Verzeichnis" And ws.Name <> "Template" Then
            ws.Activate
            ActiveWindow.Zoom = 95
        End If
    Next ws
End Sub

' ----------------------------------------------------------
'  Sub: ErzeugeHyperlinks
'  Zweck:
'    - Durchläuft Spalte E ab Zeile 8 in jedem Blatt (außer V/T)
'    - Wandelt gefundene Werte in Hyperlinks (Text: "Shop")
' ----------------------------------------------------------
Sub ErzeugeHyperlinks()
    Dim ws As Worksheet
    Dim cell As Range
    
    For Each ws In Worksheets
        If ws.Name <> "Verzeichnis" And ws.Name <> "Template" Then
            For Each cell In ws.Range("E8:E" & ws.Cells(Rows.Count, "E").End(xlUp).Row)
                If Not IsEmpty(cell) Then
                    cell.Hyperlinks.Add Anchor:=cell, Address:=cell.Value, textToDisplay:="Shop"
                End If
            Next cell
        End If
    Next ws
End Sub

' ----------------------------------------------------------
'  Sub: KopiereZelleD8
'  Zweck:
'    - Kopiert Wert/Format aus Template!D8 in D8 aller Uhrenblätter
' ----------------------------------------------------------
Sub KopiereZelleD8()
    Dim ws As Worksheet
    Dim templateWs As Worksheet
    Dim sourceCell As Range
    Dim destinationCell As Range
    
    Set templateWs = Worksheets("Template")
    Set sourceCell = templateWs.Range("D8")
    
    For Each ws In Worksheets
        If ws.Name <> "Verzeichnis" And ws.Name <> "Template" Then
            Set destinationCell = ws.Range("D8")
            sourceCell.Copy
            destinationCell.PasteSpecial Paste:=xlPasteAll, Operation:=xlNone, SkipBlanks:=False, Transpose:=False
            Application.CutCopyMode = False
        End If
    Next ws
End Sub


' ----------------------------------------------------------
'  Sub: ÜberprüfeLinkUndTrageTextEin
'  Zweck:
'    - Schaut in E8, ob Hyperlink auf aliexpress => E7="AliExpress"
'      sonst => E7="Kleinanzeigen"
' ----------------------------------------------------------
Sub ÜberprüfeLinkUndTrageTextEin()
    Dim ws As Worksheet
    Dim urlCell As Range
    Dim checkDomain As String
    Dim textToDisplay As String
    
    For Each ws In Worksheets
        If ws.Name <> "Verzeichnis" And ws.Name <> "Template" Then
            Set urlCell = ws.Range("E8")
            
            If urlCell.Hyperlinks.Count > 0 Then
                checkDomain = ExtractDomain(urlCell.Hyperlinks(1).Address)
                If InStr(checkDomain, "aliexpress.com") > 0 Then
                    textToDisplay = "AliExpress"
                Else
                    textToDisplay = "Kleinanzeigen"
                End If
            Else
                textToDisplay = "Kleinanzeigen"
            End If
            
            ws.Range("E7").Value = textToDisplay
            ws.Range("E7").Hyperlinks.Delete
        End If
    Next ws
End Sub

' ----------------------------------------------------------
'  Function: ExtractDomain
'  Zweck:
'    - Extrahiert den Domain-Teil aus einer URL
' ----------------------------------------------------------
Function ExtractDomain(url As String) As String
    Dim startPos As Integer
    Dim endPos As Integer
    
    startPos = InStr(url, "://") + 3
    If startPos > 3 Then
        endPos = InStr(startPos, url, "/")
        If endPos > startPos Then
            ExtractDomain = Mid(url, startPos, endPos - startPos)
        Else
            ExtractDomain = Mid(url, startPos)
        End If
    Else
        ExtractDomain = ""
    End If
End Function

' ----------------------------------------------------------
'  Sub: ÜberprüfeUndÄndereURL
'  Zweck:
'    - Wenn B10-Hyperlink ein YT-Suchlink ist (Beginn "...search_query="),
'      diesen Prefix entfernen
' ----------------------------------------------------------
Sub ÜberprüfeUndÄndereURL()
    Dim ws As Worksheet
    Dim urlCell As Range
    Dim url As String
    
    For Each ws In Worksheets
        If ws.Name <> "Verzeichnis" And ws.Name <> "Template" Then
            Set urlCell = ws.Range("B10")
            
            If urlCell.Hyperlinks.Count > 0 Then
                url = urlCell.Hyperlinks(1).Address
                
                If InStr(url, "https://www.youtube.com/results?search_query=") = 1 Then
                    ' Prefix entfernen
                    url = Mid(url, Len("https://www.youtube.com/results?search_query=") + 1)
                    urlCell.Hyperlinks(1).Address = url
                End If
            End If
        End If
    Next ws
End Sub

' ----------------------------------------------------------
'  Sub: ChangeTextOfShopAndVideoLinks
'  Zweck:
'    - Prüft B10 und E8:
'      * Falls https-String vorhanden, Hyperlink daraus machen
'      * B10 => "YT" / E8 => "Shop"
' ----------------------------------------------------------
Sub ChangeTextOfShopAndVideoLinks()
    Dim wb As Workbook
    Dim ws As Worksheet
    Dim cellB10 As Range
    Dim cellE8 As Range
    Dim linkB10 As Hyperlink
    Dim linkE8 As Hyperlink
    Dim urlString As String
    
    Set wb = ThisWorkbook
    
    For Each ws In wb.Worksheets
        If ws.Name <> "Verzeichnis" And ws.Name <> "Template" Then
            
            ' ---- B10 ----
            Set cellB10 = ws.Range("B10")
            urlString = cellB10.Value
            
            If Left(urlString, 5) = "https" Then
                ws.Hyperlinks.Add Anchor:=cellB10, Address:=urlString
            End If
            
            If cellB10.Hyperlinks.Count > 0 Then
                Set linkB10 = cellB10.Hyperlinks(1)
                linkB10.textToDisplay = "YT"
            End If
            
            ' ---- E8 ----
            Set cellE8 = ws.Range("E8")
            urlString = cellE8.Value
            
            If Left(urlString, 5) = "https" Then
                ws.Hyperlinks.Add Anchor:=cellE8, Address:=urlString
            End If
            
            If cellE8.Hyperlinks.Count > 0 Then
                Set linkE8 = cellE8.Hyperlinks(1)
                linkE8.textToDisplay = "Shop"
            End If
            
        End If
    Next ws
    
    'wb.Save  ' <--- Kommentar belassen, da wir nichts erzwingen wollen
End Sub


' Gibt den ganzzahligen Anteil eines Preises als Long zurück, ignoriert Nachkommastellen, sonst 0
Function ParsePreis(val As Variant) As Long
    Dim s As String
    s = Trim(CStr(val))
    If s = "" Then
        ParsePreis = 0
    Else
        Dim decimalSeparatorPos As Long
        decimalSeparatorPos = InStr(s, ",")
        If decimalSeparatorPos = 0 Then
            decimalSeparatorPos = InStr(s, ".")
        End If

        Dim integerPart As String
        If decimalSeparatorPos > 0 Then
            integerPart = Left(s, decimalSeparatorPos - 1)
        Else
            integerPart = s
        End If

        If IsNumeric(integerPart) Then
            ParsePreis = CLng(integerPart)
        Else
            ParsePreis = 0
        End If
    End If
End Function



Public Sub ExportDataToJson()
    Dim wb As Workbook
    Dim ws As Worksheet
    Dim firstSheetIndex As Long, lastSheetIndex As Long
    Dim i As Long

    ' Pfade / Dateinamen
    Dim jsonFolder As String
    Dim fileTimestamp As String
    Dim jsonFileName As String
    Dim jsonFilePath As String
    jsonFolder = "C:\Tmp\"
    fileTimestamp = Format(Now, "yyyy-mm-dd")
    jsonFileName = "uhren.json"
    jsonFilePath = jsonFolder & jsonFileName

    ' Zeitstempel für JSON-Inhalt
    Dim jsonTimestamp As String
    jsonTimestamp = Format(Now, "yyyy-mm-dd\THH:mm:ss")

    Set wb = ThisWorkbook
    firstSheetIndex = 3
    lastSheetIndex = wb.Worksheets.Count

    Dim jsonString As String
    jsonString = "{" & vbCrLf & _
                 "  ""timestamp"": """ & jsonTimestamp & """," & vbCrLf & _
                 "  ""Uhren"": [" & vbCrLf

    Dim itemCount As Long: itemCount = 0

    For i = firstSheetIndex To lastSheetIndex
        Set ws = wb.Worksheets(i)

        Dim ID As String: ID = CStr(ws.Range("H16").Value)
        Dim NameBlatt As String: NameBlatt = CStr(ws.Name)
        Dim Kaufdatum As String: Kaufdatum = CStr(ws.Range("B4").Value)
        Dim Kaufpreis As Double: Kaufpreis = ParsePreis(ws.Range("B5").Value)
        Dim Hersteller As String: Hersteller = CStr(ws.Range("B6").Value)
        Dim Typ As String: Typ = CStr(ws.Range("B7").Value)
        Dim Modell As String: Modell = CStr(ws.Range("B8").Value)
        Dim Hommage As String: Hommage = CStr(ws.Range("B9").Value)

        Dim VideoURL As String
        If ws.Range("B10").Hyperlinks.Count > 0 Then
            VideoURL = ws.Range("B10").Hyperlinks(1).Address
        Else
            VideoURL = CStr(ws.Range("B10").Value)
        End If

        Dim AKA As String: AKA = CStr(ws.Range("B11").Value)
        Dim VKDatum As String: VKDatum = CStr(ws.Range("C4").Value)
        Dim VKPreis As String: VKPreis = CStr(ws.Range("D5").Value)
        If VKDatum = "" Then VKDatum = "-"
        If VKPreis = "" Then VKPreis = "0"
        Dim Herkunft As String: Herkunft = CStr(ws.Range("E7").Value)
        Dim ShopURL As String: ShopURL = CStr(ws.Range("E8").Value)
        Dim Bemerkungen As String: Bemerkungen = CStr(ws.Range("B14").Value)

        ' Fixwerte

        Dim waterproof As String: waterproof = "Unknown"
        Dim caseSize As String: caseSize = CStr(ws.Range("D9").Value)
        Dim movement As String: movement = CStr(ws.Range("D10").Value)
        Dim glass As String: glass = CStr(ws.Range("D11").Value)
        Dim BildURL As String
        BildURL = "https://fakeimg.pl/200x150/b82525/ebd8ae?text=No+watch+image+yet&font=bebas&font_size=22"

        ' Nur exportieren, wenn Kaufpreis > 0
        If Kaufpreis > 0 Then
            If itemCount > 0 Then
                jsonString = jsonString & "," & vbCrLf
            End If

            jsonString = jsonString & _
                "    {" & vbCrLf & _
                "      ""ID"": """ & ID & """," & vbCrLf & _
                "      ""Name"": """ & ReplaceJsonString(NameBlatt) & """," & vbCrLf & _
                "      ""Kaufdatum"": """ & ReplaceJsonString(Kaufdatum) & """," & vbCrLf & _
                "      ""Kaufpreis"": " & Kaufpreis & "," & vbCrLf & _
                "      ""Hersteller"": """ & ReplaceJsonString(Hersteller) & """," & vbCrLf & _
                "      ""Typ"": """ & ReplaceJsonString(Typ) & """," & vbCrLf & _
                "      ""Modell"": """ & ReplaceJsonString(Modell) & """," & vbCrLf & _
                "      ""Hommage"": """ & ReplaceJsonString(Hommage) & """," & vbCrLf & _
                "      ""VideoURL"": """ & ReplaceJsonString(VideoURL) & """," & vbCrLf & _
                "      ""AKA"": """ & ReplaceJsonString(AKA) & """," & vbCrLf & _
                "      ""VKDatum"": """ & ReplaceJsonString(VKDatum) & """," & vbCrLf & _
                "      ""VKPreis"": """ & ReplaceJsonString(VKPreis) & """," & vbCrLf & _
                "      ""Herkunft"": """ & ReplaceJsonString(Herkunft) & """," & vbCrLf & _
                "      ""ShopURL"": """ & ReplaceJsonString(ShopURL) & """," & vbCrLf & _
                "      ""Bemerkungen"": """ & ReplaceJsonString(Bemerkungen) & """," & vbCrLf & _
                "      ""Movement"": """ & ReplaceJsonString(movement) & """," & vbCrLf & _
                "      ""Waterproof"": """ & ReplaceJsonString(waterproof) & """," & vbCrLf & _
                "      ""CaseSize"": """ & ReplaceJsonString(caseSize) & """," & vbCrLf & _
                "      ""Glass"": """ & ReplaceJsonString(glass) & """," & vbCrLf & _
                "      ""BildURL"": """ & ReplaceJsonString(BildURL) & """" & vbCrLf & _
                "    }"

            itemCount = itemCount + 1
        End If
    Next i

    jsonString = jsonString & vbCrLf & "  ]" & vbCrLf & "}"

    Dim stream As Object
    Set stream = CreateObject("ADODB.Stream")
    stream.Type = 2
    stream.Charset = "utf-8"
    stream.Open
    stream.WriteText jsonString
    stream.SaveToFile jsonFilePath, 2
    stream.Close
    Set stream = Nothing

    MsgBox "JSON-Datei erstellt: " & vbCrLf & jsonFilePath, vbInformation
    ExportHtmlFrontend
End Sub


' ------------------------------------------------
' Hilfsfunktion: ReplaceJsonString
' Zweck:        Sonderzeichen (Anführungszeichen usw.) entschärfen
' ------------------------------------------------
Private Function ReplaceJsonString(ByVal s As String) As String
    Dim tmp As String
    tmp = Replace(s, "\", "\\")         ' Backslash doppeln
    tmp = Replace(tmp, """", "\""")     ' " => \"
    tmp = Replace(tmp, vbCrLf, "\\n")   ' Windows-Zeilenumbruch
    tmp = Replace(tmp, vbCr, "\\n")     ' Mac-Zeilenumbruch
    tmp = Replace(tmp, vbLf, "\\n")     ' Unix-Zeilenumbruch
    tmp = Replace(tmp, vbTab, " ")      ' Tabs durch Leerzeichen
    ' Steuerzeichen entfernen
    Dim c As Integer
    For c = 0 To 31
        If c <> 10 And c <> 13 Then ' \n und \r haben wir oben behandelt
            tmp = Replace(tmp, Chr(c), "")
        End If
    Next
    ReplaceJsonString = tmp
End Function



Public Sub ExportHtmlFrontend()
    Dim htmlFilePath As String
    htmlFilePath = "C:\Tmp\uhren.html"
    
    Dim htmlString As String
    htmlString = GetHtmlFrontendContent()
    
    ' UTF-8 speichern
    Dim stream As Object
    Set stream = CreateObject("ADODB.Stream")
    stream.Type = 2 ' Text
    stream.Charset = "utf-8"
    stream.Open
    stream.WriteText htmlString
    stream.SaveToFile htmlFilePath, 2
    stream.Close
    Set stream = Nothing
    
    MsgBox "HTML-Datei erstellt: " & vbCrLf & htmlFilePath, vbInformation
    MsgBox "start server with       python -m http.server 8000"
End Sub
Private Function GetHtmlFrontendContent() As String
    Dim html As String
    html = ""
    html = html & "<!DOCTYPE html>" & vbCrLf
    html = html & "<html lang='de' data-theme='airyblue'>" & vbCrLf
    html = html & "<head>" & vbCrLf
    html = html & "  <meta charset='UTF-8'>" & vbCrLf
    html = html & "  <title>Uhrensammlung</title>" & vbCrLf
    html = html & "  <link href='https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css' rel='stylesheet'>" & vbCrLf
    html = html & "  <link href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css' rel='stylesheet'>" & vbCrLf
    html = html & "  <link href='https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css' rel='stylesheet'>" & vbCrLf
    html = html & "  <script src='https://cdn.jsdelivr.net/npm/chart.js'></script>" & vbCrLf
    html = html & "  <script src='https://code.jquery.com/jquery-3.7.1.min.js'></script>" & vbCrLf
    html = html & "  <script src='https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js'></script>" & vbCrLf
    html = html & "  <script src='https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js'></script>" & vbCrLf
    html = html & "  <style>" & vbCrLf
    html = html & "    [data-theme='airyblue'] {" & vbCrLf
    html = html & "      --bg-primary: #f0f5f9; --bg-secondary: #f5f8fc;" & vbCrLf
    html = html & "      --text-primary: #2c3e50; --text-secondary: #5c7185;" & vbCrLf
    html = html & "      --accent: #7e9ab8; --border: #e0e7f0;" & vbCrLf
    html = html & "      --btn-primary: #6b8cae; --btn-primary-hover: #567a9b;" & vbCrLf
    html = html & "      --btn-text: #ffffff;" & vbCrLf
    html = html & "      --sidebar-bg: var(--bg-primary); --sidebar-text: var(--text-primary);" & vbCrLf
    html = html & "      --navbar-bg: var(--bg-primary); --navbar-text: var(--text-primary);" & vbCrLf
    html = html & "    }" & vbCrLf
    html = html & "    body { background-color: var(--bg-primary); color: var(--text-primary); }" & vbCrLf
    html = html & "    table.dataTable tbody tr { background-color: var(--bg-secondary); }" & vbCrLf
    html = html & "    table.dataTable thead { background-color: var(--btn-primary); color: var(--btn-text); }" & vbCrLf
    html = html & "  </style>" & vbCrLf
    html = html & "</head>" & vbCrLf
    html = html & "<body class='container py-4'>" & vbCrLf
    html = html & "  <h1 class='mb-4'>Uhrensammlung</h1>" & vbCrLf
    html = html & "  <table id='watchTable' class='table table-striped' style='width:100%'>" & vbCrLf
    html = html & "    <thead><tr><th>Bild</th><th>Name</th><th>Modell</th><th>Typ</th><th>Kaufdatum</th><th>Kaufpreis</th><th>Hersteller</th><th>Herkunft</th><th>Hommage</th><th>Video</th><th>Bemerkungen</th></tr></thead>" & vbCrLf

    html = html & "    <tbody></tbody>" & vbCrLf
    html = html & "  </table>" & vbCrLf
    html = html & "  <script>" & vbCrLf
    html = html & "    async function loadJson() {" & vbCrLf
    html = html & "      const response = await fetch('uhren.json');" & vbCrLf
    html = html & "      const json = await response.json();" & vbCrLf
    html = html & "      const data = json.Uhren;" & vbCrLf
    html = html & "      const svgFallback = `data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100%' height='100%' fill='%23e0e7f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%235c7185' font-family='Arial' font-size='12'>Kein Bild</text></svg>`;" & vbCrLf
    html = html & "      const tableBody = document.querySelector('#watchTable tbody');" & vbCrLf
    html = html & "      tableBody.innerHTML = '';" & vbCrLf
    html = html & "      data.forEach(uhr => {" & vbCrLf
    html = html & "        const row = document.createElement('tr');" & vbCrLf
    html = html & "        const imageUrl = uhr.BildURL && uhr.BildURL.trim() !== '' ? uhr.BildURL : svgFallback;" & vbCrLf
    html = html & "        const preisFormatted = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(parseFloat(uhr.Kaufpreis));" & vbCrLf
    html = html & "        const videoLink = uhr.VideoURL && uhr.VideoURL.trim() !== '' ? `<a href='${uhr.VideoURL}' target='_blank'><i class='bi bi-play-circle'></i></a>` : '';" & vbCrLf
    html = html & "        row.innerHTML = `<td><img src='${imageUrl}' alt='${uhr.Name}' style='width:80px;height:80px;object-fit:contain;border:1px solid #ccc;border-radius:5px;'></td><td>${uhr.Name}</td><td>${uhr.Modell}</td><td>${uhr.Typ}</td><td>${uhr.Kaufdatum}</td><td>${preisFormatted}</td><td>${uhr.Hersteller}</td><td>${uhr.Herkunft}</td><td>${uhr.Hommage}</td><td>${videoLink}</td><td>${uhr.Bemerkungen}</td>`;" & vbCrLf

    html = html & "        tableBody.appendChild(row);" & vbCrLf
    html = html & "      });" & vbCrLf
    html = html & "      new DataTable('#watchTable', { pageLength: 25, responsive: true, language: { url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/de-DE.json' }});" & vbCrLf
    html = html & "    }" & vbCrLf
    html = html & "    loadJson();" & vbCrLf
    html = html & "  </script>" & vbCrLf
    html = html & "</body>" & vbCrLf
    html = html & "</html>"
    GetHtmlFrontendContent = html
    
End Function



Sub CopyTemplateFieldsToAllSheets()
    Dim wsSource As Worksheet
    Dim wsTarget As Worksheet
    Dim cellRange As Range

    ' Quelle: Blatt "Template"
    Set wsSource = ThisWorkbook.Sheets("Template")
    Set cellRange = wsSource.Range("D9:D11")

    ' Durch alle Blätter iterieren
    For Each wsTarget In ThisWorkbook.Sheets
        ' Template selbst überspringen
        If wsTarget.Name <> wsSource.Name Then
            ' Zellen in das Zielblatt kopieren
            cellRange.Copy Destination:=wsTarget.Range("D9")
        End If
    Next wsTarget

    MsgBox "Felder D9 bis D11 wurden erfolgreich in alle Blätter kopiert.", vbInformation
End Sub

