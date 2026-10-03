import { Rectangle } from "../types";
import { Size } from "./node";
import { Text } from "./text";
import { BODY_FONT, BODY_FONT_SIZE } from "./theme";

export class BodyText extends Text {
    constructor(text: string) {
        super(text, BODY_FONT, BODY_FONT_SIZE, true);
    }

    measure(bounds: Rectangle, context: CanvasRenderingContext2D): Size {
        const size = super.measure(bounds, context);
        return {
            width: size.width,
            height: size.height + 4
        };
    }
}