export default class Listeners {
    constructor(document, map, loadDone) {

        document.getElementById('basicMap').addEventListener('click', () => {
            map.changeStyle('basic');
        });

        document.getElementById('darkMap').addEventListener('click', () => {
            map.changeStyle('dark');
        });

        document.getElementById('lightMap').addEventListener('click', () => {
            map.changeStyle('light');
        });

        document.getElementById('satelliteMap').addEventListener('click', () => {
            map.changeStyle('satellite');
        });

        document.getElementById('topMap').addEventListener('click', () => {
            map.changeStyle('top');
        });

        document.getElementById('dtkMap').addEventListener('click', () => {
            map.changeStyle('dtk');
        });

        document.getElementById('dopMap').addEventListener('click', () => {
            map.changeStyle('dop');
        });

        document
            .getElementById('custom_csv_input')
            .addEventListener('change', () => {
                map.importCSV();
            });

        document.getElementById('slider').addEventListener('input', function (e) {
            const year = parseInt(e.target.value, 10);
            map.updateData(year);
        });

        document
            .getElementById('transparency-slider')
            .addEventListener('input', function (e) {
                const transparency = e.target.value;
                map.changeTransparency(transparency);
            });

        document
            .getElementById('population_data')
            .addEventListener('click', () => {
                console.log('pop');
                map.setData('population_data', 'population');
            });

        document
            .getElementById('Anteil_Arbeitslose_UTF8')
            .addEventListener('click', () => {
                map.setData('Anteil_Arbeitslose_UTF8', 'arbeitslose');
            });

        document
            .getElementById('Erwerbstaetige_Dienstleistung')
            .addEventListener('click', () => {
                map.setData(
                    'Anteil_Erwerbstaetige_Dienstleistung_UTF8',
                    'Erwerbstaetige_Dienstleistung'
                );
            });

        document
            .getElementById('Erwerbstaetige_Forst')
            .addEventListener('click', () => {
                map.setData('Anteil_Erwerbstaetige_Forst_UTF8', 'Erwerbstaetige_Forst');
            });

        document
            .getElementById('Erwerbstaetige_Gewerbe')
            .addEventListener('click', () => {
                map.setData(
                    'Anteil_Erwerbstaetige_ProduzierendesGewerbe_UTF8',
                    'Erwerbstaetige_Gewerbe'
                );
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

        // document.getElementById('lowColor').addEventListener(
        //     'change',
        //     e => {
        //         map.changeColor('low', e.target.value);
        //     },
        //     true
        // );

        // document.getElementById('highColor').addEventListener(
        //     'change',
        //     e => {
        //         map.changeColor('high', e.target.value);
        //     },
        //     true
        // );

        loadDone();

    }

}