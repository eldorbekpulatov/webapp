var width = Math.floor(window.innerWidth*1.0);
var height = Math.floor(window.innerHeight*1.0)-90;
var svg = d3.select("svg").attr("width", width).attr("height", height).style("background", "black");


// the minimum distance to be triggered when dragged
var radius = 100;

// - means clockwise
// + means counterclockwise
var orien = 0; 
var pts = [];
var edges = [];
var diags = [];


function set_radius(value){
	radius = value;
	document.getElementById("slider_value").innerHTML = radius;
	
}


function reset(){
	orien = 0;
	pts.splice(0,pts.length);
	edges.splice(0,edges.length);
	diags.splice(0,diags.length);
	update_canvas();
}

function sameSign(num1, num2)
{
    return num1 >= 0 && num2 >= 0 || num1 < 0 && num2 < 0
}


// Given three colinear points p, q, r, the function checks
// if point q lies on line segment 'pr' 
function onSegment(p, q, r) 
{ 
	if ( q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && 
		 q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y) )
	{
		if ( (q.x == p.x && q.y == p.y) | (q.x == r.x && q.y == r.y) )
		{
			return false;
		}
		else
		{
			return true; 
		}		
	}
	else
	{
		return false; 
	}
} 


// To find orientation of ordered triplet (p, q, r). 
// The function returns following values 
// 0 --> p, q and r are colinear 
// -1 --> Clockwise 
// +1 --> Counterclockwise 
function orientation(p, q, r) 
{ 
	// See https://www.geeksforgeeks.org/orientation-3-ordered-points/ 
	// for details of below formula. 
	let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y); 

	if (val == 0) return 0; // colinear 

	return (val > 0)? -1: 1; // clock or counterclock wise 
} 


// The main function that returns true if line segment 'p1q1' and 'p2q2' intersect. 
function doIntersect(p1, q1, p2, q2) 
{ 
	// Find the four orientations needed for general and special cases 
	let o1 = orientation(p1, q1, p2); 
	let o2 = orientation(p1, q1, q2); 
	let o3 = orientation(p2, q2, p1); 
	let o4 = orientation(p2, q2, q1); 

	// General case 
	if ( (o1 != o2) && (o3 != o4) && (o1!=0 && o2!=0 && o3!=0 && o4!=0) ) return true; 

	// Special Cases 
	// p1, q1 and p2 are colinear and p2 lies on segment p1q1 
	if (o1 == 0 && onSegment(p1, p2, q1)) return true; 

	// p1, q1 and q2 are colinear and q2 lies on segment p1q1 
	if (o2 == 0 && onSegment(p1, q2, q1)) return true; 

	// p2, q2 and p1 are colinear and p1 lies on segment p2q2 
	if (o3 == 0 && onSegment(p2, p1, q2)) return true; 

	// p2, q2 and q1 are colinear and q1 lies on segment p2q2 
	if (o4 == 0 && onSegment(p2, q1, q2)) return true; 

	return false; // Doesn't fall in any of the above cases 
} 



function ear_slice(){
	while (pts.length > 2){

		let i, proposed_diag;


		for (i = 1; i<pts.length-1; i++)
		{
			ear_orien = orientation(pts[i-1], pts[i], pts[i+1])
			proposed_diag = [pts[i-1], pts[i+1]];
			
			// if proposed_diag does not intersect any edge, 
			// then ear candidate is ok
			
			let [p1, q1] = proposed_diag;

			let edge_intersects = [];
			edges.forEach(function(edge){
				// let p2q2 be the edge
				let [p2, q2] = edge;
				edge_intersects.push(doIntersect(p1, q1, p2, q2))
			});

			if ( !edge_intersects.includes(true) && sameSign(orien, ear_orien))
			{
				// we have a valid ear splice here
				diags.push(proposed_diag);

				// add to internal orientation to counter 
				orien += orientation(pts[i-1], pts[i], pts[i+1]);

				break; // exit
			}
			

		}


		// remove the vertex
		pts.splice(i, 1);
		
	}

	console.log(orien);
	update_canvas();
}



function update_canvas(){
	svg.selectAll(".vertex")
		.data(pts)
		.join("circle")
		.attr("class", "vertex")
		.attr("cx", function(d) {return d.x;})
		.attr("cy", function(d) {return d.y;})
		.attr("fill", "red")
		.attr("r", 5);

	svg.selectAll('.edge')
		.data(diags)
		.join('line')
		.attr("class", "edge")
		.style("stroke", "red")
		.style("stroke-width", 2)
		.attr("x1", function(d) {return d[0].x;})
		.attr("y1", function(d) {return d[0].y;})
		.attr("x2", function(d) {return d[1].x;})
		.attr("y2", function(d) {return d[1].y;});
		
	svg.selectAll('.diag')
		.data(edges)
		.join('line')
		.attr("class", "diag")
		.style("stroke", "lightgreen")
		.style("stroke-width", 2)
		.attr("x1", function(d) {return d[0].x;})
		.attr("y1", function(d) {return d[0].y;})
		.attr("x2", function(d) {return d[1].x;})
		.attr("y2", function(d) {return d[1].y;});
}


var dragHandler = d3.drag()
	.on("start", function(){
		let coords = d3.mouse(this);
		let pt= {
			x: Math.round( coords[0] ),
			y: Math.round( coords[1] ),
		};
		pts.push(pt);

		if (pts.length>1){
			let edge = [pts[pts.length-1],pts[pts.length-2]];
			edges.push(edge);
		};

		update_canvas();
	})
	.on("drag", function () {
		let coords = d3.mouse(this);
		let delx = pts[pts.length-1].x - coords[0];
		let dely = pts[pts.length-1].y - coords[1];
		
		if (delx*delx+dely*dely > radius*radius){
			let pt= {
				x: Math.round( coords[0] ),
				y: Math.round( coords[1] )
			};
			pts.push(pt);

			if (pts.length>1){
				let edge = [pts[pts.length-1],pts[pts.length-2]];
				edges.push(edge);
			};
		};

		update_canvas();
	})
	.on("end", function(){	
		// calculate orientation	
		update_canvas();
	});


dragHandler(svg);







