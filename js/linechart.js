let duration	= 600;

function createLineChart(name) {
	$('#province-name').text(name);
	d3.select("#linechart-container").selectAll("svg").remove();

	$('#map-wrapper').hide(duration, () => {
		$('#detil-wrapper').fadeIn(0);

		setTimeout(function() {
			let canvasWidth		= $('#linechart-container').outerWidth(true);
			let canvasHeight	= $('#detil-wrapper').outerHeight(true) - $('#province-name').outerHeight(true);;

			$('#linechart-container').height(canvasHeight);

			let margin 			= { top: 10, right: 25, bottom: 50, left: 100 };
			let width			= canvasWidth - margin.right - margin.left;
			let height			= canvasHeight - margin.top - margin.bottom;

			let labels			= ["2010", "2011", "2012", "2013", "2014", "2015", "2016"];

			let data			= _.times(labels.length, (i) => ({ year: labels[i], value: _.random(10) }));

			let x				= d3.scaleBand().range([0, width]).domain(labels);
			let y				= d3.scaleLinear().range([height, 0]).domain([0, d3.max(data, (o) => (o.value)) + 1]);

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
				.call(d3.axisLeft(y));

			svg.append("path")
			    .datum(data)
			    .attr("class", "line")
			    .attr("d", line)
				.attr("stroke-dasharray", function(d) { return this.getTotalLength() })
            	.attr("stroke-dashoffset", function(d) { return this.getTotalLength() });

			svg.selectAll(".dot")
				.data(data)
				.enter().append("circle")
					.attr("class", "dot")
					.attr("cx", (o) => (x(o.year) + (x.bandwidth() / 2)))
					.attr("cy", height)
					.attr("r", 7);

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

function backToMap() { $('#detil-wrapper').hide(duration, () => {  $('#map-wrapper').fadeIn(0); }); }
