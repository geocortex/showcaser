declare class Showcaser {
    static showcase(element: HTMLElement, text: string, options?: IShowcaseOptions): void;
    static close(): void;
    static skipAll(): void;
    static readonly queueLength: number;
}
export interface IShowcaseOptions {
    allowSkip?: boolean;
    before?: () => void;
    buttonText?: string;
    close?: () => void;
    longDelay?: boolean;
    paddingPx?: number;
    position?: {
        horizontal: "right" | "center" | "left";
        vertical: "top" | "middle" | "bottom";
    };
    positionTracker?: boolean;
    scrollBufferPx?: number;
    skipText?: string;
    skip?: () => void;
    shape?: "circle" | "rectangle";
}
export default Showcaser;
