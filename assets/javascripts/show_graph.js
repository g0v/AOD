var dataPath = "../assets/data/test_data.tsv";
var margin = {top: 20, right: 20, bottom: 20, left: 40},
    width = 960 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv(dataPath, function (error, data) {
    data.forEach(function (d) {
        d.date = +d.date;
        d.weight = +d.weight;
        d.delta = Math.random();
    });

    x.domain(d3.extent(data, function (d) {
        return d.date;
    })).nice();
    y.domain(d3.extent(data, function (d) {
        return d.weight;
    })).nice();
    var rx = d3.scale.linear().domain([1.0, 5.0]).range([0, 2 * Math.PI]);
    var ry = d3.scale.linear().domain([1.0, 8.0]).range([50, 300]);

    cr = ry.ticks(7);

    svg.selectAll("circle.line").data(cr)
        .enter().append("circle").attr("class", "line")
        .attr({
            cx: width / 2 + margin.left,
            cy: height / 2 + margin.top,
            r: function (d) {
                return ry(d);
            },
            fill: "none",
            stroke: "#999"
        });

    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 8)
        .attr("cx", function (d) {
            angle = rx((d.weight + d.delta));
            radius = ry((d.date));
            return Math.cos(angle) * radius + width / 2 + margin.left;
        })
        .attr("cy", function (d) {
            angle = rx((d.weight + d.delta));
            radius = ry((d.date));
            return Math.sin(angle) * radius + height / 2 + margin.top;
        })
        .style("fill", function (d) {
            return 'white';
        })
        .on('mouseover', function (d) {
            var xPosition = parseFloat(d3.select(this).attr("cx") + margin.left);
            var yPosition = parseFloat(d3.select(this).attr("cy") + margin.top);

            //Update the tooltip position and value
            d3.select("#tooltip")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px")
                .select("#label")
                .text(d.label);

            //Show the tooltip
            d3.select("#tooltip").classed("hidden", false);
        })
        .on('mouseout', function (d) {
            d3.select("#tooltip").classed("hidden", true);
        });
});
