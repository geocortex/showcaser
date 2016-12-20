function startShowcaser() {
    Showcaser.showcase('Welcome to the Showcaser demo<br><br> Take a look at <b><i><a href="https://github.com/latitudegeo/showcaser/blob/master/docs/scripts.js" target="_blank">docs/scripts.js</a></i></b> to explore this demo\'s source code');

    var demoUpdates = document.getElementById("demo-updates");
    Showcaser.showcase(
        "Showcaser is <b>flexible</b><br><br>You can customize the background color...",
        demoUpdates,
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
        "You can change the position of the text...",
        demoOptions,
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
        "Or even the shape!",
        pieChart,
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
        "Showcaser can even track elements as they move around the page!<br><br><b>Try resizing the browser window!</b>",
        graph,
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