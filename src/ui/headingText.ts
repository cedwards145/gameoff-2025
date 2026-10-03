import { Rectangle } from "../types";
import { Size } from "./node";
import { Text } from "./text";
import { HEADING_FONT, HEADER_FONT_SIZE } from "./theme";

export class HeadingText extends Text {
    constructor(text: string) {
        super(text, HEADING_FONT, HEADER_FONT_SIZE, true);
    }

    measure(bounds: Rectangle, context: CanvasRenderingContext2D): Size {
        const size = super.measure(bounds, context);
        return {
            width: size.width,
            height: size.height + 12
        };
    }
}