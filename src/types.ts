export interface Item {
    name: string;
    price: number;
}

export interface Recipe {
    name: string;
    price: number;
    ingredients: string[];
}

export interface Position {
    x: number;
    y: number;
}

export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export enum KeyCode {
    W = 87,
    S = 83,
    A = 65,
    D = 68,
    E = 69,
    R = 82,
    ESCAPE = 27,
    SHIFT = 16,
}
