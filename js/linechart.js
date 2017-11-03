let duration	= 600;

function createLineChart(name) {
	$('#province-name').text(name);
	$('rect').removeClass('active');
	$('rect#' + _.snakeCase(name)).addClass('active');
	d3.select("#linechart-container").selectAll("svg").remove();

	$('#map-wrapper').hide(duration, () => {
		$('#detil-wrapper').fadeIn(0);

		setTimeout(function() {
			let canvasWidth		= $('#linechart-container').outerWidth(true);
			let canvasHeight	= $('#detil-wrapper').outerHeight(true) - $('#province-name').outerHeight(true);;

			$('#linechart-container').height(canvasHeight);

			let margin 			= { top: 10, right: 100, bottom: 75, left: 100 };
			let width			= canvasWidth - margin.right - margin.left;
			let height			= canvasHeight - margin.top - margin.bottom;

			let labels			= ["2010", "2011", "2012", "2013", "2014", "2015", "2016"];
			let data			= _.map(labels, (o) => ({ year: o, value: (ind_data[name][o] || null) }));

			let x				= d3.scaleBand().range([0, width]).domain(labels);
			let y				= d3.scaleLinear().range([height, 0]).domain([0, current_max]);

			let line 			= d3.line()
				.x((o) => (x(o.year) + (x.bandwidth() / 2)))
				.y((o) => (y(o.value)))
				.curve(d3.curveMonotoneX);

			let svg = d3.select("#linechart-container").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(x));

			svg.append("g")
				.attr("class", "y axis")
				.call(d3.axisLeft(y).ticks(5));

			svg.append("g")
				.attr("class", "grid")
				// .attr("transform", "translate(0," + height + ")")
				.call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""));

			svg.append("path")
			    .datum(data)
			    .attr("class", 'line')
			    .attr("d", line)
				.attr("stroke-dasharray", function (d) { return this.getTotalLength() })
            	.attr("stroke-dashoffset", function (d) { return this.getTotalLength() });

			svg.selectAll(".dot")
				.data(data)
				.enter().append("circle")
					.attr("class", (o) => ("dot " + (_.isNil(o.value) ? 'nodata' : '')))
					.attr("cx", (o) => (x(o.year) + (x.bandwidth() / 2)))
					.attr("cy", height)
					.attr("r", 7)
				.on("mouseover", function(o) {
					let xPosition	= _.toInteger(d3.select(this).attr("cx")) + 25;
					let yPosition	= _.toInteger(d3.select(this).attr("cy")) + 30;

					d3.select("#linechart-tooltip")
						.style("left", xPosition + "px")
						.style("top", yPosition + "px")
						// .select("#linechart-tooltip-value")
						.text(o.value ? ("Nilai: " + o.value) : "Data tidak tersedia");

					d3.select("#linechart-tooltip").classed((d3.select(this).attr("y") < 28 ? "top" : "down"), true);
					d3.select("#linechart-tooltip").classed("hidden", false);
				})
				.on("mouseout", () => { d3.select("#linechart-tooltip").classed("hidden", true).classed("top", false).classed("down", false); });

			svg.selectAll('.text')
				.data(data)
				.enter().append("text")
					.attr("class", "text cursor-default")
					.attr("x", (o) => (x(o.year) + (x.bandwidth() / 2) - 17))
					.attr("y", (o) => (y(o.value) - 40))
					.attr("dy", "1em")
					.text((o) => (o.value));

			let transition	= d3.transition()
		        .duration(500)
		        .ease(d3.easeLinear);

			svg.selectAll(".line").transition(transition)
            	.attr("stroke-dashoffset", 0);

			svg.selectAll(".dot").transition(transition)
		        .attr("cy", (o) => (y(o.value)));

		}, 100);
	});

};

function backToMap() { $('rect').removeClass('active'); $('#detil-wrapper').hide(duration, () => {  $('#map-wrapper').fadeIn(0); }); }
