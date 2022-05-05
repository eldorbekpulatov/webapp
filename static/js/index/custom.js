var width = Math.floor(window.innerWidth);
var height = Math.floor(window.innerHeight);
var margin = {top:20, left:20, bottom:20, right:20}
var svg = d3.select("svg").attr("width", width).attr("height", height);



var timeline = svg.append("g")
    .attr("width", width - margin.left - margin.right)
    .attr("height", height - margin.top - margin.bottom)
    .attr("transform", "translate("+margin.left+","+margin.top+")");

d3.csv("data/data.csv", function(data) {
    var SB_TYPE = {};


    var timeDomainStart = new Date();
    var timeDomainEnd = new Date();
    var parseDate = d3.timeParse("%d-%b-%y");

    data.forEach(function(item, index){
        if (item["SB Type"] in SB_TYPE){
            SB_TYPE[item["SB Type"]].push(item);
        }else{
            SB_TYPE[item["SB Type"]] = [item];
        }






        if (parseDate(item["First Proto Fabout"]) < timeDomainStart){
            timeDomainStart = parseDate(item["First Proto Fabout"]);
        }
        if (parseDate(item["FCS"]) > timeDomainEnd){
            timeDomainEnd = parseDate(item["FCS"]);
        }
    })
    console.log(SB_TYPE)


    var x_domain = [d3.timeMonth.floor(timeDomainStart),d3.timeMonth.ceil(timeDomainEnd)];
    var x_range = [0, timeline.attr("width")];
    var x_scale = d3.scaleTime().domain(x_domain).range(x_range);
    var x_axis = d3.axisBottom(x_scale).tickSize(timeline.attr("height")).tickPadding(2);
    var x_group = timeline.append("g").call(x_axis);

    var y_domain = [0,1,2,3,4,5,6,7,8,9,10];
    var y_range = [0, timeline.attr("height")]
    var y_scale = d3.scaleBand().domain(y_domain).range(y_range).paddingInner(0.1);
    var y_axis = d3.axisLeft(y_scale).ticks(10).tickSize(2).tickPadding(2);
    var y_group = timeline.append("g").call(y_axis)


    timeline.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("y", function(d,i) { return y_scale(i); })
        .attr("x", function(d,i) { return x_scale(parseDate(d["First Proto Fabout"])); })
        .attr("height", function(d,i) { return y_scale.bandwidth(); })
        .attr("width", function(d,i) { return x_scale(parseDate(d["FCS"]))-x_scale(parseDate(d["First Proto Fabout"]))});

    


    function zoomed() {
        var new_x_scale = d3.event.transform.rescaleX(x_scale);
        x_group.transition().duration(0).call(x_axis.scale(new_x_scale));

        svg.selectAll("rect")
            .attr("x", function(d) { 
                return new_x_scale(parseDate(d["First Proto Fabout"])); 
            })
            .attr("width", function(d) { 
                return new_x_scale(parseDate(d["FCS"])) - new_x_scale(parseDate(d["First Proto Fabout"])); 
            });
    }

    var zoom = d3.zoom()
            .extent([[x_range[0], y_range[0]],[x_range[1],y_range[1]]])
            .translateExtent([[x_range[0], y_range[0]],[x_range[1],y_range[1]]])
            .scaleExtent([1, 20])
            .on("zoom", zoomed);
    svg.call(zoom);
});



function zoomInit() {
    // Position to (2021, 2022) at start
    // to jump to (2022, 2023) we need to calculate a new scale factor (k)...
    var k = (x_scale(timeDomainEnd)-x_scale(timeDomainStart))/(x_scale(new Date(2022,0,1))-x_scale(new Date(2021,0,1)));

    // ...and then a translate to [500, 0]
    var tx = (k * new Date(2021,0,1));

    var t = d3.zoomIdentity.translate(tx, 0).scale(k);

    // Rescale the axis
    x_axis.scale(t.rescaleX(x_scale));
    x_axis.attr("transform", "translate(0,-20)").call(x_axis);

    // Rescale the circles
    rect.call(zoom.transform, t);
}