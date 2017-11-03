function createBarChart(data) {
	d3.select("#barchart-container").selectAll("svg").remove();

	let canvasWidth		= $('#barchart-container').outerWidth(true);
	let canvasHeight	= $('#barchart-container').outerHeight(true);

	let provHeight		= 20;

	let margin 			= { top: 15, right: 25, bottom: 15, left: 150 };
	let width			= canvasWidth - margin.right - margin.left;
	let height			= provHeight * data.length;
	// let height			= canvasHeight - margin.top - margin.bottom;

	let y 				= d3.scaleBand().range([height, 0]).padding(0.1);
	let x 				= d3.scaleLinear().range([0, width]);

	let svg = d3.select("#barchart-container").append("svg")
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
			  .append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	data.forEach((o) => { o.value = +o.value; });

	x.domain([0, d3.max(data, (o) => (o.value))]);
	y.domain(data.map((o) => (o.name)));

	svg.selectAll(".bar")
			.data(data)
	    .enter().append("rect")
			.attr("id", (o) => (_.snakeCase(o.name)))
			.attr("class", "bar")
			// .attr("width", (o) => (x(o.value)))
			.attr("width", 0)
			.attr("y", (o) => (y(o.name)))
			.attr("height", y.bandwidth())
		.on("mouseover", function(o) {
			let xPosition	= d3.select(this).attr("width") / 2 + margin.left - 50;
			let yPosition	= parseFloat(d3.select(this).attr("y") - (d3.select(this).attr("y") < 28 ? -(y.bandwidth() * 2) : y.bandwidth()));

			d3.select("#barchart-tooltip")
				.style("left", xPosition + "px")
				.style("top", yPosition + "px")
				.select("#barchart-tooltip-value")
				.text(o.value);

			d3.select("#barchart-tooltip").classed((d3.select(this).attr("y") < 28 ? "top" : "down"), true);
			d3.select("#barchart-tooltip").classed("hidden", false);

		})
		.on("mouseout", () => { d3.select("#barchart-tooltip").classed("hidden", true).classed("top", false).classed("down", false); })
		.on("click", (o) => { createLineChart(o.name); });


	let transition	= d3.transition()
        .duration(750)
        .ease(d3.easeLinear);

	svg.selectAll(".bar").transition(transition)
        .attr("width", (o) => (x(o.value) || 0));

	svg.append("g").call(d3.axisLeft(y).tickSize(0));
}
