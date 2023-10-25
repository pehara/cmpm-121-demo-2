import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

// Step 0

const gameName = "drawing hehe";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

// Step 1

// Adding Canvas
const canvas: HTMLCanvasElement = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;

// Applying CSS styling to the canvas
canvas.style.border = "1px solid black"; // Thin black border
canvas.style.borderRadius = "8px"; // Optional rounded corners
canvas.style.boxShadow = "2px 2px 8px rgba(0, 0, 0, 0.2)"; // Optional drop shadow

// Append the canvas to the app container
app.append(canvas);

// Step 2

// Allow the user to draw on the canvas using mouse events

const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");

let isDrawing: boolean = false;

// Allow the user to draw on the canvas using mouse events and save points
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

function startDrawing(e: MouseEvent) {
    isDrawing = true;
    draw(e); // Start drawing immediately
}
  
function draw(e: MouseEvent) {
    if (!isDrawing || !ctx) return;
  
    const x = e.clientX - canvas.offsetLeft;
    const y = e.clientY - canvas.offsetTop;
  
    // Save the point to the array
    drawingPoints[drawingPoints.length - 1].push({ x, y });
  
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
  
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}
  
function stopDrawing() {
  isDrawing = false;
  ctx?.beginPath();
  // Start a new array for the next line
  drawingPoints.push([]);
}

function clearCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawingPoints.length = 0; // Clear the array of drawing points
  canvas.dispatchEvent(new Event("drawing-changed")); // Dispatch the "drawing-changed" event
}

// Step 3

// Save the user's mouse positions into an array of arrays of points
const drawingPoints: Array<Array<{ x: number; y: number }>> = [];

// Add an observer for the "drawing-changed" event
canvas.addEventListener("drawing-changed", updateCanvas);

function updateCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Clear undo and redo stacks
    undoStack.length = 0;
    redoStack.length = 0;
  
    // Redraw the lines using the saved drawing points
    for (const line of drawingPoints) {
      ctx.beginPath();
      ctx.moveTo(line[0].x, line[0].y);
  
      for (const point of line) {
        ctx.lineTo(point.x, point.y);
      }
  
      ctx.stroke();
    }
}
  
// Allow the user to draw on the canvas using mouse events and save points
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

// Step 4

// Create a container for the buttons
const buttonsContainer: HTMLDivElement = document.createElement("div");
buttonsContainer.style.marginTop = "10px"; // Adjust margin as needed
app.append(buttonsContainer);

// Add a "clear" button
const clearButton: HTMLButtonElement = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", clearCanvas);
buttonsContainer.append(clearButton);

// Undo and Redo buttons
const undoButton: HTMLButtonElement = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.addEventListener("click", undoDrawing);
buttonsContainer.append(undoButton);

const redoButton: HTMLButtonElement = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.addEventListener("click", redoDrawing);
buttonsContainer.append(redoButton);

const undoStack: Array<Array<{ x: number; y: number }>> = [];
const redoStack: Array<Array<{ x: number; y: number }>> = [];

function undoDrawing() {
    if (!isDrawing && drawingPoints.length > 0) {
      const undoneLine = drawingPoints.pop()!;
      undoStack.push([...undoneLine]); // Copy the undone line
      redoStack.length = 0; // Clear redo stack when performing undo
  
      // Update the canvas immediately after popping from drawingPoints
      updateCanvas();
  
      // Dispatch the "drawing-changed" event
      canvas.dispatchEvent(new Event("drawing-changed"));
    }
}
  
function redoDrawing() {
    if (undoStack.length > 0) {
      const redoneLine = undoStack.pop()!;
      drawingPoints.push([...redoneLine]); // Copy the redone line
      redoStack.push([...redoneLine]); // Add to redo stack
  
      // Dispatch the "drawing-changed" event
      canvas.dispatchEvent(new Event("drawing-changed"));
    }
} 
