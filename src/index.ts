import { clearPressedKeys, handleKeyDown, handleKeyUp } from "./input";
import map from "./map.json";
import { load } from "./resources";
import { Game } from "./game";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d") as CanvasRenderingContext2D;

document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

const game = new Game(map);

function update(deltaT: number): void {
    game.update(deltaT);
    clearPressedKeys();
}

function draw(context: CanvasRenderingContext2D) {
    game.draw(context);
}

let start = 0;
function loop(timestamp: number): void {
    if (start) {
        const elapsedMs = timestamp - start;
        const deltaT = elapsedMs / 1000;

        update(deltaT);
        draw(context);
    }

    start = timestamp;
    requestAnimationFrame(loop);
}

function runGame() {
    requestAnimationFrame(loop);
}

load(runGame);
