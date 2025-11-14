export class Window {
    x: number;
    y: number;
    width: number;
    height: number;
    padding: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.padding = 4;
    }

    update(): void {}

    draw(context: CanvasRenderingContext2D): void {
        context.fillStyle = "white";
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}
