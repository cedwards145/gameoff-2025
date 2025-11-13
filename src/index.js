const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const WIDTH = 1280;
const HEIGHT = 720;
const SCALE = 2;

const mousePosition = { x: 0, y: 0 };

canvas.onmousemove = e => {
    const rect = e.target.getBoundingClientRect();
    mousePosition.x = (e.clientX - rect.left) / SCALE;
    mousePosition.y = (e.clientY - rect.top) / SCALE;  //y position within the element.
}


function update() {}

function drawInventory(context) {
    context.fillStyle = "white";
    context.fillRect(8, 8, 256, 256);

    context.fillStyle = "grey";
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            context.fillRect(
                8 + 4 + (x * (16 + 4)),
                8 + 4 + (y * (16 + 4)),
                16,
                16
            );
        }
    }
}

function draw(context) {
    context.fillStyle = "cornflowerblue";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.scale(SCALE, SCALE);
    drawInventory(context);
    context.fillStyle = "red";
    
    context.fillRect(mousePosition.x - 1, mousePosition.y - 1, 3, 3);
    
    context.resetTransform();
}

function loop() {
    update();
    draw(context);

    requestAnimationFrame(loop);
}

loop();
