const images: Record<string, HTMLImageElement> = {};

export function load(onComplete: () => void) {
    const imagesToLoad = {
        tileset: new URL("img/tileset.png", import.meta.url).href,
        ui: new URL("img/ui.png", import.meta.url).href,
        player: new URL("img/Master File.png", import.meta.url).href,
    };

    let imagesLoaded = 0;

    function loadComplete() {
        imagesLoaded++;
        if (imagesLoaded === Object.keys(imagesToLoad).length) {
            onComplete();
        }
    }

    Object.entries(imagesToLoad).forEach(([key, url]) => {
        const image = new Image();
        images[key] = image;
        image.onload = loadComplete;
        image.src = url;
    });
}

export function getImageResource(key: string): HTMLImageElement {
    return images[key];
}
