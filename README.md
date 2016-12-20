# Showcaser

[![Dependency Status](https://david-dm.org/latitudegeo/showcaser.svg)](https://david-dm.org/latitudegeo/showcaser)

A Material Design inspired showcase view that highlights any element on your page.

[Check out the demo](https://latitudegeo.github.io/showcaser/)

![Showcaser](https://cloud.githubusercontent.com/assets/6355370/21340975/c8db80fc-c63e-11e6-9038-382dacddceba.PNG)

## Installation

If you're using a module bundler such as [Webpack](https://webpack.github.io/) or [Browserify](http://browserify.org/), you can use npm to install Showcaser:
```bash
npm install --save showcaser
```
and then you can simply `import`/`require` Showcaser:
```javascript
import Showcaser from 'showcaser'
```

If you would like to load Showcaser using a `script` tag, grab the latest version from the [dist](dist) folder and include it in your page:
```html
<body>
...
<script src="showcaser.min.js"></script>
</body>
```

## Usage

Check out the [demo source code](docs/scripts.js) for more examples:
```javascript
const myElement = document.getElementById("cool-element");

Showcaser.showcase(myElement, "Here's Showcaser!");
```

## API

### Methods

This document uses Typescript-like definitions to describe interaces. You can take a look at our Typescript definition file at [dist/showcaser.d.ts](dist/showcaser.d.ts).

#### Start showcase
Showcaser allows you to link multiple showcase steps together using a 'queue' concept. If there is currently a showcase being displayed, subsequent calls to `Showcaser.showcase()` will add the new showcase step to an internal queue. Closing a showcase step using the 'next' button will cause the next showcase step to be popped off the queue and displayed to the user, until there are no more items left in the queue.

If you don't include the `element` parameter, Showcaser will display a full-screen showcase instead.
```js
Showcaser.showcase(text: string, element?: HTMLElement, options?: ShowcaseOptions): void
```

#### Close showcase step
This will close the current step. If there is another step in the queue, it will be started.
```js
Showcaser.close(): void
```

#### Skip all showcase steps
This will close the current step, and remove any queued showcases.
```js
Showcaser.skipAll(): void
```

#### Get current showcase queue length
```js
Showcaser.queueLength: number;
```

### Options

#### ShowcaseOptions
| Field             | Type       | Default     | Description                                |
| ----------------- | ---------- | ----------- | ------------------------------------------ |
| `allowSkip`       | `boolean`  | `true`      | Present the user with an option to skip all remaining showcase steps
| `backgroundColor` | `object`   | [See below](#backgroundcolor) | Configure the background color |
| `before`          | `function` | `undefined` | Callback function that will be invoked just before this showcase step becomes visible |
| `buttonText`      | `string`   | `GOT IT`    | Configure the next button text             |
| `close`           | `function` | `undefined` | Callback function that will be invoked after the user closes this showcase step |
| `fadeBackground`  | `boolean`  | `true`      | Control the fade effect when the showcase appears |
| `paddingPx`       | `number`   | `15`        | Amount of padding around the element to showcase |
| `position`        | `object`   | `undefined` | Set the position of the text next to the element. [See below](#position) |
| `positionTracker` | `boolean`  | `false`     | Track the element as it moves around the page, and re-draw the showcase |
| `scrollBufferPx`  | `number`   | `15`        | Set the amount of additional space to give the element when Showcaser scrolls to make the element visible on the page (helpful for clearing fixed positioned elements such as a header bar) |
| `skipText`        | `string`   | `Skip`      | Configure the skip button text             |
| `skip`            | `function` | `undefined` | Callback function that will be invoked after the user clicks the skip button |
| `shape`           | `string`   | `circle`    | Either `circle` or `rectangle`             |

#### BackgroundColor
You can configure the background color of your showcase by using the `backgroundColor` option on the [ShowcaseOptions](#showcaseoptions). The background color consists of 4 parameters making up a `rgba` color. The alpha channel (`a`) is optional and defaults to `0.7`

BackgroundColor (defaults to dark gray):
```js
{
    r: number;
    g: number;
    b: number;
    a?: number;
}
```

Example:
```js
Showcaser.showcase(element, "I'm green!", {
    backgroundColor: {
        r: 0,
        g: 132,
        b: 10
    }
});
```

#### Position
By default, Showcaser will automatically position the text where there is room in the viewport. If you wish to manually control the positioning, you can use the `position` option on the [ShowcaseOptions](#showcaseoptions).

Position:
```js
{
    horizontal: "right" | "center" | "left";
    vertical: "top" | "middle" | "bottom";
}
```

Example
```js
Showcaser.showcase(element, "I'm on the left!", {
    position: {
        horizontal: "left",
        vertical: "middle"
    }
});
```