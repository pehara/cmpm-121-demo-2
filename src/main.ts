import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

// Step 0

const gameName = "hehe game";

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
