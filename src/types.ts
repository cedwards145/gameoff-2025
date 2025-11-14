export interface Item {
    name: string;
}

export interface Recipe {
    name: string;
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
    ESCAPE = 27,
}
