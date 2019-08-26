import Printer from './Printer';
let activeMap = undefined;

export default class Listeners {
  constructor(document, map) {
    this.setActiveMap(map);

    document.getElementById('basicMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('basic');
    });

    document.getElementById('darkMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('dark');
    });

    document.getElementById('lightMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('light');
    });

    document.getElementById('satelliteMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('satellite');
    });

    document.getElementById('topMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('top');
    });
    document.getElementById('dopMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('dop');
    });

    document.getElementById('dtkMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('dtk');
    });

    document.getElementById('blankMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('empty');
    });

    document.getElementById('tranchotMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('tranchot');
    });

    document.getElementById('uraufnahmeMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('uraufnahme');
    });

    document.getElementById('neuaufnahmeMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('neuaufnahme');
    });

    document.getElementById('tk25Map').addEventListener('click', () => {
      this.getActiveMap().changeStyle('tk25');
    });

    document.getElementById('dgk5Map').addEventListener('click', () => {
      this.getActiveMap().changeStyle('dgk5');
    });

    document
      .getElementById('csv_modal_launch')
      .addEventListener('click', () => {
        $('#csvModal').modal('toggle');
      });

    document.getElementById('csv_start').addEventListener('click', () => {
      const title = $('#csv_title').val();

      if (title === null || title === '') {
        alert('Bitte geben Sie einen Titel an');
      } else if ($('#custom_csv_input').get(0).files.length === 0) {
        alert('Bitte laden Sie Ihre CSV Datei hoch');
      } else {
        console.log('Start mit CSV');
        this.getActiveMap().importCSV();
        $('#csvModal').modal('toggle');
      }
    });

    document.getElementById('my_dataviz').addEventListener('click', e => {
      const target = $(e.target);
      //console.log(target)
      const dataKey = e.path[0].attributes[3].value;
      let data;
      if (target.hasClass('middle') && dataKey === 'Gewinner') {
        data = true;
        $('.scale-legend').hide();
        console.log(`your Data :`);
        console.log(data);
      } else {
        $('.scale-legend').show();
        data = false;
      }
      console.log(`your choice : ${dataKey}`);
      // eslint-disable-next-line no-undef
      this.getActiveMap().updateData(dataKey, data);
    });

    document
      .getElementById('transparency-slider')
      .addEventListener('input', e => {
        this.getActiveMap().changeTransparency(e.target.value);
      });

    document.getElementById('population_data').addEventListener('click', () => {
      console.log('pop');
      this.getActiveMap().setData('population_data', 'population');
    });
    document
      .getElementById('Einwohner_Quadratkilometer_UTF8')
      .addEventListener('click', () => {
        console.log('Einwohner_Quadratkilometer_UTF8');
        this.getActiveMap().setData(
          'Einwohner_Quadratkilometer_UTF8',
          'Einwohner je Quadratkilometer'
        );
      });

    document.getElementById('election_data').addEventListener('click', () => {
      console.log('europawahl_2019');

      this.getActiveMap().setData('election_data_UTF8', 'europawahl_2019');
    });

    document
      .getElementById('Anteil_Arbeitslose_UTF8')
      .addEventListener('click', () => {
        //alert('Click Arbeitslose');

        this.getActiveMap().setData('Anteil_Arbeitslose_UTF8', 'Arbeitslose');
      });
    document
      .getElementById('Primaereinkommen_Einwohner_UTF8')
      .addEventListener('click', () => {
        //alert('Click Arbeitslose');

        this.getActiveMap().setData(
          'Primaereinkommen_Einwohner_UTF8',
          'Primaereinkommen_Einwohner'
        );
      });

    document
      .getElementById('Erwerbstaetige_Dienstleistung')
      .addEventListener('click', () => {
        this.getActiveMap().setData(
          'Anteil_Erwerbstaetige_Dienstleistung_UTF8',
          'Erwerbstaetige_Dienstleistung'
        );
      });

    document
      .getElementById('Erwerbstaetige_Forst')
      .addEventListener('click', () => {
        this.getActiveMap().setData(
          'Anteil_Erwerbstaetige_Forst_UTF8',
          'Erwerbstaetige_Forst'
        );
      });

    document
      .getElementById('Erwerbstaetige_Gewerbe')
      .addEventListener('click', () => {
        this.getActiveMap().setData(
          'Anteil_Erwerbstaetige_ProduzierendesGewerbe_UTF8',
          'Erwerbstaetige_Gewerbe'
        );
      });

    document
      .getElementById('Einbuergerungen_Auslaender')
      .addEventListener('click', () => {
        this.getActiveMap().setData(
          'Einbuergerungen_von_Auslaendern',
          'Einbuergerungen_Auslaender'
        );
      });
    document.getElementById('schutzsuchende').addEventListener('click', () => {
      this.getActiveMap().setData('Schutzsuchende_UTF8', 'Schutzsuchende');
    });

    document.getElementById('KiTas').addEventListener('click', () => {
      if (this.getActiveMap().containsLayer('KiTasNRW')) {
        $('#kita_circle_editor').hide();
      } else {
        $('#kita_circle_editor').show();
      }
      this.getActiveMap().setPointData('KiTas_NRW', 'KiTas NRW');
    });

    $('#KiTaHeat').change(() => {
      if ($('#KiTaHeat')[0].checked) {
        this.getActiveMap().enableHeatmap();
      } else {
        this.getActiveMap().disableHeatmap();
      }
    });

    $('#select_circle_radius').on('change', () => {
      this.getActiveMap().setPointRadius($('#select_circle_radius').val());
    });

    $('#select_circle_color').on('change', () => {
      this.getActiveMap().setPointColor($('#select_circle_color').val());
    });

    /**document.getElementById('lowColor').addEventListener(
      'change',
      e => {
        this.getActiveMap().changeColor('low', e.target.value);
      },
      true
    );

    document.getElementById('highColor').addEventListener(
      'change',
      e => {
        this.getActiveMap().changeColor('high', e.target.value);
      },
      true
    );          **/

    document.getElementById('changeColor').addEventListener(
      'click',
      () => {
        this.getActiveMap().changeColor(
          'high',
          document.getElementById('highColor').value
        );
        this.getActiveMap().changeColor(
          'low',
          document.getElementById('lowColor').value
        );
      },
      true
    );

    document
      .getElementById('stats_equal_interval')
      .addEventListener('click', () => {
        this.getActiveMap().changeStatistics('EQUAL_INTERVAL');
      });

    document
      .getElementById('stats_std_deviation')
      .addEventListener('click', () => {
        this.getActiveMap().changeStatistics('STD_DEVIATION');
      });

    document
      .getElementById('stats_arithmetic_progression')
      .addEventListener('click', () => {
        this.getActiveMap().changeStatistics('ARITHMETIC_PROGRESSION');
      });

    document
      .getElementById('stats_geometric_progression')
      .addEventListener('click', () => {
        this.getActiveMap().changeStatistics('GEOMETRIC_PROGRESSION');
      });

    document.getElementById('stats_quantile').addEventListener('click', () => {
      this.getActiveMap().changeStatistics('QUANTILE');
    });

    document.getElementById('stats_jenks').addEventListener('click', () => {
      this.getActiveMap().changeStatistics('JENKS');
    });

    document.getElementById('stats_standard').addEventListener('click', () => {
      this.getActiveMap().changeStatistics('STANDARD');
    });

    // https://stackoverflow.com/a/32922725/5660646
    $(document).on('click', '.dropdown-menu', e => {
      e.stopPropagation();
    });

    // rotate the legend collapse button on click
    $('.legend').on('hide.bs.collapse', () => {
      $('#legend_collapse').toggleClass('rotate');
    });

    $('.legend').on('show.bs.collapse', () => {
      $('#legend_collapse').toggleClass('rotate');
    });

    document.getElementById('print').addEventListener('click', () => {
      const mapPrinter = new Printer(activeMap);
      if (
        $('#export_pdf')
          .parent()
          .hasClass('active')
      ) {
        mapPrinter.generatePDF();
      } else if (
        $('#export_png')
          .parent()
          .hasClass('active')
      ) {
        mapPrinter.generatePNG();
      }
    });

    document
      .getElementById('toggleLegalAdvice')
      .addEventListener('click', () => {
        $('#legalAdviceModal').modal('toggle');
      });

    document.getElementById('logo').addEventListener('click', () => {
      location.reload();
    });

    document.getElementById('clear').addEventListener('click', () => {
      this.getActiveMap().loadData();
      this.getActiveMap()._hideLegend();
    });

    // document.getElementById('Wahl17_SPD').addEventListener('click', () => {
    //     map.setData('Wahlergebnisse_CDU_1976_bis_2013', 'Wahl17_SPD');
    // });

    // document.getElementById('feinstaub01').addEventListener('click', () => {
    //     map.addFeinstaubLayer('band01_02112017');
    // });

    // document.getElementById('feinstaub12').addEventListener('click', () => {
    //     map.addFeinstaubLayer('band12_02112017');
    // });

    // document.getElementById('feinstaub24').addEventListener('click', () => {
    //     map.addFeinstaubLayer('band24_02112017');
    // });

    // document
    //     .getElementById('feinstaub-remove')
    //     .addEventListener('click', () => {
    //         map.removeFeinstaubLayer();
    //     });
  }

  setActiveMap(map) {
    //alert('aktiviere: ' + map)
    activeMap = map;

    try {
      // update transparency slider
      document.getElementById('transparency-slider').value =
        activeMap.getTransparency() * 100;
    } catch (e) {}
  }

  getActiveMap() {
    return activeMap;
  }
}
