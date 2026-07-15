const MAX_CARDS_PER_COL = 8;
const TARGET_SCORE = 2048;

// --- NUEVO: Mapeo a los nombres de los archivos de imagen proporcionados ---
const CARD_IMAGES = {
    2: 'cartas/carta1.png',
    4: 'cartas/carta2.png',
    8: 'cartas/carta3.png',
    16: 'cartas/carta4.png',
    32: 'cartas/carta5.png',
    64: 'cartas/carta6.png',
    128: 'cartas/carta7.png',
    256: 'cartas/carta8.png',
    512: 'cartas/carta9.png',
    1024: 'cartas/carta10.png',
    2048: 'cartas/carta11.png'
};

let columns = [[], [], [], []];
let currentCardValue = null;
let score = 0;
let isGameOver = false;
let isAnimating = false; // Bloquea interacciones durante cascadas

// Utilidad para crear pausas asíncronas
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function initGame() {
    columns = [[], [], [], []];
    score = 0;
    isGameOver = false;
    isAnimating = false;
    document.getElementById('gameOverModal').classList.add('hidden');
    document.getElementById('gameOverModal').classList.remove('flex');
    generateNewCard();
    render();
}

function generateNewCard() {
    const random = Math.random();
    if (random < 0.60) currentCardValue = 2;       // 60% probabilidad
    else if (random < 0.85) currentCardValue = 4;  // 25% probabilidad
    else if (random < 0.95) currentCardValue = 8;  // 10% probabilidad
    else if (random < 0.99) currentCardValue = 16; // 4% probabilidad
    else currentCardValue = 32;                    // 1% probabilidad
}

// Lógica Asíncrona Principal
async function handleColumnClick(colIndex) {
    if (isGameOver || isAnimating) return;

    const col = columns[colIndex];

    // Validación de columna llena
    if (col.length >= MAX_CARDS_PER_COL && col[col.length - 1].value !== currentCardValue) {
        const colDOM = document.getElementById(`col-${colIndex}`);
        colDOM.classList.add('bg-red-500/30');
        setTimeout(() => colDOM.classList.remove('bg-red-500/30'), 200);
        return; 
    }

    // Bloquear clics mientras se anima la cascada
    isAnimating = true;
    document.getElementById('interactionBlocker').classList.remove('hidden');

    // 1. Caída de la carta
    col.push({ value: currentCardValue, state: 'drop' });
    render();
    
    // Esperar a que la animación de caída termine antes de chequear fusiones
    await sleep(250); 

    // 2. Procesar Fusiones en cascada
    await processMergesAsync(colIndex);

    // 3. Finalizar turno
    if (!isGameOver) {
        generateNewCard();
        render(); // Renderiza la nueva carta en el mazo
        checkGameOver();
    }

    isAnimating = false;
    document.getElementById('interactionBlocker').classList.add('hidden');
}

async function processMergesAsync(colIndex) {
    let col = columns[colIndex];
    let merged = true;

    while (merged && col.length >= 2) {
        merged = false;
        const top1 = col[col.length - 1];
        const top2 = col[col.length - 2];

        if (top1.value === top2.value) {
            // Animación de choque (Squash) antes de fusionarse
            top1.state = 'squash';
            top2.state = 'squash';
            render();
            await sleep(150);

            // Realizar suma
            const newValue = top1.value * 2;
            score += newValue;
            updateScoreUI();
            
            // Remover las dos cartas viejas e insertar la nueva
            col.pop();
            col.pop();
            col.push({ value: newValue, state: 'merge' });
            merged = true;

            render(); // Mostrar la carta naciente con animación de brillo
            await sleep(300); // Pausa dramática para disfrutar el combo

            // Condición 2048
            if (newValue === TARGET_SCORE) {
                col[col.length - 1].state = 'clear'; // Aplica animación de disolución
                render();
                await sleep(600); // Esperar que termine la animación
                columns[colIndex] = []; // Vaciar memoria
                render(); // Limpiar pantalla
                merged = false; // Detener bucle
            }
        }
    }
    
    // Limpiar estados de animación residuales
    col.forEach(c => c.state = 'idle');
    render();
}

function checkGameOver() {
    let isBoardFull = true;
    for (let i = 0; i < 4; i++) {
        const col = columns[i];
        if (col.length < MAX_CARDS_PER_COL) {
            isBoardFull = false;
            break;
        }
        if (col.length >= MAX_CARDS_PER_COL && col[col.length - 1].value === currentCardValue) {
             isBoardFull = false;
             break;
        }
    }

    if (isBoardFull) {
        isGameOver = true;
        document.getElementById('finalScore').innerText = score;
        document.getElementById('gameOverModal').classList.remove('hidden');
        document.getElementById('gameOverModal').classList.add('flex');
    }
}

// Animación sutil de la puntuación al subir
function updateScoreUI() {
    const scoreEl = document.getElementById('scoreDisplay');
    scoreEl.innerText = score;
    scoreEl.classList.add('scale-125', 'text-white');
    setTimeout(() => {
        scoreEl.classList.remove('scale-125', 'text-white');
    }, 200);
}

// --- NUEVO: Construcción de la carta usando la etiqueta <img> ---
function createCardElement(cardObj) {
    const wrapper = document.createElement('div');
    
    let classes = `w-full relative transition-transform flex justify-center`;
    
    // Asignar animaciones (El Juice)
    if (cardObj.state === 'drop') classes += ' anim-drop';
    if (cardObj.state === 'squash') classes += ' anim-squash';
    if (cardObj.state === 'merge') classes += ' anim-merge';
    if (cardObj.state === 'clear') classes += ' anim-clear';
    
    wrapper.className = classes;
    
    // Elemento de imagen
    const img = document.createElement('img');
    // Si el valor llega a 2048, usar carta11. Si se necesita limpiar (victoria), podemos alternar a carta12 para que brille.
    img.src = CARD_IMAGES[cardObj.value] || (cardObj.state === 'clear' ? 'cartas/carta12.png' : 'cartas/carta11.png'); 
    img.className = 'w-full h-auto rounded-lg shadow-md'; 
    img.alt = `Carta ${cardObj.value}`;
    
    wrapper.appendChild(img);
    return wrapper;
}

function render() {
    if (!isGameOver) {
        document.getElementById('scoreDisplay').innerText = score;
    }

    // Mazo
    const currentCardContainer = document.getElementById('currentCardContainer');
    currentCardContainer.innerHTML = '';
    
    const mazoImg = document.createElement('img');
    mazoImg.src = CARD_IMAGES[currentCardValue];
    mazoImg.className = `w-[80%] max-w-[80px] h-auto rounded-lg shadow-2xl`; // Dimensionado proporcional
    mazoImg.alt = `Siguiente Carta ${currentCardValue}`;
    currentCardContainer.appendChild(mazoImg);

    // Tablero
    for (let i = 0; i < 4; i++) {
        const colContent = document.getElementById(`col-content-${i}`);
        colContent.innerHTML = ''; 
        
        columns[i].forEach((cardObj, index) => {
            const cardEl = createCardElement(cardObj);
            
            // --- NUEVO: Apilamiento visual (Efecto baraja de Solitario) ---
            cardEl.style.position = 'absolute';
            // Cada carta se desplaza 35px más arriba que la anterior
            cardEl.style.bottom = `${index * 35}px`; 
            cardEl.style.left = '0';
            cardEl.style.width = '100%';
            
            // El z-index asegura que la carta nueva tape a la vieja
            cardEl.style.zIndex = index + (cardObj.state === 'clear' ? 50 : 10);
            
            colContent.appendChild(cardEl);
        });

        // Peligro visual si está casi llena
        const colZone = document.getElementById(`col-${i}`);
        if (columns[i].length >= MAX_CARDS_PER_COL - 1) {
            colZone.classList.add('border-red-500/50', 'bg-red-900/10');
        } else {
            colZone.classList.remove('border-red-500/50', 'bg-red-900/10');
        }
    }
}

window.onload = initGame;