import "./style.css";

const ZERO = 0;
const ONE = 1;

// Create a new class for stickers
class Sticker {
    constructor(private x: number, private y: number, private sticker: string) {}

    display(ctx: CanvasRenderingContext2D) {
        // Draw the sticker on the canvas with a smaller font size
        ctx.font = '24px Arial'; // Change the font size to your desired value
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.sticker, this.x, this.y);
    }
}

// Modify the Set to store instances of the Sticker class
const drawnStickers: Set<Sticker> = new Set();

// Modified the MarkerLine class to accept a thickness parameter
class MarkerLine {
	private points: { x: number; y: number }[] = [];
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
		if (this.points.length > ONE) {
		ctx.beginPath();
		ctx.moveTo(this.points[ZERO].x, this.points[ZERO].y);

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

const INITIAL_MARKER_LINES_LENGTH = 0;
const THIN_MARKER_THICKNESS = 1;
const THICK_MARKER_THICKNESS = 2;

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

let isDrawing = false;

// Save the user's marker lines into an array
const markerLines: MarkerLine[] = [];

// Step 6
// Constants for marker thickness
// const THIN_MARKER = 1 as const;
// const THICK_MARKER = 2 as const;

const THIN_MARKER = 1 as const;
const THICK_MARKER = 2 as const;

// Variable to store the current marker thickness
let currentMarkerThickness: typeof THIN_MARKER | typeof THICK_MARKER = THIN_MARKER;

let selectedSticker: string | null = null;

// Variable to track whether the sticker button has been clicked
let isStickerButtonClicked = false;

//const stickerPreviewCommand: ToolPreviewCommand | null = null;

// Variable to store the tool preview
let toolPreview: MarkerLine | null = null;

// Variable to store the tool preview command
let stickerPreviewCommand: ToolPreviewCommand | null = null;

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

// Add a function to draw sticker preview separately
function drawStickerPreview(x: number, y: number, sticker: string) {
    if (stickerPreviewCommand && isStickerButtonClicked) {
        stickerPreviewCommand.execute(x, y, ZERO, sticker);
    }
}

// Now you can use this function in your draw function:
function draw(e: MouseEvent) {
    if (!isDrawing || !ctx) return;
    const x = e.clientX - canvas.offsetLeft;
    const y = e.clientY - canvas.offsetTop;

    if (selectedSticker) {
        // Handle drawing stickers separately
		drawStickerPreview(x, y, selectedSticker);
		
		// Execute the IncludeStickerCommand at the beginning of drawing
		const includeStickerCommand = new IncludeStickerCommand(selectedSticker || "★");

		includeStickerCommand.execute({ x, y });
	
    } else {
        // Handle drawing regular lines
        markerLines[markerLines.length - ONE].drag(x, y);
        ctx.clearRect(ZERO, ZERO, canvas.width, canvas.height);

        for (const line of markerLines) {
            line.display(ctx);
        }

        if (!isDrawing) {
            // Draw the tool preview if the mouse is not down
            drawToolPreview(x, y, selectedSticker || "");
        }
    }
}



function stopDrawing() {
  isDrawing = false;
}

function clearCanvas() {
	if (!ctx) return;
	ctx.clearRect(ZERO, ZERO, canvas.width, canvas.height);
	markerLines.length = 0; // Clear the array of marker lines
	canvas.dispatchEvent(new Event("drawing-changed")); // Dispatch the "drawing-changed" event
}

// Step 3

// Add an observer for the "drawing-changed" event
canvas.addEventListener("drawing-changed", updateCanvas);

// Modify the updateCanvas function to handle stickers
function updateCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw all marker lines
    for (const line of markerLines) {
        line.display(ctx);
    }

    // Draw all stickers
    for (const sticker of drawnStickers) {
        sticker.display(ctx);
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
clearButton.addEventListener("click", clearDrawing);
buttonsContainer.append(clearButton);

// Step 5
// Undo and Redo buttons
const undoButton: HTMLButtonElement = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.addEventListener("click", undoDrawing);
buttonsContainer.append(undoButton);

const redoButton: HTMLButtonElement = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.addEventListener("click", redoDrawing);
buttonsContainer.append(redoButton);

const undoStack: (MarkerLine | Sticker)[] = [];
const redoStack: (MarkerLine | Sticker)[] = [];

function undoDrawing() {
    if (!isDrawing && markerLines.length > INITIAL_MARKER_LINES_LENGTH) {
        const undoneLine = markerLines.pop()!;
        undoStack.push(undoneLine);
    } else if (!isDrawing && drawnStickers.size > 0) {
        const undoneSticker = Array.from(drawnStickers).pop()!;
        undoStack.push(undoneSticker);
        drawnStickers.delete(undoneSticker);
    }

    // Update the canvas immediately after undoing
    updateCanvas();
    canvas.dispatchEvent(new Event("drawing-changed"));
}

function redoDrawing() {
    if (undoStack.length > INITIAL_MARKER_LINES_LENGTH || redoStack.length > 0) {
        if (undoStack.length > INITIAL_MARKER_LINES_LENGTH) {
            const redoneLine = undoStack.pop()!;
            if (redoneLine instanceof MarkerLine) {
                markerLines.push(redoneLine);
            } else if (redoneLine instanceof Sticker) {
                drawnStickers.add(redoneLine);
            }
        } else {
            const redoneSticker = redoStack.pop()!;
            if (redoneSticker instanceof Sticker) {
                drawnStickers.add(redoneSticker);
            }
        }

        // Update the canvas immediately after redoing
        updateCanvas();
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
}

function clearDrawing() {
    if (!isDrawing) {
        // Clear both marker lines and stickers
        markerLines.length = 0;
        drawnStickers.clear();

        // Update the canvas immediately after clearing
        updateCanvas();
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
}

// Step 6

// Add a "thin" marker button
const thinButton: HTMLButtonElement = document.createElement("button");
thinButton.textContent = "Thin";
thinButton.addEventListener("click", () => {
    setMarkerThickness(THIN_MARKER_THICKNESS);
    isStickerButtonClicked = false;
});
buttonsContainer.append(thinButton);

// Add a "thick" marker button
const thickButton: HTMLButtonElement = document.createElement("button");
thickButton.textContent = "Thick";
thickButton.addEventListener("click", () => {
    setMarkerThickness(THICK_MARKER_THICKNESS);
    isStickerButtonClicked = false;
});
buttonsContainer.append(thickButton);

function setMarkerThickness(thickness: 1 | 2) {
    currentMarkerThickness = thickness;

    // Indicate the selected tool
    thinButton.classList.remove("selectedTool");
    thickButton.classList.remove("selectedTool");
    if (thickness === ONE) {
        thinButton.classList.add("selectedTool");
    } else {
        thickButton.classList.add("selectedTool");
    }

    // Set isStickerButtonClicked to false when a marker button is clicked
    isStickerButtonClicked = false;
}


// Step 7

function drawToolPreview(x: number, y: number, sticker: string) {
    // Draw the tool preview using the currentMarkerThickness and sticker
    if (toolPreview) {
        toolPreview.display(ctx!);
    }
    toolPreview = new MarkerLine({ x, y, sticker }, currentMarkerThickness);
    toolPreview.display(ctx!);
}


class ToolPreviewCommand {
    constructor(private x: number, private y: number, private sticker: string, private thickness: number) {}

    execute(cursorPosition: { x?: number; y?: number }) {
        // Draw the tool preview using the currentMarkerThickness and sticker
        drawToolPreview(cursorPosition.x || 0, cursorPosition.y || 0, this.sticker);
    }
}

function clearToolPreview() {
    // Clear the tool preview
    toolPreview = null;
    updateCanvas();
}

// Modify the handleToolMove function to use the ToolPreviewCommand
function handleToolMove(e: MouseEvent) {
    if (!isDrawing) {
        const x = e.clientX - canvas.offsetLeft;
        const y = e.clientY - canvas.offsetTop;

        // Update the tool preview position
        clearToolPreview();
        const toolPreviewCommand = new ToolPreviewCommand(x, y, "★", currentMarkerThickness);
        toolPreviewCommand.execute({ x, y });
    }
}


// Step 7

// Emoji Unicode character codes for the stickers
const stickerCodes = ["😸", "😹", "😻"];

// Create buttons for each sticker and append them to the buttonsContainer
for (let i = 0; i < stickerCodes.length; i++) {
    const stickerButton: HTMLButtonElement = document.createElement("button");
    stickerButton.textContent = `Sticker ${i + 1}`;
    stickerButton.addEventListener("click", () => handleStickerClick(stickerCodes[i]));
    buttonsContainer.append(stickerButton);
}

// Update the handleStickerClick function to set the isStickerButtonClicked variable
function handleStickerClick(sticker: string) {
    // Dispatch the "tool-moved" event with the selected sticker as data
    fireEvent("tool-moved", sticker);

    // Set the selected sticker
    selectedSticker = sticker;

    // Create a new ToolPreviewCommand with the selected sticker
    stickerPreviewCommand = new ToolPreviewCommand(0, 0, selectedSticker, currentMarkerThickness);

    // Execute the IncludeStickerCommand with the selected sticker only if the sticker button is clicked
    if (isStickerButtonClicked) {
        const includeStickerCommand = new IncludeStickerCommand(selectedSticker);
        includeStickerCommand.execute({ x: 0, y: 0 }); // Pass initial position (it can be adjusted)
    }

    // Set isStickerButtonClicked to true when the sticker button is clicked
    isStickerButtonClicked = true;
}


class IncludeStickerCommand {
    private sticker: string;
    private initialPosition: { x: number; y: number };

    constructor(sticker: string) {
        this.sticker = sticker;
        this.initialPosition = { x: 0, y: 0 }; // Set an initial position
    }

    execute(cursorPosition: { x: number; y: number }) {
        // Store the drawn sticker as an instance of the Sticker class
        drawnStickers.add(new Sticker(cursorPosition.x, cursorPosition.y, this.sticker));

        // Redraw all stickers whenever the canvas is updated
        updateCanvas();
    }

    drag(cursorPosition: { x: number; y: number }) {
        // Reposition the sticker during drag
        const deltaX = cursorPosition.x - this.initialPosition.x;
        const deltaY = cursorPosition.y - this.initialPosition.y;

        // Clear the canvas and redraw all marker lines with the currentMarkerThickness
        ctx!.clearRect(ZERO, ZERO, canvas.width, canvas.height);
        for (const line of markerLines) {
            line.display(ctx);
        }

        // Draw the sticker at the new position
        drawSticker(cursorPosition.x, cursorPosition.y, this.sticker);
    }
}


function drawSticker(x: number, y: number, sticker: string) {
    // Draw the sticker on the canvas with a smaller font size
    ctx!.font = '24px Arial'; // Change the font size to your desired value
    ctx!.textAlign = "center";
    ctx!.textBaseline = "middle";
    ctx!.fillText(sticker, x, y);
}

function fireEvent(eventName: string, data: any) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
}

