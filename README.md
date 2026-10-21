# AMFE

PWA estática (HTML/CSS/JS puro, sin dependencias ni CDN, funciona sin conexión) para hacer, paso a paso y aprendiendo mientras se hace, el **Análisis Modal de Fallos y Efectos (AMFE)** de cualquier proceso sanitario.

Ocho pasos: el proceso y sus subprocesos; el equipo y las sesiones; encontrar los fallos; analizar cada fallo (efecto, causa y controles actuales); puntuar gravedad, ocurrencia y detección (IPR); priorizar con la matriz de riesgos; acciones de mejora (5W1H) y reevaluación. En la versión actual están disponibles los pasos 1, 2, 4 y 5.

- Avisos didácticos de las trampas más habituales (un fallo escrito como causa o como efecto, la detección que va al revés…).
- Pegar los fallos desde Excel, Calc o Word.
- Tabla AMFE imprimible y en PDF.
- **Aprende** (siete temas), **glosario** y un **ejemplo completo** (atención en el Servicio de Urgencias, 49 fallos).

Los datos se guardan solo en el dispositivo; para trabajar en equipo se comparte la copia de seguridad.

Hermana de [Auditorías](https://cjgaland.github.io/auditorias/), [Indicadores](https://cjgaland.github.io/indicadores-calidad/) y [Tamaño Muestral](https://cjgaland.github.io/tamano-muestral/).

## Uso
Servir la carpeta y abrir `index.html`:

    python3 -m http.server 8768

Tests de la lógica:

    node tests/logic.test.mjs

Documentación técnica y decisiones: ver `CLAUDE.md`.

Aplicación desarrollada por:

- **Carlos J. Galán Doval** · Médico de Familia · Técnico en Calidad y Seguridad del Paciente
- **Rafael J. Romero de Castilla Gil** · Médico de Familia · Responsable del Área de Calidad y Seguridad del Paciente

Área de Gestión Sanitaria Sur de Córdoba · Andalucía. De libre uso con fines docentes y divulgativos. No sustituye el criterio profesional.
