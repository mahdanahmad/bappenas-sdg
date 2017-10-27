function createMap(data) {
	let canvasWidth		= $('#map-container').outerWidth(true);
	let canvasHeight	= $('#map-container').outerHeight(true);

	let margin 			= { top: 0, right: 0, bottom: 0, left: 0 };
	let width			= canvasWidth - margin.right - margin.left;
	let height			= canvasHeight - margin.top - margin.bottom;

	let minData			= _.minBy(data, 'value').value;
	let maxData			= _.maxBy(data, 'value').value;
	let range			= _.floor((maxData - minData) / 3);
	let fracture		= [maxData - range, maxData - 2 * range];

	let mappedNilai		= _.chain(data).keyBy('name').mapValues('value').value();

	let svg = d3.select("#map-container").append("svg")
    	.attr("width", width)
        .attr("height", height);

	d3.json("/public/indonesia.json", function(err, idn) {
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
            .attr("class", (o) => ("province " + setProvClass(o.properties.nm_provinsi)))
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

				tooltip
					.select("#map-tooltip-value")
					.text(mappedNilai[o.properties.nm_provinsi]);

				d3.select("#map-tooltip").classed("hidden", false);

			})
			.on("mouseout", () => { d3.select("#map-tooltip").classed("hidden", true).classed("top", false).classed("down", false); });;

        svg.append("path")
            .datum(topojson.mesh(idn, idn.objects.map, (a, b) => (a !== b)))
            .attr("d", path)
            .attr("class", "province-border");
	});

	function setProvClass(name) {
		let defClass	= _.snakeCase(name) + " ";
		switch (true) {
			case mappedNilai[name] > fracture[0]: return defClass + "high";
			case mappedNilai[name] > fracture[1]: return defClass + "mid";
			default: return defClass + "low";
		}
	}
}
