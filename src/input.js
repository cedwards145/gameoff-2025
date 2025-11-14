const keysDown = {}
const keysPressed = {}

function handleKeyUp(e) {
    keysDown[e.keyCode] = false;
}

function handleKeyDown(e) {
    keysDown[e.keyCode] = true;
    keysPressed[e.keyCode] = true;
}

function isKeyDown(key) {
    return keysDown[key];
}

function isKeyPressed(key) {
    return keysPressed[key];
}

function clearPressedKeys() {
    for (const key in keysPressed) {
        delete keysPressed[key];
    }
}

export { handleKeyDown, handleKeyUp, isKeyDown, isKeyPressed, clearPressedKeys };
