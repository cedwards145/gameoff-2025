class Window {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.padding = 4;
    }

    update() {}

    draw(context) {
        context.fillStyle = "white";
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

export { Window };
