var side = 25;
var padding = 0.05;
var width = Math.floor(window.innerWidth);
var height = Math.floor(window.innerHeight)-115;
var margin = {top: 80, right: 25, bottom: 30, left: 40};


function heatEquation(Nx, Ny, sources){
    // Parameters
    let con = 0.4;  // conductivity (0<con<1)
    let Nt = 140;   // total iterations
    let Ns = 40;    // source iterations
    let rTemp = 65  // room temperature
    
    // create the matrix
    let Tn = [...Array(Ny)].map(e => Array(Nx).fill(rTemp));

    // main loop
    for( let n = 0; n<Nt; n++){
        let Tc = [...Tn]; // new temp

        // smoothing loop
        for (let j = 1; j<Ny-1; j++){
            for (let i = 1; i<Nx-1; i++){
                let Txy = Tc[j][i+1] + Tc[j][i-1] + Tc[j+1][i] + Tc[j-1][i] - 4*Tc[j][i];
                Tn[j][i] = Tc[j][i] + (con/4)*Txy;
            }
        }

        // source loop
        if (n < Ns){
            sources.forEach(s => {
                Tn[s.y][s.x] = s.t;
            });        
        }     
    
    }
    // Return the Heat Gradient
    return Tn;
}

var svg = d3.select("svg")
            .attr("width", width)
            .attr("height", height)
            .style("background", "black");


// Build X scales and axis:
var x = d3.scale.ordinal()
                .domain([...Array(Math.floor(width/side)).keys()])
                .rangeRoundBands([ 0, width ], padding);

// Build Y scales and axis:
var y = d3.scale.ordinal()
                .domain([...Array(Math.floor(height/side)).keys()])
                .rangeRoundBands([ height, 0 ], padding)


var sources = [{"x": 10, "y":10, "t":110}, {"x": 25, "y":28, "t":100}]
var data = heatEquation(Math.floor(width/side), Math.floor(height/side), sources)


var max = d3.max(data, function (d) { return d3.max(d);});
var color = d3.scale.linear().domain([65, max]).range(['yellow', 'red']);


// Three function that change the tooltip when user hover / move / leave a cell
var mousemove = function(d) {
    tooltip
        .html("The exact value of<br>this cell is: " + d.toFixed(2))
        .style("left", (d3.mouse(this)[0]) + "px")
        .style("top", (d3.mouse(this)[1]) + "px")
}
var mouseover = function(d) {
    tooltip
        .style("opacity", 1)
    d3.select(this)
        .style("stroke", "black");
}
var mouseleave = function(d) {
    tooltip
        .style("opacity", 0)
    d3.select(this)
        .style("stroke", "none");
}

// create a tooltip
var tooltip = d3.select("body")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "0px")


// add the squares
svg.append("g")
    .selectAll("rect")
    .data(data)
    .enter()
    .append("g")
    .selectAll("rect")
    .data(function(d,i){return d;})
    .enter()
    .append("rect")
    .attr("x", function(d, i) { return x(i) }) 
    .attr("y", function(d, i, j) { return y(j) })
    .style("fill", function(d) { return color(d) })
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("width", x.rangeBand() )
    .attr("height", y.rangeBand() )
    .style("stroke-width", 4)
    .style("stroke", "none")
    .style("opacity", 1)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);