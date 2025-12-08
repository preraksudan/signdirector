// --- 1. Core Variables and Setup ---
const canvas = document.getElementById('drawingBoard'); 
const ctx = canvas.getContext('2d');

let isDrawing = false;
let lastX = 0;
let lastY = 0;

let currentColor = '#000000'; // Default drawing color
let currentLineWidth = 5;     // Default line width
let history = [];             // Array to store canvas states for undo/redo
let historyStep = -1;         // Current position in the history array

// Get references to the new HTML inputs
const penColorInput = document.getElementById('penColor');
const lineWidthInput = document.getElementById('lineWidth');
const sizeDisplay = document.getElementById('sizeDisplay');


// --- 2. Function Definitions (Helper, Drawing, Tools, History) ---

function getCoords(e) {
    // Determine coordinates based on whether it's a touch or mouse event
    if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0]; // Use the first touch point
        return {
            x: touch.clientX - canvas.offsetLeft,
            y: touch.clientY - canvas.offsetTop
        };
    } else {
        return {
            x: e.clientX - canvas.offsetLeft,
            y: e.clientY - canvas.offsetTop
        };
    }
}

function getPenColor() {
    return penColorInput.value;
}

function getLineWidth() {
    sizeDisplay.textContent = lineWidthInput.value; 
    return parseInt(lineWidthInput.value);
}

function drawStart(e) {
    e.preventDefault(); 
    isDrawing = true;
    const coords = getCoords(e);
    lastX = coords.x;
    lastY = coords.y;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
}

function drawMove(e) {
    if (!isDrawing) return;
    e.preventDefault(); 
    const coords = getCoords(e);

    // Use the *current* settings every time the line moves
    ctx.lineWidth = currentLineWidth; 
    ctx.strokeStyle = currentColor; 
    ctx.lineCap = 'round'; 
    
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    
    lastX = coords.x;
    lastY = coords.y;
}

function drawEnd(e) {
    if (!isDrawing) return;
    e.preventDefault(); 
    isDrawing = false;
    ctx.beginPath(); // Stop the current path
    saveState(); // Save the state to history after a full stroke is completed
}

function setPencilMode() {
    currentColor = getPenColor(); 
    currentLineWidth = getLineWidth();
}

function setEraserMode() {
    // "Transparent option" achieved by using the background color (white)
    currentColor = '#f3f3f3ff'; 
    currentLineWidth = 20; 
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState(); // Save the cleared state to history
}

function saveState() {
    historyStep++;
    if (historyStep < history.length) {
        history = history.slice(0, historyStep); 
    }
    history.push(canvas.toDataURL()); 
}

function undo() {
    if (historyStep <= 0) return;
    historyStep--;
    let canvasImage = new Image();
    canvasImage.src = history[historyStep];
    canvasImage.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        ctx.drawImage(canvasImage, 0, 0, canvas.width, canvas.height);
    }
}

function redo() {
    if (historyStep >= history.length - 1) return;
    historyStep++;
    let canvasImage = new Image();
    canvasImage.src = history[historyStep];
    canvasImage.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(canvasImage, 0, 0, canvas.width, canvas.height); 
    }
}


// --- 3. Event Listeners and Initialization (at the very bottom) ---

// Add all canvas event listeners here:
canvas.addEventListener('mousedown', drawStart);
canvas.addEventListener('mousemove', drawMove);
canvas.addEventListener('mouseup', drawEnd);
canvas.addEventListener('mouseleave', drawEnd); 
canvas.addEventListener('mouseout', drawEnd); 

canvas.addEventListener('touchstart', drawStart);
canvas.addEventListener('touchmove', drawMove);
canvas.addEventListener('touchend', drawEnd);
canvas.addEventListener('touchcancel', drawEnd);

// Add listeners for HTML inputs here:
penColorInput.addEventListener('change', () => {
    setPencilMode(); 
});

lineWidthInput.addEventListener('input', () => {
    currentLineWidth = getLineWidth();
});


// Initialization: This runs ONLY after everything above is defined and the page is loaded
window.onload = () => {
    saveState(); 
    setPencilMode(); // Start in pencil mode with default settings
};


/**
 * Converts the canvas content to an image and triggers a local download.
 */
function downloadSignature() {
    // 1. Convert the canvas content to a Data URL (base64 encoded PNG by default)
    const imageURL = canvas.toDataURL("image/png");

    // 2. Create a temporary anchor element (a link)
    const downloadLink = document.createElement('a');
    
    // 3. Set the download attribute with a desired file name
    downloadLink.download = "my-signature.png";
    
    // 4. Set the link's href to the image data URL
    downloadLink.href = imageURL;
    
    // 5. Append the link to the body (necessary for Firefox to work)
    document.body.appendChild(downloadLink);
    
    // 6. Programmatically click the link to trigger the download prompt
    downloadLink.click();
    
    // 7. Clean up the temporary link element
    document.body.removeChild(downloadLink);
}

