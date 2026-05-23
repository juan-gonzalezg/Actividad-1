/**
 * LÓGICA DEL JUEGO SOLITARIO 2048 - VERSIÓN TAILWIND CSS (ARCHIVO EXTERNO)
 */

// Configuraciones del juego
const MAX_CARDS_PER_COLUMN = 8;
const INITIAL_DECK_VALUES = [2, 4, 8, 16, 32];
const CHAIN_DELAY = 250; 

// Estado del Juego
let columns = [[], [], [], []];
let currentCardValue = 0;
let score = 0;
let isProcessing = false;

// Variables de DOM (se cargan al inicializar el juego)
let DOM = {};

const sleep = ms => new Promise(r => setTimeout(r, ms));

function initGame() {
    // 1. Asignar variables DOM de forma segura (el HTML ya cargó)
    DOM.scoreEl = document.getElementById('score');
    DOM.deckContainer = document.getElementById('deck-card-container');
    DOM.modal = document.getElementById('gameOverModal');
    DOM.modalContent = document.getElementById('modalContent');
    DOM.finalScoreEl = document.getElementById('finalScore');

    // 2. Reiniciar estados
    columns = [[], [], [], []];
    score = 0;
    isProcessing = false;
    DOM.scoreEl.textContent = score;
    
    // 3. Ocultar modal usando clases de Tailwind
    DOM.modal.classList.remove('opacity-100', 'pointer-events-auto');
    DOM.modal.classList.add('opacity-0', 'pointer-events-none');
    DOM.modalContent.classList.remove('scale-100');
    DOM.modalContent.classList.add('scale-75');
    
    // 4. Limpiar las columnas del tablero
    for(let i=0; i<4; i++) {
        const colContent = document.getElementById(`col-content-${i}`);
        if(colContent) colContent.innerHTML = '';
        toggleDangerLine(i, false);
    }
    
    generateNextCard();
}

function generateNextCard() {
    const randomIndex = Math.floor(Math.random() * INITIAL_DECK_VALUES.length);
    currentCardValue = INITIAL_DECK_VALUES[randomIndex];
    renderDeckCard();
}

// Crea el DOM de la carta inyectando utilidades Tailwind (lee los arrays que dejamos en el HTML)
function createCardDOM(value) {
    const card = document.createElement('div');
    
    // BASE_CARD_CLASSES y TAILWIND_CARD_STYLES son leídos del archivo HTML
    card.classList.add(...BASE_CARD_CLASSES);
    
    // Ajustar tamaño del texto si el número es muy grande
    if (value < 100) card.classList.add('text-2xl');
    else if (value >= 100 && value < 1000) card.classList.add('text-xl');
    else if (value >= 1000) card.classList.add('text-lg');

    // Añadir color y sombra específica de Tailwind
    const styles = TAILWIND_CARD_STYLES[value] || TAILWIND_CARD_STYLES[2048];
    card.classList.add(...styles.split(' '));
    
    card.textContent = value;
    return card;
}

function renderDeckCard() {
    if(!DOM.deckContainer) return;
    DOM.deckContainer.innerHTML = '';
    DOM.deckContainer.appendChild(createCardDOM(currentCardValue));
}

function toggleDangerLine(colIndex, isDanger) {
    const line = document.getElementById(`danger-line-${colIndex}`);
    if(!line) return;

    if(isDanger) {
        line.classList.replace('opacity-30', 'opacity-100');
        line.classList.add('shadow-[0_0_10px_#EF4444]');
    } else {
        line.classList.replace('opacity-100', 'opacity-30');
        line.classList.remove('shadow-[0_0_10px_#EF4444]');
    }
}

function renderColumn(colIndex, animateTopPop = false) {
    const colContainer = document.getElementById(`col-content-${colIndex}`);
    if(!colContainer) return;
    
    colContainer.innerHTML = ''; 
    const colData = columns[colIndex];

    // Mostrar/ocultar línea roja
    toggleDangerLine(colIndex, colData.length >= MAX_CARDS_PER_COLUMN - 1);

    colData.forEach((val, index) => {
        const card = createCardDOM(val);
        if (animateTopPop && index === colData.length - 1) {
            card.classList.add('animate-pop');
        }
        colContainer.appendChild(card);
    });
}

async function handleColumnClick(colIndex) {
    if (isProcessing) return;

    isProcessing = true;
    const droppedValue = currentCardValue;
    
    // 1. Animar la caída desde el mazo
    await animateCardDrop(colIndex, droppedValue);

    // 2. Agregar a lógica y pantalla
    columns[colIndex].push(droppedValue);
    renderColumn(colIndex);
    
    const colContainer = document.getElementById(`col-content-${colIndex}`);
    const topCardDOM = colContainer.lastElementChild;
    if (topCardDOM && columns[colIndex].length > 1) {
        topCardDOM.classList.add('animate-impact'); // Golpe al caer
    }

    // 3. Procesar combos/fusiones
    await processMerges(colIndex);

    // 4. Verificar Derrota
    if (columns[colIndex].length > MAX_CARDS_PER_COLUMN) {
        triggerGameOver();
        return;
    }

    generateNextCard();
    isProcessing = false;
}

// Animación dinámica de caída. 
function animateCardDrop(colIndex, value) {
    return new Promise(resolve => {
        const deckRect = DOM.deckContainer.getBoundingClientRect();
        const colZone = document.querySelectorAll('.col-zone')[colIndex];
        const colContainer = document.getElementById(`col-content-${colIndex}`);
        
        const topCardDOM = colContainer.lastElementChild;
        let targetY;
        
        // Calcular hacia dónde tiene que bajar la carta
        if (topCardDOM) {
            const topRect = topCardDOM.getBoundingClientRect();
            targetY = topRect.top - deckRect.height - 8;
        } else {
            const colRect = colZone.getBoundingClientRect();
            targetY = colRect.bottom - deckRect.height - 16;
        }

        const targetX = colZone.getBoundingClientRect().left + (colZone.clientWidth / 2) - (deckRect.width / 2);

        const transitCard = createCardDOM(value);
        
        // Clases de Tailwind para la carta voladora
        transitCard.classList.add('fixed', 'z-[100]', 'pointer-events-none', 'transition-transform', 'duration-[250ms]', 'ease-[cubic-bezier(0.5,0,1,1)]');
        
        transitCard.style.left = `${deckRect.left}px`;
        transitCard.style.top = `${deckRect.top}px`;
        transitCard.style.width = `${deckRect.width}px`;
        transitCard.style.height = `${deckRect.height}px`;
        
        document.body.appendChild(transitCard);
        DOM.deckContainer.innerHTML = '';

        transitCard.offsetHeight; // Forzar al navegador a registrar la posición antes de moverla

        transitCard.style.transform = `translate(${targetX - deckRect.left}px, ${targetY - deckRect.top}px)`;

        transitCard.addEventListener('transitionend', () => {
            transitCard.remove();
            resolve();
        }, { once: true });
    });
}

async function processMerges(colIndex) {
    let col = columns[colIndex];
    
    while (col.length >= 2) {
        let top = col[col.length - 1];
        let below = col[col.length - 2];

        // Si son iguales, se fusionan
        if (top === below) {
            await sleep(CHAIN_DELAY);
    
            col.pop();
            col.pop();
            let newValue = top * 2;
            col.push(newValue);
    
            score += newValue;
            DOM.scoreEl.textContent = score;

            renderColumn(colIndex, true); // true = activa animación POP

            // Especial: Si llega a 2048, limpia la columna completa
            if (newValue === 2048) {
                await sleep(400); 

                const colContainer = document.getElementById(`col-content-${colIndex}`);
                const cardDOM = colContainer.lastElementChild;
                cardDOM.classList.add('animate-clear2048'); // Animación desvanecimiento

                await sleep(600); 

                columns[colIndex] = [];
                renderColumn(colIndex);
                break; 
            }
        } else {
            break; // No hay más fusiones
        }
    }
}

function triggerGameOver() {
    isProcessing = true;
    DOM.finalScoreEl.textContent = score;
    
    DOM.modal.classList.remove('opacity-0', 'pointer-events-none');
    DOM.modal.classList.add('opacity-100', 'pointer-events-auto');
    DOM.modalContent.classList.remove('scale-75');
    DOM.modalContent.classList.add('scale-100');
}

// Arrancar el juego únicamente cuando la página haya cargado por completo
window.onload = initGame;
