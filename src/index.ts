class Showcaser {
    private static _args: ShowcaseArgs;
    private static _container: HTMLElement;
    private static _showcaser: HTMLElement;
    private static _textContainer: HTMLElement;
    private static _showcaseQueue: ShowcaseArgs[] = [];
    private static _isVisible: boolean;
    private static _lastPosition: ClientRect;
    private static _checkIntervalToken: any;

    private static _start(args: ShowcaseArgs): void {
        this._args = args;
        this._isVisible = true;

        // Create all the DOM necessary to display the showcase
        let container = document.createElement("div");
        container.className = "tm-showcaser-container";

        let showcaser = document.createElement("div");
        showcaser.className = "tm-showcaser";
        if (!args.element) {
            showcaser.className += " full-screen";
        }
        container.appendChild(showcaser);

        let textContainer = document.createElement("div");
        showcaser.appendChild(textContainer);

        let textElement = document.createElement("div");
        textElement.className = "tm-showcaser-text";
        textElement.textContent = args.text;
        textContainer.appendChild(textElement);

        let buttonContainer = document.createElement("div");
        buttonContainer.className = "tm-showcaser-button-container";
        textContainer.appendChild(buttonContainer);

        let showcaserButton = document.createElement("button");
        showcaserButton.className = "tm-showcaser-button waves-effect waves-light btn";
        showcaserButton.textContent = args.options.buttonText;
        showcaserButton.onclick = event => { this._nextButtonClick(event); };
        buttonContainer.appendChild(showcaserButton);

        if (args.options.allowSkip) {
            let skipButton = document.createElement("div");
            skipButton.className = "tm-showcaser-skip";
            skipButton.onclick = event => { this._skipClick(event); };
            skipButton.textContent = args.options.skipText || "Skip";
            buttonContainer.appendChild(skipButton);
        }

        // Adding a border-radius breaks the box-shadow background on Safari for handheld/tablet and Mac
        if (!this._isSafari()) {
            // TODO: Use CSS class instead of inline style
            let radiusString = (args.options.shape === "circle" ? "50%" : "5px");
            showcaser.style.borderRadius = radiusString;
        }

        document.body.appendChild(container);

        this._container = container;
        this._showcaser = showcaser;
        this._textContainer = textContainer;

        this._trapBodyScroll();
        this._scrollAndEnable();
    }

    private static _isSafari(): boolean {
        return navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
            navigator.userAgent && !navigator.userAgent.match('CriOS');
    }

    private static _setupCheckInterval(): void {
        if (this._args.options.positionTracker && this._args.element && !this._checkIntervalToken) {
            this._checkIntervalToken = setInterval(() => {
                // TODO: This doesn't support resizing the window vertically if the element's top/bottom haven't changed.
                // We should be smarter and check if it's still visible in the viewport

                let newPosition = this._args.element.getBoundingClientRect();
                let lastPosition = this._lastPosition;

                if (newPosition.top !== lastPosition.top ||
                    newPosition.right !== lastPosition.right ||
                    newPosition.bottom !== lastPosition.bottom ||
                    newPosition.left !== lastPosition.left) {
                    this._scrollAndEnable();
                }
            }, 200);
        }
    }

    private static _cancelCheckInterval(): void {
        if (this._checkIntervalToken) {
            clearInterval(this._checkIntervalToken);
            this._checkIntervalToken = null;
        }
    }

    private static _scrollAndEnable(): void {

        if (this._args.element) {
            let element = $(this._args.element);

            let offsetTop = element.offset().top;

            // Make sure element is visible
            if (!element.is(":visible")) {
                element.css({ "visibility": "hidden" }).show();
                offsetTop = element.offset().top;
                element.css({ "visibility": "", "display": "" });
            }

            let bufferPx = this._args.options.scrollBufferPx || 15;

            // Check if we need to scroll page to be able to see the element. Scroll if necessary
            if (offsetTop - bufferPx < $(window).scrollTop()) {
                // Above viewport, scroll up
                $('html,body').animate({ scrollTop: offsetTop - bufferPx }, 500, () => { this._positionAndShow(); });
            }
            else if (offsetTop + bufferPx + element.height() > $(window).scrollTop() + (window.innerHeight || document.documentElement.clientHeight)) {
                // Below viewport, scroll down
                $('html,body').animate({ scrollTop: offsetTop - (window.innerHeight || document.documentElement.clientHeight) + element.height() + bufferPx }, 500, () => { this._positionAndShow(); });
            }
            else {
                // Fully visible
                this._positionAndShow();
            }
        }
        else {
            this._positionAndShow();
        }
    }

    private static _positionAndShow(): void {

        // If the user closes the showcase before scroll happens (delayed by a timeout)
        // then args are gonna be null
        if (!this._args) {
            return;
        }

        let options = this._args.options;

        if (this._args.element) {

            let rect = this._lastPosition = this._args.element.getBoundingClientRect();

            if (rect.width === 0 && rect.height === 0) {
                this.close();
                return;
            }

            let offset = $(this._args.element).offset();
            let padding = typeof options.paddingPx !== "undefined" ? options.paddingPx : 20;

            if (options.shape === "circle") {
                var dimension = Math.round(rect.width > rect.height ? rect.width : rect.height) + padding;
                this._showcaser.style.width = dimension + "px";
                this._showcaser.style.height = dimension + "px";

                let diff = rect.width > rect.height ? rect.width - rect.height : rect.height - rect.width;

                // Height has changed, subtract the diff from top
                if (rect.width > rect.height) {
                    this._showcaser.style.top = Math.round(offset.top - diff / 2 - padding / 2) + "px";
                    this._showcaser.style.left = Math.round(offset.left - padding / 2) + "px";
                }
                // Width has changed, subtract the diff from left
                else {
                    this._showcaser.style.top = Math.round(offset.top - padding / 2) + "px";
                    this._showcaser.style.left = Math.round(offset.left - diff / 2 - padding / 2) + "px";
                }
            }

            else if (options.shape === "rectangle") {
                this._showcaser.style.width = Math.round(rect.width + padding) + "px";
                this._showcaser.style.height = Math.round(rect.height + padding) + "px";
                this._showcaser.style.top = Math.round(offset.top - padding / 2) + "px";
                this._showcaser.style.left = Math.round(offset.left - padding / 2) + "px";
            }
        }

        // User-defined position
        if (options.position) {
            // Default is:
            // horizontal: "right"
            // vertical: "center"
            let position = options.position;

            let horizontal;

            if (position.horizontal === "left") {
                horizontal = "left";
            }
            else if (position.horizontal === "center") {
                horizontal = "center";
            }
            else {
                horizontal = "right";
            }

            let vertical;

            if (position.vertical === "top") {
                vertical = "top";
            }
            else if (position.vertical === "bottom") {
                vertical = "bottom";
            }
            else {
                vertical = "middle";
            }

            this._applyPositionStyling(vertical, horizontal);
        }
        // Automatic positioning. Check that it doesn't bleed outside the viewport
        else {
            // Apply default positioning, before checking for bleed
            let vertical = "top";
            let horizontal = "center";

            this._applyPositionStyling(vertical, horizontal);

            let textElRect = this._textContainer.getBoundingClientRect();

            //Vertical check: bleeds out from the top
            if (textElRect.top < 0) {
                vertical = "bottom";
            }

            //Horizontal check: bleeds out from the right
            if (textElRect.left + textElRect.width > document.body.clientWidth) {
                horizontal = "left";
            }
            //Horizontal check: bleeds out from the left
            else if (textElRect.left < 0) {
                horizontal = "right";
            }

            this._applyPositionStyling(vertical, horizontal);
        }

        this._container.style.opacity = "1";

        this._setupCheckInterval();
    }

    private static _applyPositionStyling(vertical: string, horizontal: string): void {
        let baseClassName = "tm-showcaser-text-container";

        this._textContainer.className = "{0} {1} {2}".format(baseClassName, vertical, horizontal);
    }

    private static _trapBodyScroll(): void {
        document.body.className += " tm-showcaser-trap-scroll";
    }

    private static _releaseTrappedBodyScroll(): void {
        document.body.className = document.body.className.replace(/(?:^|\s)tm-showcaser-trap-scroll(?!\S)/g, '');
    }

    private static _startShowcase(args: ShowcaseArgs): void {
        if (args.options.before) {
            args.options.before();
        }

        this._start(args);
    }

    public static showcase(element: HTMLElement, text: string, options?: ShowcaseOptions): void {
        let args = this._sanitizeArgs(element, text, options);

        if (!args) {
            // Sanitizing failed. Can't continue on with this part of the showcase
            this._error("Can't start Showcaser due to invalid options");
            this.close();
        }

        if (this._isVisible || this._showcaseQueue.length) {
            this._showcaseQueue.push(args);
        }
        else {
            this._startShowcase(args);
        }
    }

    public static close(): void {
        this._cancelCheckInterval();

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
            let nextItem = this._showcaseQueue.shift();
            this._startShowcase(nextItem);
        }
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

    public static skipAll(): void {
        // Clear out all remaining queued Showcases
        this._showcaseQueue = [];

        // Args gets cleared out in close() so we need to keep a reference to the skip callback function
        let skip = this._args.options.skip;

        this.close();

        if (skip) {
            skip();
        }
    }

    private static _sanitizeArgs(element: HTMLElement, text: string, options: ShowcaseOptions): ShowcaseArgs {
        if (!text) {
            this._error("Must specify text to showcase");
            return;
        }

        if (!options) {
            options = {};
        }

        if (!options.shape) {
            options.shape = "circle";
        }

        if (!options.buttonText) {
            options.buttonText = "Got it";
        }

        // == null is same as null or undefined
        if (options.allowSkip == null) {
            options.allowSkip = true;
        }

        return {
            element,
            text,
            options
        };
    }

    private static _error(msg: string): void {
        console.error("Showcaser: " + msg);
    }
}

interface ShowcaseArgs {
    element: HTMLElement;
    text: string;
    options?: ShowcaseOptions;
}

export interface ShowcaseOptions {
    allowSkip?: boolean;
    before?: () => void;
    buttonText?: string;
    close?: () => void;
    paddingPx?: number;
    position?: {
        /** "right" | "center" | "left" */
        horizontal: string;
        /** "top" | "middle" | "bottom" */
        vertical: string;
    };
    positionTracker?: boolean;
    scrollBufferPx?: number;
    skipText?: string;
    skip?: () => void;
    /** "circle" | "rectangle" */
    shape?: string;
}

