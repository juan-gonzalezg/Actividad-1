/**
 * LÓGICA DEL JUEGO SOLITARIO 2048 - VERSIÓN TAILWIND CSS
 */

// Configuraciones
const MAX_CARDS_PER_COLUMN = 8;
const INITIAL_DECK_VALUES = [2, 4, 8, 16, 32];
const CHAIN_DELAY = 250; 

// Diccionario de estilos de cartas usando clases utilitarias de Tailwind
const TAILWIND_CARD_STYLES = {
    2: "bg-[#64748B]",
    4: "bg-[#475569]",
    8: "bg-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.4)]",
    16: "bg-[#6366F1] shadow-[0_0_20px_rgba(99,102,241,0.5)]",
    32: "bg-[#8B5CF6] shadow-[0_0_25px_rgba(139,92,246,0.6)]",
    64: "bg-[#EC4899] shadow-[0_0_30px_rgba(236,72,153,0.7)]",
    128: "bg-[#D946EF] shadow-[0_0_35px_rgba(217,70,239,0.8)]",
    256: "bg-[#EF4444] shadow-[0_0_40px_rgba(239,68,68,0.9)]",
    512: "bg-[#F97316] shadow-[0_0_45px_rgba(249,115,22,1)]",
    1024: "bg-[#EAB308] shadow-[0_0_50px_rgba(234,179,8,1)] text-[#422006]",
    2048: "bg-[#10B981] shadow-[0_0_60px_rgba(16,185,129,1)] text-[#022C22]"
};

const BASE_CARD_CLASSES = [
    "w-full", "aspect-[1/1.3]", "max-w-[80px]", "min-h-[60px]", "rounded-lg", 
    "flex", "justify-center", "items-center", "font-montserrat", "font-black", 
    "text-white", "shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]", "transition-transform", "duration-100"
];

// Estado del Juego
let columns = [[], [], [], []];
let currentCardValue = 0;
let score = 0;
let isProcessing = false;

// Referencias DOM
const scoreEl = document.getElementById('score');
const deckContainer = document.getElementById('deck-card-container');
const modal = document.getElementById('gameOverModal');
const modalContent = document.getElementById('modalContent');
const finalScoreEl = document.getElementById('finalScore');

const sleep = ms => new Promise(r => setTimeout(r, ms));

function initGame() {
    columns = [[], [], [], []];
    score = 0;
    isProcessing = false;
    
    scoreEl.textContent = score;
    
    // Ocultar modal Tailwind
    modal.classList.remove('opacity-100', 'pointer-events-auto');
    modal.classList.add('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-75');
    
    // Limpiar columnas
    for(let i=0; i<4; i++) {
        document.getElementById(`col-content-${i}`).innerHTML = '';
        toggleDangerLine(i, false);
    }
    
    generateNextCard();
}

function generateNextCard() {
    const randomIndex = Math.floor(Math.random() * INITIAL_DECK_VALUES.length);
    currentCardValue = INITIAL_DECK_VALUES[randomIndex];
    renderDeckCard();
}

// Crea el DOM de la carta inyectando utilidades Tailwind
function createCardDOM(value) {
    const card = document.createElement('div');
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
    deckContainer.innerHTML = '';
    deckContainer.appendChild(createCardDOM(currentCardValue));
}

function toggleDangerLine(colIndex, isDanger) {
    const line = document.getElementById(`danger-line-${colIndex}`);
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
    colContainer.innerHTML = ''; 
    const colData = columns[colIndex];

    // Toggle Tailwind Danger Classes
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

    if (columns[colIndex].length >= MAX_CARDS_PER_COLUMN && 
        columns[colIndex][columns[colIndex].length - 1] !== currentCardValue) {
        // Va a perder, dejamos continuar visualmente para feedback
    }

    isProcessing = true;
    const droppedValue = currentCardValue;
    
    await animateCardDrop(colIndex, droppedValue);

    columns[colIndex].push(droppedValue);
    renderColumn(colIndex);
    
    const colContainer = document.getElementById(`col-content-${colIndex}`);
    const topCardDOM = colContainer.lastElementChild;
    if (topCardDOM && columns[colIndex].length > 1) {
        topCardDOM.classList.add('animate-impact');
    }

    await processMerges(colIndex);

    if (columns[colIndex].length > MAX_CARDS_PER_COLUMN) {
        triggerGameOver();
        return;
    }

    generateNextCard();
    isProcessing = false;
}

// Animación dinámica de caída. 
// Nota: Los transforms(x,y) exactos se hacen inline porque Tailwind no puede adivinar coordenadas dinámicas en tiempo real.
function animateCardDrop(colIndex, value) {
    return new Promise(resolve => {
        const deckRect = deckContainer.getBoundingClientRect();
        const colZone = document.querySelectorAll('.col-zone')[colIndex];
        const colContainer = document.getElementById(`col-content-${colIndex}`);
        
        const topCardDOM = colContainer.lastElementChild;
        let targetY;
        
        if (topCardDOM) {
            const topRect = topCardDOM.getBoundingClientRect();
            targetY = topRect.top - deckRect.height - 8;
        } else {
            const colRect = colZone.getBoundingClientRect();
            targetY = colRect.bottom - deckRect.height - 16;
        }

        const targetX = colZone.getBoundingClientRect().left + (colZone.clientWidth / 2) - (deckRect.width / 2);

        const transitCard = createCardDOM(value);
        
        // Clases Tailwind para la carta en tránsito
        transitCard.classList.add('fixed', 'z-[100]', 'pointer-events-none', 'transition-transform', 'duration-[250ms]', 'ease-[cubic-bezier(0.5,0,1,1)]');
        
        transitCard.style.left = `${deckRect.left}px`;
        transitCard.style.top = `${deckRect.top}px`;
        transitCard.style.width = `${deckRect.width}px`;
        transitCard.style.height = `${deckRect.height}px`;
        
        document.body.appendChild(transitCard);
        deckContainer.innerHTML = '';

        transitCard.offsetHeight; // Reflow

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

        if (top === below) {
            await sleep(CHAIN_DELAY);
    
            col.pop();
            col.pop();
            let newValue = top * 2;
            col.push(newValue);
    
            score += newValue;
            scoreEl.textContent = score;

            renderColumn(colIndex, true);

            if (newValue === 2048) {
                await sleep(400); 

                const colContainer = document.getElementById(`col-content-${colIndex}`);
                const cardDOM = colContainer.lastElementChild;
                // Usar animación configurada en Tailwind
                cardDOM.classList.add('animate-clear2048');

                await sleep(600); 

                columns[colIndex] = [];
                renderColumn(colIndex);
                break; 
            }
        } else {
            break;
        }
    }
}

function triggerGameOver() {
    isProcessing = true;
    finalScoreEl.textContent = score;
    
    // Mostrar modal Tailwind
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100', 'pointer-events-auto');
    modalContent.classList.remove('scale-75');
    modalContent.classList.add('scale-100');
}

// Arranque
window.onload = initGame;
