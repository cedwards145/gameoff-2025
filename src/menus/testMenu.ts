import { BodyText } from "../ui/bodyText";
import { Button } from "../ui/button";
import { Grid } from "../ui/grid";
import { HeadingText } from "../ui/headingText";
import { Image } from "../ui/image";
import { Panel } from "../ui/panel";
import { UITree } from "../ui/ui-tree";
import { Menu } from "./menu";

export class TestMenu extends Menu {
    private ui: UITree;

    constructor() {
        super();
        this.ui = new UITree(
            new Panel([
                new HeadingText("Warning"),
                new BodyText("Are you sure you want to discard this?"),
                new Image("apple", 32, 32),
                new Grid(2, 1, [new Button(new BodyText("Yes")), new Button(new BodyText("No"))])
            ])
        );
    }

    update(): void {
        super.update();
        this.ui.update(0);
    }

    draw(context: CanvasRenderingContext2D): void {
        context.fillStyle = "black";
        this.ui.draw(context, { x: 50, y: 30, width: 300, height: 150 });
    }
}