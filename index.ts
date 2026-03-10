import SnakeRenderer from "./SnakeRenderer";

const canvas = document.createElement("canvas");
canvas.style.imageRendering = "pixelated";
document.body.replaceChildren(canvas);
const r = new SnakeRenderer(canvas);
r.startGame();
