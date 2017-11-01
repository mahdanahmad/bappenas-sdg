function createMap() {
	d3.select("#map-container").selectAll("svg").remove();

	let canvasWidth		= $('#map-container').outerWidth(true);
	let canvasHeight	= $('#map-container').outerHeight(true);

	let margin 			= { top: 0, right: 0, bottom: 0, left: 0 };
	let width			= canvasWidth - margin.right - margin.left;
	let height			= canvasHeight - margin.top - margin.bottom;

	let svg = d3.select("#map-container").append("svg")
    	.attr("width", width)
        .attr("height", height);

	d3.json("public/indonesia.json", function(err, idn) {
		if (err) return console.error(err);

		let states	= topojson.feature(idn, idn.objects.map);
		let projection = d3.geoEquirectangular()
            .scale(1500)
            .rotate([-120, 0])
            .translate([(width / 2) + 55, (height / 2) - 50]);
		let path = d3.geoPath().projection(projection);

		svg.append("path")
            .datum(states)
            .attr("d", path);

		svg.selectAll(".state")
            .data(states.features)
            .enter().append("path")
            .attr("id", (o) => (_.snakeCase(o.properties.nm_provinsi)))
            .attr("class", (o) => ("province color-5"))
            .attr("d", path)
			.on("mouseover", function(o) {
				let mouse = d3.mouse(svg.node()).map( (o) => (parseInt(o)));

				let xPosition	= mouse[0] + 10;
				let yPosition	= mouse[1] + 10;

				let tooltip		= d3.select("#map-tooltip");

				tooltip
					.style("left", xPosition + "px")
					.style("top", yPosition + "px");

				tooltip
					.select("#map-tooltip-prov")
					.text(o.properties.nm_provinsi);

				d3.select("#map-tooltip").classed("hidden", false);

			})
			.on("mouseout", () => { d3.select("#map-tooltip").classed("hidden", true).classed("top", false).classed("down", false); })
			.on("click", (o) => { createLineChart(o.properties.nm_provinsi); });

        svg.append("path")
            .datum(topojson.mesh(idn, idn.objects.map, (a, b) => (a !== b)))
            .attr("d", path)
            .attr("class", "province-border");
	});
}

function redrawMap(data) {
	$(' .province ').removeClass((idx, className) => ((className.match (/(^|\s)color-\S+/g) || []).join(' ')) );

	if (!_.isEmpty(data)) {
		const minData		= _.minBy(data, 'value').value;
		const maxData		= _.maxBy(data, 'value').value;
		const range			= _.ceil((maxData - minData) / 5);
		const fracture		= _.times(5, (i) => (_.ceil(maxData) - ((i + 1) * range)))
		const mappedNilai	= _.chain(data).keyBy((o) => (_.snakeCase(o.name))).mapValues('value').value();

		_.forEach(data, (o) => { $('path#' + _.snakeCase(o.name)).addClass(checkProvRange(o.value)); });

		function checkProvRange(value) {
			let className	= "";
			_.forEach(fracture, (o, i) => {
				if (value >= o && _.isEmpty(className)) { className = 'color-' + (i + 1); }
			});

			return !_.isEmpty(className) ? className : 'color-5';
		}


		$('.province').mouseover(function() { $(' #map-tooltip-value ').text(mappedNilai[$(this).attr('id')] || 0); });
	} else {
		$(' .province ').addClass('color-5');
	}

}
