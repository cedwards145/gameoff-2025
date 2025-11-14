interface KeyState {
    [keyCode: number]: boolean;
}

const keysDown: KeyState = {};
const keysPressed: KeyState = {};

export function handleKeyUp(e: KeyboardEvent): void {
    keysDown[e.keyCode] = false;
}

export function handleKeyDown(e: KeyboardEvent): void {
    keysDown[e.keyCode] = true;
    keysPressed[e.keyCode] = true;
}

export function isKeyDown(key: number): boolean {
    return keysDown[key] || false;
}

export function isKeyPressed(key: number): boolean {
    return keysPressed[key] || false;
}

export function clearPressedKeys(): void {
    for (const key in keysPressed) {
        delete keysPressed[key];
    }
}
