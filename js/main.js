const proxyurl 		= "";
const baseURL		= "http://hub.satudata.bappenas.go.id/api/action/datastore_search?resource_id=";
const mainURL		= baseURL + "14683ee3-f49c-4c58-a83c-593dbbe4157a";
const limitParam	= '&limit=1000';

const defaultOpt	= "<option value='' disabled selected hidden>Pilih Indikator</option>";
const noOpt			= "<option value='' disabled>Tidak Ada data tersedia untuk tujuan ini</option>";

const provs			= ["Aceh", "Bali", "Banten", "Bengkulu", "DI Yogyakarta", "DKI Jakarta", "Gorontalo", "Jambi", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah", "Kalimantan Timur", "Kalimantan Utara", "Kepulauan Bangka Belitung", "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Papua", "Papua Barat", "Riau", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tengah", "Sulawesi Tenggara", "Sulawesi Utara", "Sumatera Barat", "Sumatera Selatan", "Sumatera Utara"];
const sdgs_list		= [
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

const def_data		= _.chain(provs).map((o) => ({ name: o, value: 0 })).orderBy('name', 'desc').value();

let avail_inds	= [];
let avail_data	= {};
let ind_data	= {};
let sgd_active	= "";
let current_max	= 0;

$( document ).ready(function() {

	$('#sdg-wrapper').html(_.map(sdgs_list, (o, i) => ("<div class='sdg-container cursor-pointer' onclick=\"sdgClicked(this, '" + o + "')\">" +
		"<img src='public/images/sdgs_logo/" + (i + 1) + ".png'/>" +
		"<div class='sdg-overlay'></div>" +
	"</div>")));

	$('#indikator-selector').html(defaultOpt);

	setTimeout(function() {
		$('#chart-wrapper').height($('#root').outerHeight( true ) - $('#header').outerHeight( true ) - $('#sdg-wrapper').outerHeight( true ) - $('#indikator-wrapper').outerHeight( true ));
		$(' #legend-container > ul ').html(_.map(['Sangat Tinggi', 'Tinggi', 'Sedang', 'Rendah', 'Sangat Rendah', 'Tidak Ada Data'], (o, i) => ("<li class='color-" + (i + 1) + "'>" + o + "</li>")).join(""));

		createBarChart(def_data);
		createMap();

		$.get( proxyurl + mainURL + limitParam, ( data ) => {
			avail_data	= _.chain(data).get('result.records', []).filter((o) => (o.status == 'Tersedia' && !_.isEmpty(o.resource_id))).groupBy('tujuan').value();
			avail_inds	= _.chain(avail_data).keys().map(_.toInteger).value();
		});
	}, 100);

});

function sdgClicked(elem, name) {
	if (sgd_active == "") { $(' #content-overlay-notif > div ').text('Pilih indikator untuk mengaktifkan visualisasi.'); $(' select#indikator-selector ').prop('disabled', false); }
	if (!_.isEmpty(avail_inds) && sgd_active !== name) {
		backToMap();
		createBarChart(def_data);
		redrawMap([]);
		$('#content-overlay').show();
		$('#legend-wrapper').hide();
		$('#map-wrapper').addClass('transparent');

		$('.sdg-container.active').removeClass('active');
		$('.national').removeClass('national');
		$(elem).addClass('active');
		$('#selected-sdg').text('Goal ' + (_.indexOf(sdgs_list, name) + 1) + ': ' + name);

		sgd_active	= name;

		let selected_goal	= _.indexOf(sdgs_list, name) + 1;
		if (_.indexOf(avail_inds, selected_goal) >= 0) {
			$('#indikator-selector').html(defaultOpt + _.map(avail_data[selected_goal], (o) => ("<option value='" + o.resource_id + "'>" + o.nama_indikator + "</option>")).join(""));
		} else {
			$('#indikator-selector').html(defaultOpt + noOpt);
		}
	}
}

function indClicked(elem) {
	$.get( proxyurl + baseURL + elem.value + limitParam, ( data ) => {
		let accepted_data	= _.chain(data).get('result.records', []).filter((o) => (_.indexOf(provs, o.disagregasi) >= 0)).value();
		let shown_years		= _.chain(accepted_data).uniqBy('tahun').map('tahun').maxBy(_.toInteger).value();
		let shown_data		= _.chain(accepted_data).filter(['tahun', shown_years]).map((o) => ({ name: o.disagregasi, value: _.round(parseFloat(o.nilai || o.data), 2) })).value();

		$('#content-overlay').hide();
		$('#map-wrapper').removeClass('transparent');

		if (_.isEmpty(shown_data)) {
			let nasional_data	= _.chain(data).get('result.records', []).filter((o) => (o.disagregasi.toLowerCase() == 'indonesia')).keyBy('tahun').mapValues((o) => (_.round(parseFloat(o.nilai || o.data), 2))).value();

			$('#detil-wrapper').addClass('national');
			$('#barchart-container').addClass('national');

			createLineChart('Indonesia', 'nasional', nasional_data);
		} else {
			ind_data			= _.chain(accepted_data).groupBy('disagregasi').mapValues((o) => (_.chain(o).keyBy('tahun').mapValues((d) => (_.round(parseFloat(d.nilai), 2))).value())).value();
			current_max			= _.chain(accepted_data).maxBy((o) => (_.toInteger(o.nilai))).get('nilai', 0).toInteger().ceil().multiply(1.10).value();

			$('.national').removeClass('national');
			backToMap();
			$('#legend-wrapper').show();

			let capaian			= _.chain(shown_data).map('value').mean().round(2).value();
			$('.capaian-nasional > span').text(capaian);

			createBarChart(_.sortBy(shown_data, 'value'), capaian);
			redrawMap(shown_data);
		}

	});
}
