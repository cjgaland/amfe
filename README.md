# AMFE

PWA estática (HTML/CSS/JS puro, sin dependencias ni CDN, funciona sin conexión) para hacer, paso a paso y aprendiendo mientras se hace, el **Análisis Modal de Fallos y Efectos (AMFE)** de cualquier proceso sanitario.

Ocho pasos:

1. El proceso y sus subprocesos.
2. El equipo y las sesiones.
3. Encontrar los fallos: lluvia de ideas y técnica de grupo nominal.
4. Analizar cada fallo: efecto, causa, controles actuales y diagrama de Ishikawa.
5. Puntuar gravedad, ocurrencia y detección (IPR), también con votación del equipo.
6. Priorizar: los de mayor IPR, los muy graves y los críticos, con la matriz de riesgos.
7. Acciones de mejora (5W1H) con indicador y estándar.
8. Reevaluar (IPR residual), conclusiones, control del documento y ediciones.

- Avisos didácticos de las trampas más habituales (un fallo escrito como causa o como efecto, la detección que va al revés, las medidas débiles…).
- Modo reunión para proyectar y hoja de trabajo para las sesiones presenciales; pegar desde Excel.
- Informe AMFE y resumen para la Dirección en Word y PDF, y libro de Excel.
- Paquete de intercambio «amfe-fallos» para que Mapa de Riesgos y Auditorías puedan traer los fallos.
- **Aprende** (siete temas), **Ponte a prueba**, **glosario**, un **ejemplo completo** (atención en el Servicio de Urgencias, 49 fallos) y seis **minicasos**.

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
