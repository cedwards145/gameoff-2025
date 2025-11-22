import { getAnimations } from "./asprite";
import { getImageResource } from "./resources";
import { Position } from "./types";

const SPRITE_WIDTH = 80;
const SPRITE_HEIGHT = 80;
const SPRITE_BASELINE = 47;
const SECONDS_PER_SPRITE = 0.1;

export enum CharacterState {
    IDLE,
    WALK,
    RUN,
    HURT,
    SWORD_SWING,
}

export enum Direction {
    RIGHT,
    LEFT,
    DOWN,
    UP,
}

const ANIMATIONS = getAnimations();
const STATE_TO_ANIMATION: Record<CharacterState, string> = {
    [CharacterState.IDLE]: "idle",
    [CharacterState.WALK]: "walk",
    [CharacterState.RUN]: "run",
    [CharacterState.SWORD_SWING]: "sword",
    [CharacterState.HURT]: "hurt",
};

const DIRECTION_TO_OFFSET: Record<Direction, number> = {
    [Direction.UP]: 2,
    [Direction.DOWN]: 1,
    [Direction.LEFT]: 0,
    [Direction.RIGHT]: 0,
};

const RUN_SPEED = 128;
const WALK_SPEED = 64;

function getXComponent(direction: Direction): number {
    switch (direction) {
        case Direction.LEFT:
            return -1;
        case Direction.RIGHT:
            return 1;
        default:
            return 0;
    }
}

function getYComponent(direction: Direction): number {
    switch (direction) {
        case Direction.UP:
            return -1;
        case Direction.DOWN:
            return 1;
        default:
            return 0;
    }
}

function directionFromComponents(x: number, y: number): Direction {
    if (Math.abs(x) > Math.abs(y)) {
        if (x > 0) {
            return Direction.RIGHT;
        } else {
            return Direction.LEFT;
        }
    } else {
        if (y > 0) {
            return Direction.DOWN;
        } else {
            return Direction.UP;
        }
    }
}

export class Character {
    x: number;
    y: number;
    width: number;
    height: number;
    state: CharacterState;
    direction: Direction;
    animationTime: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.animationTime = 0;
        this.state = CharacterState.IDLE;
        this.direction = Direction.RIGHT;

        // this.handleCollision = this.handleCollision.bind(this);
        // this.addCollider({
        //     type: ColliderType.Ellipse,
        //     enabled: true,
        //     xOffset: 0,
        //     yOffset: -6,
        //     radius: 6,
        //     onCollide: this.handleCollision
        // });
    }

    // getRequiredOffset(otherCollider, collider) {
    //     // Calculate the difference in each dimension from the centre of this characters
    //     // collider (assumed to be an ellipse for all characters) to a point on the other collider
    //     let dx = 0;
    //     let dy = 0;

    //     // Also calculate the required distance for each collider type (ie, the closest distance
    //     // that leaves the character NOT intersecting with the other collider)
    //     let requiredDistance = 0;

    //     switch (otherCollider.type) {
    //         case ColliderType.Ellipse:
    //             // In the case of an ellipse, calculate the distance between centres
    //             dx = otherCollider.x - collider.x;
    //             dy = otherCollider.y - collider.y;

    //             // The required distance for two ellipses is the sum of their radii
    //             requiredDistance = otherCollider.radius + collider.radius;
    //             break;
    //         case ColliderType.Rectangle:
    //             // In the case of a rectangle, first find the closest point inside the rectangle
    //             // to the collider's centre.
    //             // Then find the distance from the collider's centre to that point
    //             dx =
    //                 Math.min(
    //                     Math.max(otherCollider.x, collider.x),
    //                     otherCollider.x + otherCollider.width
    //                 ) - collider.x;
    //             dy =
    //                 Math.min(
    //                     Math.max(otherCollider.y, collider.y),
    //                     otherCollider.y + otherCollider.height
    //                 ) - collider.y;

    //             // The required distance for an ellipse and a rectangle is the radius of the ellipse -
    //             // because the point chosen is already on the border of the rectangle.
    //             requiredDistance = collider.radius;
    //             break;
    //     }

    //     // Work out the actual distance between the collider and the chosen point
    //     const length = Math.sqrt(dx ** 2 + dy ** 2);
    //     // Work out the unit vector pointing from the point to the collider
    //     const unitDx = dx / length;
    //     const unitDy = dy / length;

    //     // Work out the offset that the PLAYER needs to move by:
    //     // Calculating the position resulting from moving in the correct direction by the required distance
    //     // Then subtracting the existing difference between the two
    //     const xOffest = unitDx * requiredDistance - dx;
    //     const yOffset = unitDy * requiredDistance - dy;

    //     return { x: xOffest, y: yOffset };
    // }

    // handleCollision(otherGameObject, otherCollider, collider) {
    //     if (otherGameObject instanceof MapObject) {
    //         const offset = this.getRequiredOffset(otherCollider, collider);

    //         // Offsets will be decimal values, so based on the direction of the offset (sign)
    //         // Floor or Ceil the value to convert it to an int. Use different function for each to
    //         // ensure that the operation does not result in putting the player back inside the collider
    //         this.x =
    //             Math.sign(offset.x) >= 0
    //                 ? Math.floor(this.x - offset.x)
    //                 : Math.ceil(this.x - offset.x);
    //         this.y =
    //             Math.sign(offset.y) >= 0
    //                 ? Math.floor(this.y - offset.y)
    //                 : Math.ceil(this.y - offset.y);
    //     }
    // }

    setState(newState: CharacterState) {
        if (this.state !== newState) {
            this.animationTime = 0;
        }
        this.state = newState;
    }

    run(direction: Direction, deltaT: number) {
        this.setState(CharacterState.RUN);
        this.direction = direction;
        this.x += getXComponent(direction) * RUN_SPEED * deltaT;
        this.y += getYComponent(direction) * RUN_SPEED * deltaT;
    }

    walk(direction: Direction, deltaT: number) {
        this.setState(CharacterState.WALK);
        this.direction = direction;
        this.x += getXComponent(direction) * WALK_SPEED * deltaT;
        this.y += getYComponent(direction) * WALK_SPEED * deltaT;
    }

    walkTo(position: Position, deltaT: number) {
        this.setState(CharacterState.WALK);
        const xDelta = position.x - this.x;
        const yDelta = position.y - this.y;
        const distance = Math.sqrt(xDelta * xDelta + yDelta * yDelta);
        this.direction = directionFromComponents(xDelta, yDelta);

        if (distance <= WALK_SPEED * deltaT) {
            this.x = position.x;
            this.y = position.y;
        } else {
            this.x += getXComponent(this.direction) * WALK_SPEED * deltaT;
            this.y += getYComponent(this.direction) * WALK_SPEED * deltaT;
        }
    }

    hurt() {
        this.setState(CharacterState.HURT);
    }

    attack() {
        this.setState(CharacterState.SWORD_SWING);
    }

    idle() {
        this.setState(CharacterState.IDLE);
    }

    update(deltaT: number) {
        const currentAnimation = ANIMATIONS[STATE_TO_ANIMATION[this.state]];
        this.animationTime += deltaT;

        if (
            this.animationTime >=
            SECONDS_PER_SPRITE * currentAnimation.totalFrames
        ) {
            this.animationTime = 0;

            if (
                this.state === CharacterState.SWORD_SWING ||
                this.state === CharacterState.HURT
            ) {
                this.setState(CharacterState.IDLE);
            }
        }
    }

    draw(context: CanvasRenderingContext2D) {
        const sprite = getImageResource("player");
        const currentAnimation = ANIMATIONS[STATE_TO_ANIMATION[this.state]];
        const currentFrame =
            currentAnimation.frames[
                Math.floor(this.animationTime / SECONDS_PER_SPRITE)
            ];

        const xOffset = DIRECTION_TO_OFFSET[this.direction] * SPRITE_WIDTH;
        let xDestination = this.x;

        if (this.direction == Direction.LEFT) {
            context.save();
            context.scale(-1, 1);
            xDestination *= -1;
        }

        context.drawImage(
            sprite,
            currentFrame.x + xOffset,
            currentFrame.y,
            SPRITE_WIDTH,
            SPRITE_HEIGHT,
            Math.floor(xDestination - SPRITE_WIDTH / 2),
            Math.floor(this.y - SPRITE_BASELINE),
            SPRITE_WIDTH,
            SPRITE_HEIGHT
        );

        if (this.direction == Direction.LEFT) {
            context.restore();
        }
    }
}
