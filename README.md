# Solitario 2048 Neo-Night

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)

**Solitario 2048 Neo-Night** es una adaptación moderna, responsiva y visualmente atractiva del clásico juego **2048**, rediseñada bajo la dinámica y la estructura espacial del juego de cartas **Solitario**. El juego cuenta con una interfaz estética premium "dark-mode" (Neo-Night) con animaciones fluidas, efectos visuales inmersivos ("juice") y una jugabilidad altamente interactiva.

## 🚀 Demo en Vivo

Puedes acceder al proyecto en línea desplegado mediante GitHub Pages a través del siguiente enlace: [https://juan-gonzalezg.github.io/Actividad-1/](https://juan-gonzalezg.github.io/Actividad-1/)

---

## 🌟 Características Principales

- **Mecánica Híbrida 2048-Solitario:** Despliega cartas en 4 columnas. Las cartas iguales que queden apiladas se fusionarán automáticamente duplicando su valor en cascada.
- **Fusiones en Cascada Asíncronas:** Las fusiones de cartas se ejecutan de manera secuencial y visual, permitiendo al jugador presenciar combos continuos y emocionantes.
- **Apilamiento Estilo Baraja:** El tablero simula un tablero de cartas real, donde cada carta se apila de forma absoluta con un desplazamiento vertical de 35px, emulando la distribución de un solitario tradicional.
- **Micro-Animaciones e Interactions ("Juice"):**
  - **Caída (Drop):** Animación fluida de entrada al colocar una carta.
  - **Compresión (Squash):** Un rebote elástico previo a la fusión.
  - **Fusión (Merge):** Un destello de brillo neo-esmeralda al unirse dos cartas.
  - **Disolución (Clear):** Al alcanzar la carta de valor **2048**, la columna se disuelve con estilo y se limpia para liberar espacio.
- **Indicadores de Advertencia:** El borde y fondo de una columna se iluminarán en tonos rojizos cuando esté cerca de alcanzar su capacidad máxima (8 cartas).
- **Diseño Responsivo y Limpio:** Optimizado para pantallas móviles y de escritorio mediante **Tailwind CSS**.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5:** Estructura semántica del documento y contenedores del tablero.
- **Tailwind CSS:** Framework de estilos utilizado para la maquetación responsiva, paleta de colores personalizada (tonos oscuros y esmeralda) y efectos de desenfoque (`backdrop-blur`).
- **JavaScript (ES6+):** Lógica del motor del juego totalmente asíncrona (`async/await`, promesas) que maneja las animaciones temporizadas y el estado de la partida.
- **CSS3 Animations:** Definición de keyframes avanzados (`dropIn`, `squash`, `neonMerge`, `clearGlow`) para dotar de vida a la interfaz.

---

## 🎮 Reglas e Instrucciones del Juego

1. **Objetivo:** Lograr fusiones de cartas para alcanzar el valor de **2048**.
2. **Cómo Jugar:**
   - En la parte superior verás la **Siguiente Carta** del mazo lista para ser jugada.
   - Haz clic (o toca en móviles) sobre cualquiera de las **4 columnas** para lanzar la carta en ella.
   - Cuando dos cartas de **igual valor** se apilan una sobre la otra, se fusionan dando origen a una nueva carta con el doble del valor original (ej. $2 + 2 = 4$, $4 + 4 = 8$, ..., $1024 + 1024 = 2048$).
3. **Liberación de Columnas (Especial 2048):** Al fusionar dos cartas de $1024$, obtendrás la carta **2048**. Al hacerlo, la columna entera se disolverá y limpiará por completo, dándote una gran ventaja táctica.
4. **Límite de Cartas:** Cada columna puede albergar un máximo de **8 cartas**. Si intentas colocar una carta en una columna llena sin que se genere una fusión inmediata en el tope, la columna destellará en rojo rechazando la jugada.
5. **Fin del Juego:** La partida concluye si todas las columnas se llenan de cartas (8 por columna) y la siguiente carta en el mazo no puede fusionarse con la carta superior de ninguna columna.

---

## 📁 Estructura del Proyecto

```text
Actividad-1/
├── cartas/                      # Directorio de recursos de imágenes
│   ├── carta1.png (2)           # Carta con valor 2
│   ├── ...                      # Cartas intermedias
│   ├── carta11.png (2048)       # Carta con valor 2048
│   ├── carta12.png              # Carta especial de disolución / brillo
│   ├── cartaVacia.png           # Guía visual para columnas vacías
│   ├── cartaDescarte0.png       # Recursos adicionales
│   └── cartaDescarte1.png
├── app.js                       # Lógica asíncrona del juego, eventos y renderizado
├── index.html                   # Interfaz de usuario estructurada y animaciones CSS
├── LICENSE                      # Licencia del proyecto
└── README.md                    # Este archivo de documentación
```

---

## 💻 Ejecución y Pruebas Locales

1. Clona el repositorio o descarga el directorio del proyecto.
2. Abre el archivo [index.html](file:///c:/Users/cpustorevzla/Documents/Mar-Jul_25-26/Programacion-Orientada-a-la-Web/Actividad-1/index.html) directamente en cualquier navegador moderno.
3. _Opcional:_ Si deseas servirlo localmente mediante un servidor web liviano, puedes usar herramientas como:
   - **Live Server** (Extensión de VS Code).
   - Ejecutando `npx serve .` en la terminal desde el directorio raíz del proyecto.
