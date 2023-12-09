import "./style.css";

// Modified the MarkerLine class to accept a thickness parameter
class MarkerLine {
	private points: Array<{ x: number; y: number }> = [];
	private thickness: number;

	constructor(initialPoint: { x: number; y: number }, thickness: number) {
		this.points.push(initialPoint);
		this.thickness = thickness;
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

		// Set the line thickness based on the provided thickness
		ctx.lineWidth = this.thickness;

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

// Step 6
// Variable to store the current marker thickness
let currentMarkerThickness: 1 | 2 = 1;

// Variable to store the tool preview
let toolPreview: MarkerLine | null = null;

// Allow the user to draw on the canvas using mouse events and save points
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);
canvas.addEventListener("mousemove", handleToolMove); // New event listener for tool preview


function startDrawing(e: MouseEvent) {
	isDrawing = true;

	const x = e.clientX - canvas.offsetLeft;
	const y = e.clientY - canvas.offsetTop;

	// Create a new MarkerLine and add it to the array
	const newMarkerLine = new MarkerLine({ x, y }, currentMarkerThickness);
	markerLines.push(newMarkerLine);
}

function draw(e: MouseEvent) {
	if (!isDrawing || !ctx) return;

	const x = e.clientX - canvas.offsetLeft;
	const y = e.clientY - canvas.offsetTop;

	// Drag the last marker line as the user moves the cursor
	markerLines[markerLines.length - 1].drag(x, y);

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Redraw all marker lines with the currentMarkerThickness
    for (const line of markerLines) {
        line.display(ctx!);
    }

    // Draw the tool preview if the mouse is not down
    if (!isDrawing) {
        drawToolPreview(x, y);
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

function redoDrawing() {
  if (undoStack.length > 0) {
    const redoneLine = undoStack.pop()!;

    markerLines.push(redoneLine);

    // Update the canvas immediately after pushing to markerLines
    updateCanvas();
  }
}

// Step 5

// Add a "thin" marker button
const thinButton: HTMLButtonElement = document.createElement("button");
thinButton.textContent = "Thin";
thinButton.addEventListener("click", () => setMarkerThickness(1));
buttonsContainer.append(thinButton);

// Add a "thick" marker button
const thickButton: HTMLButtonElement = document.createElement("button");
thickButton.textContent = "Thick";
thickButton.addEventListener("click", () => setMarkerThickness(2));
buttonsContainer.append(thickButton);

// // Variable to store the current marker thickness
// let currentMarkerThickness: 1 | 2 = 1;

function setMarkerThickness(thickness: 1 | 2) {
	currentMarkerThickness = thickness;

	// Indicate the selected tool
	thinButton.classList.remove("selectedTool");
	thickButton.classList.remove("selectedTool");
	if (thickness === 1) {
		thinButton.classList.add("selectedTool");
	} else {
		thickButton.classList.add("selectedTool");
	}
}

// Step 6

function drawToolPreview(x: number, y: number) {
    // Draw the tool preview using the currentMarkerThickness
    toolPreview = new MarkerLine({ x, y }, currentMarkerThickness);
    toolPreview.display(ctx!);
}

function clearToolPreview() {
    // Clear the tool preview
    toolPreview = null;
    updateCanvas();
}

function handleToolMove(e: MouseEvent) {
    if (!isDrawing) {
        clearToolPreview();
        const x = e.clientX - canvas.offsetLeft;
        const y = e.clientY - canvas.offsetTop;
        drawToolPreview(x, y);
    }
}
