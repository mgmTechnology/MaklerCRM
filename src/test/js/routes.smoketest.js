/**
 * Smoketest für Router-Mappings
 * Prüft ob alle gemappten Dateien tatsächlich existieren
 */

describe('Router Mapping Tests', () => {
    const fs = require('fs');
    const path = require('path');

    // Pfade zu den relevanten Verzeichnissen
    const STATIC_DIR = path.resolve(__dirname, '../../main/resources/static');
    const MODULES_DIR = path.join(STATIC_DIR, 'modules');
    const JS_DIR = path.join(STATIC_DIR, 'js');

    // Hilfsfunktion zum Prüfen der Dateiexistenz
    function fileExists(filepath) {
        try {
            return fs.existsSync(filepath);
        } catch (err) {
            return false;
        }
    }

    // Hilfsfunktion zum Lesen der Dateien in einem Verzeichnis
    function getFilesInDir(dir, extension) {
        try {
            return fs.readdirSync(dir)
                .filter(file => file.endsWith(extension))
                .map(file => file.replace(extension, ''));
        } catch (err) {
            console.error(`Fehler beim Lesen des Verzeichnisses ${dir}:`, err);
            return [];
        }
    }

    // Hole die tatsächlichen Router-Mappings
    const routerPath = path.join(JS_DIR, 'router.js');
    const routerContent = fs.readFileSync(routerPath, 'utf8');
    
    // Extrahiere die Mappings aus router.js
    function extractMappings(content) {
        const moduleMapping = {};
        const jsFileMapping = {};
        
        // Extrahiere moduleMapping (HTML-Templates)
        const moduleMappingMatch = content.match(/const\s+moduleMapping\s*=\s*{([^}]*)}/s);
        if (moduleMappingMatch) {
            const mappingLines = moduleMappingMatch[1].split('\n');
            mappingLines.forEach(line => {
                const match = line.match(/'([^']+)':\s*{file:\s*'([^']+)'/);
                if (match) {
                    moduleMapping[match[1]] = match[2];
                }
            });
        }

        // Extrahiere jsFileMapping (JavaScript-Module)
        const jsFileMappingMatch = content.match(/const\s+jsFileMapping\s*=\s*{([^}]*)}/s);
        if (jsFileMappingMatch) {
            const mappingLines = jsFileMappingMatch[1].split('\n');
            mappingLines.forEach(line => {
                const match = line.match(/'([^']+)':\s*'([^']+)'/);
                if (match) {
                    jsFileMapping[match[1]] = match[2];
                }
            });
        }

        return { moduleMapping, jsFileMapping };
    }

    const { moduleMapping, jsFileMapping } = extractMappings(routerContent);

    // Debug-Ausgaben
    console.log('\nModul-Mappings:', moduleMapping);
    console.log('\nJS-Datei-Mappings:', jsFileMapping);

    describe('HTML Template Tests', () => {
        test('Alle gemappten HTML-Templates existieren', () => {
            Object.entries(moduleMapping).forEach(([key, file]) => {
                const templatePath = path.join(MODULES_DIR, file);
                expect(fileExists(templatePath)).toBe(true,
                    `HTML-Template für "${key}" nicht gefunden: ${file}`);
            });
        });
    });

    describe('JavaScript Module Tests', () => {
        test('Alle gemappten JavaScript-Module existieren', () => {
            Object.entries(jsFileMapping).forEach(([key, file]) => {
                const jsPath = path.join(JS_DIR, file);
                expect(fileExists(jsPath)).toBe(true,
                    `JavaScript-Modul für "${key}" nicht gefunden: ${file}`);
            });
        });

        test('Jedes HTML-Template hat ein zugehöriges JavaScript-Modul', () => {
            Object.keys(moduleMapping).forEach(key => {
                expect(jsFileMapping).toHaveProperty(key,
                    `Kein JavaScript-Modul für Template "${key}" definiert`);
            });
        });
    });

    describe('Konsistenz-Checks', () => {
        // Liste aller vorhandenen HTML-Module
        const htmlFiles = getFilesInDir(MODULES_DIR, '.html');
        // Liste aller vorhandenen JS-Dateien
        const jsFiles = getFilesInDir(JS_DIR, '.js');
        // Liste der in den Mappings verwendeten Dateien
        const mappedJsFiles = new Set(Object.values(jsFileMapping).map(file => file.replace('.js', '')));

        // Debug-Ausgaben
        console.log('\nGefundene HTML-Dateien:', htmlFiles);
        console.log('Gefundene JS-Dateien:', jsFiles);
        console.log('Gemappte JS-Dateien:', Array.from(mappedJsFiles));
        
        test('Alle HTML-Module sollten entsprechende JS-Dateien haben', () => {
            // Ignoriere spezielle Module, die kein JS benötigen
            const excludedModules = ['footer', 'header', 'nav', 'sidebar'];
            
            htmlFiles
                .filter(basename => !excludedModules.includes(basename))
                .forEach(basename => {
                    // Konvertiere Dateinamen in Modul-Keys
                    const possibleKeys = [
                        basename,                    // Original
                        basename.replace(/-/g, '_'), // Mit Unterstrichen
                        basename.replace(/-(\w)/g, (_, c) => c.toUpperCase()) // camelCase
                    ];
                    
                    const hasMapping = possibleKeys.some(key => Object.keys(jsFileMapping).includes(key));
                    console.log(`Prüfe HTML-Modul "${basename}":`, possibleKeys, hasMapping ? 'OK' : 'FEHLT');
                    
                    expect(hasMapping).toBe(true,
                        `HTML-Modul "${basename}" hat kein entsprechendes JS-Mapping (geprüfte Keys: ${possibleKeys.join(', ')})`);
                });
        });

        test('Alle JS-Dateien sollten in mindestens einem Mapping verwendet werden', () => {
            // Ignoriere Utility-Dateien und spezielle Module
            const excludedFiles = ['router', 'theme-switcher', 'utils', 'api', 'config'];
            
            jsFiles
                .filter(basename => !excludedFiles.includes(basename))
                .forEach(basename => {
                    // Prüfe verschiedene Namenskonventionen
                    const possibleNames = [
                        basename,                    // Original
                        basename.replace(/_/g, '-'), // Mit Bindestrichen
                        basename.replace(/_(\w)/g, (_, c) => c.toUpperCase()) // camelCase
                    ];
                    
                    const isUsed = possibleNames.some(name => mappedJsFiles.has(name));
                    console.log(`Prüfe JS-Datei "${basename}":`, possibleNames, isUsed ? 'OK' : 'FEHLT');
                    
                    expect(isUsed).toBe(true,
                        `JS-Datei "${basename}.js" wird in keinem Mapping verwendet (geprüfte Namen: ${possibleNames.join(', ')})`);
                });
        });
    });
});
