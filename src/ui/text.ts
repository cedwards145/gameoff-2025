import { Rectangle } from "../types";
import { Size, UINode } from "./node";


function measureText(text: string, context: CanvasRenderingContext2D): Size {
    const metrics = context.measureText(text);
    return {
        width: metrics.width,
        height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
    }
}


export class Text extends UINode {
    constructor(
        private text: string,
        private fontFamily: string,
        private fontSize: number,
        private centered: boolean = false) {
        super();
    }

    private splitToLines(bounds: Rectangle, context: CanvasRenderingContext2D): string[] {
        const lines: string[] = [];
        const inputLines = this.text.split("\n").map(line => line.trim());

        for (const inputLine of inputLines) {
            const words = inputLine.split(" ");
            let line = "";
            
            while (words.length > 0) {
                const currentWord = words.shift()!;

                // Always put at least one word onto a line. If a single word is too big to fit on a line,
                // we can never exit the loop. Unlikely to ever actually happen.
                if (line === "") {
                    line = currentWord;
                }
                else {
                    const proposedLine = `${line} ${currentWord}`;
                    const size = measureText(proposedLine, context);

                    if (size.width > bounds.width) {
                        lines.push(line);
                        words.unshift(currentWord);
                        line = "";
                    }
                    else {
                        line = proposedLine;
                    }
                }
            }
            lines.push(line);
        }

        return lines;
    }

    measure(bounds: Rectangle, context: CanvasRenderingContext2D): Size {
        const lines = this.splitToLines(bounds, context);        
        context.font = `${this.fontSize}px ${this.fontFamily}`;
        const height = lines.reduce((total: number, currentLine: string) => total + measureText(currentLine, context).height, 0);
        const width = lines.reduce((total: number, currentLine: string) => Math.max(total, measureText(currentLine, context).width), 0);

        return {
            width: width,
            height: height
        }
    }

    draw(context: CanvasRenderingContext2D, bounds: Rectangle) {
        const lines = this.splitToLines(bounds, context);
        let y = bounds.y;

        for (const line of lines) {
            const size = measureText(line, context);
            const x = this.centered ? bounds.x + (bounds.width - size.width) / 2 : bounds.x
            context.fillStyle = "black";
            context.fillText(line, x, y);
            y += size.height;
        }
    }
}