var dataPath = "../assets/data/test_data.tsv";
var margin = {top: 20, right: 20, bottom: 20, left: 40},
    width = 960 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;
var NUM_DATE_PADDING = 1;
var DOT_RADIUS = 8;
var DOT_MARGIN = 3;

var applyOnField = function (func, data, fieldName) {
    return func(data, function (d) {
        return d[fieldName];
    });
};

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
    .append("g")
    .attr("transform",
    "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");

var categoryColorMap = {};
var getColor = function (category) {
    categoryColorMap[category] = categoryColorMap[category] || d3.hsl(Math.random() * 360, 1, 0.5);
    return categoryColorMap[category];
};

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
    var maxDelta = applyOnField(d3.max, data, 'delta');
    var rx = d3.scale.linear().domain([0, maxDelta]).range([0, 360]);
    var maxDate = applyOnField(d3.max, data, 'date');
    var minDate = applyOnField(d3.min, data, 'date');
    var ry = d3.scale.linear().domain([0.0, maxDate + NUM_DATE_PADDING]).range([50, 300]);

    var cr = ry.ticks(maxDate - minDate + 1 + NUM_DATE_PADDING);
    //var cr = ry.tickValues();

    svg.selectAll("circle.line").data(cr)
        .enter().append("circle").attr("class", "line")
        .attr({
            //cx: width / 2 + margin.left,
            //cy: height / 2 + margin.top,
            r: function (d) {
                return ry(d);
            },
            fill: "none",
            stroke: "#999"
        });

    var nodes = svg.selectAll(".node")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "node")
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
            })
            .attr("transform", function (d) {
                var angle = rx(d.delta);
                var radius = ry(d.date);
                return "rotate(" + (angle - 90) + ")translate(" + radius + ")";
                //return Math.cos(angle) * radius + width / 2 + margin.left;
                //    return Math.sin(angle) * radius + height / 2 + margin.top;
            })
        ;

    nodes
        .append("circle")
        .style("fill", function (d) {
            return getColor(d.category);
        })
        .attr("class", "dot")
        .attr("r", DOT_RADIUS);

    nodes
        .append("text")
        .attr("dy", ".31em")
        .attr("text-anchor", function (d) {
            var angle = rx(d.delta);
            return angle < 180 ? "start" : "end";
        })
        .attr("transform", function (d) {
            var angle = rx(d.delta);
            var shift = DOT_RADIUS + DOT_MARGIN
            return angle < 180 ? "translate(" + shift + ")" :
            "rotate(180)translate(-" + shift + ")";
        })
        .text(function (d) {
            return d.label;
        });
});
