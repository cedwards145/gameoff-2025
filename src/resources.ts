const images: Record<string, HTMLImageElement> = {};

async function loadFonts() {
    const fontsToLoad = {
        heading: new URL("fonts/Japers.otf", import.meta.url).href,
        body: new URL("fonts/Japers.otf", import.meta.url).href
    };

    await Promise.all(
        Object.entries(fontsToLoad).map(async ([family, url]) => {
            const face = new FontFace(family, `url(${url})`);
            await face.load();
            document.fonts.add(face);
        })
    );
}

export function load(onComplete: () => void) {
    const imagesToLoad = {
        tileset: new URL("img/tileset.png", import.meta.url).href,
        ui: new URL("img/ui.png", import.meta.url).href,
        player: new URL("img/Master File.png", import.meta.url).href,
        progress: new URL("img/progress bar.png", import.meta.url).href,
        apple: new URL("img/apple.png", import.meta.url).href,
    };


    const imagesLoaded = Object.entries(imagesToLoad).map(
        ([key, url]) =>
            new Promise<void>((resolve) => {
                const image = new Image();
                images[key] = image;
                image.onload = () => resolve();
                image.src = url;
            })
    );

    Promise.all([...imagesLoaded, loadFonts()]).then(onComplete);
}

export function getImageResource(key: string): HTMLImageElement {
    return images[key];
}
