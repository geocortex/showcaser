function startShowcaser() {
    Showcaser.showcase(null, "Welcome to the Showcaser demo<br><br> Take a look at <b><i>docs/scripts.js</i></b> to explore this demo's source code");

    var demoUpdates = document.getElementById("demo-updates");
    Showcaser.showcase(
        demoUpdates,
        "Showcaser is <b>flexible</b><br><br>You can customize the background color...",
        {
            backgroundColor: {
                r: 0,
                g: 132,
                b: 10,
                a: 0.75
            },
            shape: "rectangle"
        });

    var demoOptions = document.getElementById("read-more");
    Showcaser.showcase(
        demoOptions,
        "You can change the position of the text...",
        {
            backgroundColor: {
                r: 14,
                g: 79,
                b: 117
            },
            position: {
                horizontal: "left",
                vertical: "middle"
            },
            shape: "rectangle"
        });

    var pieChart = document.getElementById("pie-chart");
    Showcaser.showcase(
        pieChart,
        "Or even the shape!",
        {
            backgroundColor: {
                r: 132,
                g: 15,
                b: 3,
                a: 0.7
            },
            position: {
                horizontal: "center",
                vertical: "bottom"
            },
            shape: "circle"
        });

    var graph = document.getElementById("graph");
    Showcaser.showcase(
        graph,
        "Showcaser can even track elements as they move around the page!<br><br><b>Try resizing the browser window!</b>",
        {
            backgroundColor: {
                r: 0,
                g: 5,
                b: 171,
                a: 0.7
            },
            positionTracker: true,
            shape: "rectangle"
        }
    );
}