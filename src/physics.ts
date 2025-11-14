import { Rectangle } from "./types";

export function intersects(a: Rectangle, b: Rectangle): boolean {
    return !(
        a.x > b.x + b.width ||
        a.x + a.width < b.x ||
        a.y > b.y + b.height ||
        a.y + a.height < b.y
    );
}
