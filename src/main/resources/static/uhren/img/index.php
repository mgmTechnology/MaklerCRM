<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Bildergalerie mit Klick-Vorschau</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }

        h1 {
            margin-bottom: 20px;
        }

        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 15px;
        }

        .gallery img {
            height: 150px;
            object-fit: contain;
            width: 100%;
            border: 1px solid #ccc;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: transform 0.2s;
        }

        .gallery img:hover {
            transform: scale(1.02);
        }

        .preview-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.8);
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .preview-overlay img {
            max-width: 90%;
            max-height: 90%;
            box-shadow: 0 0 20px rgba(255,255,255,0.5);
            border: 2px solid white;
        }
    </style>
</head>
<body>
    <h1>Bildergalerie mit Klick-Vorschau</h1>
    <div class="gallery">
        <?php
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $files = scandir(__DIR__);
        $found = false;

        foreach ($files as $file) {
            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (in_array($ext, $allowedExtensions)) {
                echo "<script>console.log('Bild gefunden: " . htmlspecialchars($file) . "');</script>";
                echo '<img src="' . htmlspecialchars($file) . '" alt="Bild" onclick="showPreview(this.src)">';
                $found = true;
            }
        }

        if (!$found) {
            echo "<p><strong>⚠️ Keine Bilder gefunden!</strong></p>";
            echo "<script>console.warn('Keine Bilder mit erlaubten Endungen gefunden');</script>";
        }
        ?>
    </div>

    <div class="preview-overlay" id="preview" onclick="hidePreview()">
        <img id="previewImage" src="" alt="Vorschau">
    </div>

    <script>
        function showPreview(src) {
            console.log("Klick auf Bild: " + src);
            const overlay = document.getElementById('preview');
            const img = document.getElementById('previewImage');

            if (img.src !== src) {
                img.src = src;
            }

            overlay.style.display = 'flex';
        }

        function hidePreview() {
            console.log("Vorschau geschlossen");
            const overlay = document.getElementById('preview');
            overlay.style.display = 'none';
            document.getElementById('previewImage').src = '';
        }
    </script>
</body>
</html>
