import "./style.css";

// Step 5

class MarkerLine {
  private points: Array<{ x: number; y: number }> = [];

  constructor(initialPoint: { x: number; y: number }) {
    this.points.push(initialPoint);
  }

  drag(x: number, y: number) {
    // Add a point to the line as the user drags the cursor
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    // Display the line on the canvas
    if (this.points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);

      for (const point of this.points) {
        ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
    }
  }
}

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
canvas.style.backgroundColor = "white"; // White background

// Append the canvas to the app container
app.append(canvas);

// Step 2

// Allow the user to draw on the canvas using mouse events

const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");

let isDrawing: boolean = false;

// Save the user's marker lines into an array
const markerLines: MarkerLine[] = [];

// Allow the user to draw on the canvas using mouse events and save points
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

function startDrawing(e: MouseEvent) {
  isDrawing = true;

  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY - canvas.offsetTop;

  // Create a new MarkerLine and add it to the array
  const newMarkerLine = new MarkerLine({ x, y });
  markerLines.push(newMarkerLine);
}

function draw(e: MouseEvent) {
  if (!isDrawing || !ctx) return;

  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY - canvas.offsetTop;

  // Drag the last marker line as the user moves the cursor
  markerLines[markerLines.length - 1].drag(x, y);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw all marker lines
  for (const line of markerLines) {
    line.display(ctx);
  }
}

function stopDrawing() {
  isDrawing = false;
}

function clearCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  markerLines.length = 0; // Clear the array of marker lines
  canvas.dispatchEvent(new Event("drawing-changed")); // Dispatch the "drawing-changed" event
}

// Step 3

// Add an observer for the "drawing-changed" event
canvas.addEventListener("drawing-changed", updateCanvas);

function updateCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw all marker lines
  for (const line of markerLines) {
    line.display(ctx);
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

const undoStack: MarkerLine[] = [];
const redoStack: MarkerLine[] = [];

function undoDrawing() {
  if (!isDrawing && markerLines.length > 0) {
    const undoneLine = markerLines.pop()!;
    undoStack.push(undoneLine); // Copy the undone line to undo stack

    // Update the canvas immediately after popping from markerLines
    updateCanvas();

    // Dispatch the "drawing-changed" event
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
}

// Redo button is not
function redoDrawing() {
  if (redoStack.length > 0) {
    const redoneLine = redoStack.pop()!;
    markerLines.push(redoneLine); // Add the redone line back to markerLines

    // Update the canvas immediately after pushing to markerLines
    updateCanvas();

    // Dispatch the "drawing-changed" event
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
}
