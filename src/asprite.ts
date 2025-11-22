import aspriteData from "./img/Master File.json";

export interface Frame {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface Animation {
    name: string;
    totalFrames: number;
    frames: Frame[];
}

export function getAnimations(): Record<string, Animation> {
    const animations: Animation[] = aspriteData.meta.frameTags.map((tag) => ({
        name: tag.name,
        totalFrames: tag.to - tag.from,
        frames: aspriteData.frames.slice(tag.from, tag.to).map((frame) => ({
            ...frame.frame,
        })),
    }));

    return animations.reduce(
        (total: Record<string, Animation>, current: Animation) => {
            total[current.name] = current;
            return total;
        },
        {}
    );
}
