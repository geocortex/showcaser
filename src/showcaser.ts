import "./showcaser.css";
// import Smoothscroll from "./smoothscroll";

class Showcaser {
    public static showcase(
        text: string,
        element?: HTMLElement,
        options?: IShowcaseOptions
    ): void {
        const args = this._sanitizeArgs(element, text, options);

        if (!args) {
            // Sanitizing failed. Can't continue on with this part of the showcase
            throw new Error("Can't start Showcaser due to invalid options");
        }

        if (this._isVisible || this._showcaseQueue.length) {
            this._showcaseQueue.push(args);
        } else {
            this._startShowcase(args);
        }
    }

    public static close(): void {
        this._cancelCheckPositionInterval();

        if (this._container) {
            document.body.removeChild(this._container);
        }

        this._releaseTrappedBodyScroll();

        if (this._args.options.close) {
            this._args.options.close();
        }

        this._args = null;
        this._container = null;
        this._showcaser = null;
        this._textContainer = null;
        this._isVisible = false;
        this._lastPosition = null;

        if (this._showcaseQueue.length) {
            const nextItem = this._showcaseQueue.shift();
            this._startShowcase(nextItem);
        }
    }

    public static skipAll(): void {
        // Clear out all remaining queued Showcaser items
        this._showcaseQueue = [];

        // Args gets cleared out in close() so we need to keep a reference to the skip callback function
        const skip = this._args.options.skip;

        this.close();

        if (skip) {
            skip();
        }
    }

    public static get queueLength() {
        return this._showcaseQueue.length;
    }

    private static _args: IShowcaseArgs;
    private static _container: HTMLElement;
    private static _showcaser: HTMLElement;
    private static _textContainer: HTMLElement;
    private static _showcaseQueue: IShowcaseArgs[] = [];
    private static _isVisible: boolean;
    private static _isScrolling: boolean;
    private static _lastPosition: ClientRect;
    private static _lastViewportWidth: number;
    private static _lastViewportHeight: number;
    private static _checkPositionIntervalToken: any;

    private static _start(args: IShowcaseArgs): void {
        this._args = args;
        this._isVisible = true;

        // Create all the DOM necessary to display the showcase
        const container = document.createElement("div");
        container.className = "showcaser-container";
        if (args.options.fadeBackground) {
            container.className += " showcaser-container-delay";
        }

        const showcaser = document.createElement("div");
        showcaser.className = "showcaser";
        if (!args.element) {
            showcaser.className += " showcaser-full-screen";
        }

        const shadowRGBA = this._getRgbaFromArgs(args.options.backgroundColor);
        showcaser.style.boxShadow = `0 0 0 99999px ${shadowRGBA}, inset 0 2px 16px rgba(0,0,0,.3)`;
        container.appendChild(showcaser);

        const textContainer = document.createElement("div");
        showcaser.appendChild(textContainer);

        const textElement = document.createElement("div");
        textElement.className = "showcaser-text";
        textElement.innerHTML = args.text;
        textContainer.appendChild(textElement);

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "showcaser-button-container";
        textContainer.appendChild(buttonContainer);

        const showcaserButton = document.createElement("button");
        showcaserButton.className =
            "showcaser-button waves-effect waves-light btn";
        showcaserButton.textContent = args.options.buttonText;
        showcaserButton.onclick = event => {
            this._nextButtonClick(event);
        };
        buttonContainer.appendChild(showcaserButton);

        if (args.options.allowSkip) {
            const skipButton = document.createElement("div");
            skipButton.className = "showcaser-skip";
            skipButton.onclick = event => {
                this._skipClick(event);
            };
            skipButton.textContent = args.options.skipText || "Skip";
            buttonContainer.appendChild(skipButton);
        }

        // Adding a border-radius breaks the box-shadow background on Safari for handheld/tablet and Mac
        if (!this._isSafari()) {
            // TODO: Use CSS class instead of inline style
            const radiusString =
                args.options.shape === "circle" ? "50%" : "5px";
            showcaser.style.borderRadius = radiusString;
        }

        document.body.appendChild(container);

        this._container = container;
        this._showcaser = showcaser;
        this._textContainer = textContainer;

        this._trapBodyScroll();
        this._scrollAndEnable();
    }

    private static _getRgbaFromArgs(bgColor: IShowcaseBgColor) {
        let r = bgColor.r;
        let g = bgColor.g;
        let b = bgColor.b;
        let a = bgColor.a;

        if (bgColor.hex) {
            [r, g, b] = bgColor.hex
                .replace(
                    /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
                    (m, r, g, b) => "#" + r + r + g + g + b + b
                )
                .substring(1)
                .match(/.{2}/g)
                .map(x => parseInt(x, 16));
        }

        return `rgba(${r},${g},${b},${a})`;
    }

    private static _isSafari(): boolean {
        return (
            navigator.vendor &&
            navigator.vendor.indexOf("Apple") > -1 &&
            navigator.userAgent &&
            !navigator.userAgent.match("CriOS")
        );
    }

    private static _setupCheckPositionInterval(): void {
        if (
            this._args.options.positionTracker &&
            this._args.element &&
            !this._checkPositionIntervalToken
        ) {
            this._checkPositionIntervalToken = setInterval(() => {
                if (this._isScrolling) {
                    return;
                }

                const { element } = this._args;

                if (!element || !this._isElementVisible(element)) {
                    this.close();
                    return;
                }

                const newPosition = this._getElementViewportPosition(element);
                const lastPosition = this._lastPosition;

                const newViewportWidth = document.body.clientWidth;
                const newViewportHeight = document.body.clientHeight;

                // Check if size or position of element has changed since we last re-rendered
                if (
                    newPosition.top !== lastPosition.top ||
                    newPosition.right !== lastPosition.right ||
                    newPosition.bottom !== lastPosition.bottom ||
                    newPosition.left !== lastPosition.left ||
                    newViewportWidth !== this._lastViewportWidth ||
                    newViewportHeight !== this._lastViewportHeight
                ) {
                    this._scrollAndEnable();
                }
            }, 200);
        }
    }

    private static _cancelCheckPositionInterval(): void {
        if (this._checkPositionIntervalToken) {
            clearInterval(this._checkPositionIntervalToken);
            this._checkPositionIntervalToken = null;
        }
    }

    private static _isElementVisible(elem: HTMLElement) {
        return !!(
            elem.offsetWidth ||
            elem.offsetHeight ||
            elem.getClientRects().length
        );
    }

    private static _getElementViewportPosition(elem: HTMLElement) {
        return elem.getBoundingClientRect();
    }

    private static _getElementDocumentPosition(element: HTMLElement) {
        const rect = element.getBoundingClientRect();
        const scrollLeft =
            window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
    }

    private static _scrollAndEnable(): void {
        if (this._args.element) {
            const element = this._args.element;

            // Position relative to the viewport
            const rect = this._getElementViewportPosition(element);

            // Make sure element is visible
            if (!this._isElementVisible(element)) {
                console.warn(
                    "Showcaser: Element not visible",
                    this._args.element
                );
                this.close();
                return;
            }

            const windowScrollPosition = window.pageYOffset;
            const bufferPx = this._args.options.scrollBufferPx || 15;

            const isElAboveViewport = rect.top - bufferPx < 0;
            const isElBelowViewport =
                rect.top + bufferPx + rect.height >
                (window.innerHeight || document.documentElement.clientHeight);

            // Check if we need to scroll page to be able to see the element. Scroll if necessary
            // We check the page's scroll position as we use a 'scrollBuffer' to give additional space
            // between the element and the viewport. If the page can't be scrolled,
            // there's no reason to wait 500ms.
            if (isElAboveViewport && isElBelowViewport) {
                // Overflows above and below viewport ¯\_(ツ)_/¯
                this._positionAndShow();
            } else if (isElAboveViewport) {
                // this._isScrolling = true;

                const elPosition = this._getElementDocumentPosition(element);

                const scrollTo = Math.max(elPosition.top - bufferPx, 0);
                // Smoothscroll(scrollAmount, 500, () => {
                //     this._isScrolling = false;
                //     this._positionAndShow();
                // });
                window.scrollTo(0, scrollTo);
                this._positionAndShow();
            } else if (isElBelowViewport) {
                // this._isScrolling = true;

                const elPosition = this._getElementDocumentPosition(element);

                const scrollTo = Math.max(elPosition.top - bufferPx, 0);
                // Smoothscroll(scrollAmount, 500, () => {
                //     this._isScrolling = false;
                //     this._positionAndShow();
                // });
                window.scrollTo(0, scrollTo);
                this._positionAndShow();
            } else {
                // Fully visible
                this._positionAndShow();
            }
        } else {
            this._positionAndShow();
        }
    }

    private static _positionAndShow(): void {
        // If the user closes the showcase before scroll happens (delayed by a timeout)
        // then args are gonna be null as the showcase has already been closed
        if (!this._args) {
            return;
        }

        const options = this._args.options;
        const element = this._args.element;

        if (element) {
            const rect = (this._lastPosition = this._getElementViewportPosition(
                element
            ));
            this._lastViewportWidth = document.body.clientWidth;
            this._lastViewportHeight = document.body.clientHeight;

            // Element has no dimensions
            if (!this._isElementVisible(element)) {
                console.warn(
                    "Showcaser: Element not visible",
                    this._args.element
                );
                this.close();
                return;
            }

            const padding =
                typeof options.paddingPx !== "undefined"
                    ? options.paddingPx
                    : 20;

            if (options.shape === "circle") {
                const dimension =
                    Math.round(
                        rect.width > rect.height ? rect.width : rect.height
                    ) + padding;
                this._showcaser.style.width = dimension + "px";
                this._showcaser.style.height = dimension + "px";

                const diff =
                    rect.width > rect.height
                        ? rect.width - rect.height
                        : rect.height - rect.width;

                // Height has changed, subtract the diff from top
                if (rect.width > rect.height) {
                    this._showcaser.style.top =
                        Math.round(rect.top - diff / 2 - padding / 2) + "px";
                    this._showcaser.style.left =
                        Math.round(rect.left - padding / 2) + "px";
                } else {
                    // Width has changed, subtract the diff from left
                    this._showcaser.style.top =
                        Math.round(rect.top - padding / 2) + "px";
                    this._showcaser.style.left =
                        Math.round(rect.left - diff / 2 - padding / 2) + "px";
                }
            } else if (options.shape === "rectangle") {
                this._showcaser.style.width =
                    Math.round(rect.width + padding) + "px";
                this._showcaser.style.height =
                    Math.round(rect.height + padding) + "px";
                this._showcaser.style.top =
                    Math.round(rect.top - padding / 2) + "px";
                this._showcaser.style.left =
                    Math.round(rect.left - padding / 2) + "px";
            }
        }

        // User-defined text position
        if (options.position) {
            const horizontal = options.position.horizontal || "right";
            const vertical = options.position.vertical || "middle";

            this._applyPositionStyling(vertical, horizontal);
        } else {
            // Automatic text positioning. Check that it doesn't bleed outside the viewport
            // Apply default positioning, before checking for bleed
            let vertical = "top";
            let horizontal = "center";

            this._applyPositionStyling(vertical, horizontal);

            const textElRect = this._getElementViewportPosition(
                this._textContainer
            );

            // Vertical check: bleeds out from the top
            if (textElRect.top < 0) {
                vertical = "bottom";
            }

            // Horizontal check: bleeds out from the right
            if (
                textElRect.left + textElRect.width >
                document.body.clientWidth
            ) {
                horizontal = "left";
            } else if (textElRect.left < 0) {
                // Horizontal check: bleeds out from the left
                horizontal = "right";
            }

            this._applyPositionStyling(vertical, horizontal);
        }

        this._container.style.opacity = "1";

        this._setupCheckPositionInterval();
    }

    private static _applyPositionStyling(
        vertical: string,
        horizontal: string
    ): void {
        this._textContainer.className = `showcaser-text-container ${vertical} ${horizontal}`;
    }

    private static _trapBodyScroll(): void {
        document.body.className += " showcaser-trap-scroll";
    }

    private static _releaseTrappedBodyScroll(): void {
        document.body.className = document.body.className.replace(
            /(?:^|\s)showcaser-trap-scroll(?!\S)/g,
            ""
        );
    }

    private static _startShowcase(args: IShowcaseArgs): void {
        if (args.options.before) {
            args.options.before();
        }

        // Remove focus on active element.
        (document.activeElement as HTMLElement).blur();

        this._start(args);
    }

    private static _nextButtonClick(event: MouseEvent): boolean {
        this.close();

        event.stopPropagation();
        return false;
    }

    private static _skipClick(event: MouseEvent): boolean {
        this.skipAll();

        event.stopPropagation();
        return false;
    }

    private static _sanitizeArgs(
        element: HTMLElement,
        text: string,
        options: IShowcaseOptions
    ): IShowcaseArgs {
        if (!text) {
            throw new Error("Must specify text to showcase");
        }

        if (!options) {
            options = {};
        }

        if (!options.backgroundColor) {
            options.backgroundColor = {
                r: 0,
                g: 0,
                b: 0,
            };
        }

        if (!options.backgroundColor.a) {
            options.backgroundColor.a = 0.7;
        }

        if (typeof options.fadeBackground !== "boolean") {
            options.fadeBackground = true;
        }

        if (!options.shape) {
            options.shape = "circle";
        }

        if (!options.buttonText) {
            options.buttonText = "Got it";
        }

        if (typeof options.allowSkip !== "boolean") {
            options.allowSkip = true;
        }

        return {
            element,
            text,
            options,
        };
    }
}

interface IShowcaseArgs {
    element: HTMLElement;
    text: string;
    options?: IShowcaseOptions;
}

export interface IShowcaseOptions {
    allowSkip?: boolean;
    backgroundColor?: IShowcaseBgColor;
    before?: () => void;
    buttonText?: string;
    close?: () => void;
    fadeBackground?: boolean;
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

export interface IShowcaseBgColor {
    r?: number;
    g?: number;
    b?: number;
    a?: number;
    hex?: string;
}

export default Showcaser;
