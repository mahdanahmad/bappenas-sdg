let defaultOpt	= "<option value='' disabled selected hidden>Pilih Indikator</option>";
let noOpt		= "<option value='' disabled>Tidak Ada data tersedia untuk tujuan ini</option>";

let provs		= ["Bali", "Banten", "Bengkulu", "Daerah Istimewa Yogyakarta", "DKI Jakarta", "Gorontalo", "Jambi", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah", "Kalimantan Timur", "Kalimantan Utara", "Kepulauan Bangka Belitung", "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara", "Nangroe Aceh Darussalam", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Papua", "Papua Barat", "Riau", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tengah", "Sulawesi Tenggara", "Sulawesi Utara", "Sumatera Barat", "Sumatera Selatan", "Sumatera Utara"]
let sdgs_list	= [
	"Tidak ada kemiskinan",
	"Tidak ada kelaparan",
	"Kesehatan yang baik",
	"Pendidikan berkualitas",
	"Kesetaraan gender",
	"Air bersih dan sanitasi",
	"Energi terbarukan",
	"Pekerjaan yang baik dan pertumbuhan ekonomi",
	"Inovasi dan infrastruktur",
	"Berkurangnya ketidaksetaraan",
	"Kota dan masyarakat berkelanjutan",
	"Pemakaian yang bertanggung jawab",
	"Aksi iklim",
	"Kehidupan di bawah air",
	"Kehidupan di darat",
	"Perdamaian dan keadilan",
	"Kemitraan untuk tujuan",
];

$( document ).ready(function() {
	let sgd_active	= _.head(sdgs_list);

	$('#sdg-wrapper').html(_.map(sdgs_list, (o, i) => ("<div class='sdg-container cursor-pointer' onclick=\"sdgClicked(this, '" + o + "')\">" +
		"<img src='/public/images/sdgs_logo/" + (i + 1) + ".png'/>" +
		"<div class='sdg-overlay'></div>" +
	"</div>")));

	$('#indikator-selector').html(defaultOpt);

	setTimeout(function() {
		$('#chart-wrapper').height($('#root').outerHeight( true ) - $('#header').outerHeight( true ) - $('#sdg-wrapper').outerHeight( true ) - $('#indikator-wrapper').outerHeight( true ));

		let data	= _.chain(provs).map((o) => ({ name: o, value: _.random(10) })).sortBy('value').value();

		createBarChart(data);
		createMap(data);

		$('#ikhtisar-goals').html(_.take(sdgs_list, 5).join(', '));
		$('#ikhtisar-provinces').html(_.take(provs, 5).join(', '));
	}, 100);

});

function sdgClicked(elem, name) {
	$('.sdg-container.active').removeClass('active');
	$(elem).addClass('active');
	$('#selected-sdg').text(name);

	let indicators	= _.chain(5).random().times((o) => ("indikator " + (o + 1))).value();
	$('#indikator-selector').html(defaultOpt + (indicators.length > 0 ? _.map(indicators, (o) => ('<option>' + o + '</option>')) : noOpt ));
}
