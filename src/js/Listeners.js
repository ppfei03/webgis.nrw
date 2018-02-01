let activeMap = undefined;

export default class Listeners {
  constructor(document, map, secondary_map, loadDone) {
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

    document.getElementById('dtkMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('dtk');
    });

    document.getElementById('dopMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('dop');
    });

    document
      .getElementById('custom_csv_input')
      .addEventListener('change', () => {
        this.getActiveMap().importCSV();
      });

    document.getElementById('slider').addEventListener('input', e => {
      const year = parseInt(e.target.value, 10);
      this.getActiveMap().updateData(year);
    });

    document
      .getElementById('transparency-slider')
      .addEventListener('input', e => {
        const transparency = e.target.value;
        this.getActiveMap().changeTransparency(transparency);
      });

    document.getElementById('population_data').addEventListener('click', () => {
      console.log('pop');
      this.getActiveMap().setData('population_data', 'population');
    });

    document
      .getElementById('Anteil_Arbeitslose_UTF8')
      .addEventListener('click', () => {
        this.getActiveMap().setData('Anteil_Arbeitslose_UTF8', 'arbeitslose');
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

    document.getElementById('lowColor').addEventListener(
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

    // document.getElementById('Wahl17_CDU').addEventListener('click', () => {
    //     map.setData('Wahlergebnisse_CDU_1976_bis_2013', 'Wahl17_CDU');
    // });

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

    loadDone();
  }

  setActiveMap(map) {
    activeMap = map;
  }

  getActiveMap() {
    return activeMap;
  }
}