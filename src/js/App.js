import Map from './Map.js';
import Listeners from './Listeners.js';
import syncMove from '@mapbox/mapbox-gl-sync-move';
import MapboxCompare from 'mapbox-gl-compare';
import 'mapbox-gl-compare/dist/mapbox-gl-compare.css';
export let primary_map
export let secondary_map
export let dualView = false;
export let splitView = false;

class App {

  static run() {
    let listeners;
    primary_map = new Map('map', [7.555, 51.478333], 7, success => {
        primary_map.name = 'primary_map';
      if (success) {
        document.body.style.visibility = 'visible';

        // Add Home Button
        primary_map._addHomeButton();

        // finished loading
        document.getElementById('start').removeAttribute('disabled');
        document.getElementById('start').innerHTML = 'Los geht&#39;s!';
        document.getElementById('start').setAttribute('data-dismiss', 'modal');
      } else {
        document.getElementById('start').innerHTML =
          'Daten konnten nicht geladen werden :(';
        document.getElementById('start').classList.remove('btn-primary');
        document.getElementById('start').classList.add('btn-danger');
      }

      $('#map').droppable({
        drop: function(event, ui) {
          //alert('Drop to map 1')
          listeners.setActiveMap(primary_map);
          //alert(ui.draggable[0].id)

          try{
            //alert($(`#${ui.draggable[0].id}`).click())
            $(`#${ui.draggable[0].id}`).click()
            $(`#${ui.draggable[0].id}`).click()
          }catch(error){
            console.log(error)
            alert(error)

          }
        }
      });

      listeners = new Listeners(document, primary_map);
    });

    //let secondary_map;



    // dual mode triggered
    $('#mode-dual').on('change', () => {
      $('.split_mapLegend').remove();
      if (!this.dualView && $('#mode-dual').is(':checked')) {


        if (this.splitView) {
          $('#split_map').remove();

          $('.mapboxgl-compare').remove();
          this.splitView = false;
        }
        $('.webgis-view').after(
          '<div class="webgis-view-split" style="float: right; width:50vw;"><div id="dual_map" class="map"></div></div>'
        );
        $('.webgis-view, #map').css('width', '50vw');

        secondary_map = new Map('dual_map', [7.555, 51.478333], 7, success => {
            secondary_map.name = 'secondary_map';
          if (success) {
            secondary_map.center();
            primary_map.center();
            secondary_map._addHomeButton();
          }
        });

        syncMove(primary_map.getMap(), secondary_map.getMap());

        listeners.setActiveMap(primary_map);

        $('#dual_map').droppable({
          drop: function(event, ui) {
            //alert('Drop to dual_map')

            listeners.setActiveMap(secondary_map);
            $(`#${ui.draggable[0].id}`).click();
          }
        });

        this.dualView = true;
      }
    });

    // split mode triggered
    $('#mode-split').on('change', () => {
      $('.dual_mapLegend').remove();

      if (!this.splitView && $('#mode-split').is(':checked')) {
        if (this.dualView) {
          $('.webgis-view-split').remove();
          $('.webgis-view, #map').css('width', '100vw');
          this.dualView = false;
        }
        $('#map').after('<div id="split_map" class="map"></div>');

        secondary_map = new Map('split_map', [7.555, 51.478333], 7, success => {
            secondary_map.name = 'secondary_map';

            if (success) {
            secondary_map.center();
            primary_map.center();
          }
        });

        /*eslint-disable no-new*/
        new MapboxCompare(primary_map.getMap(), secondary_map.getMap());

        $('#map').droppable({ disabled: true });

        $('#split_map').droppable({
          drop: function(event, ui) {
           // alert('Drop to split_map')

            /**
             * Test on which side the button was dragged.
             * Find the slide position and compare it with the movable position (offset upper left corner) +
             * half width of the button (result is the center of the button).
             * */
            if (
              $('.mapboxgl-compare').position().left <=
              ui.offset.left + ui.draggable[0].offsetWidth / 2
            ) {
              listeners.setActiveMap(secondary_map);
            } else {
              listeners.setActiveMap(primary_map);
            }

            $(`#${ui.draggable[0].id}`).click();
          }
        });

        listeners.setActiveMap(primary_map);

        this.splitView = true;
      }
    });

    // standard mode triggered
    $('#mode-standard').on('change', () => {
      $('.dual_mapLegend, .split_mapLegend').remove();

      if ($('#mode-standard').is(':checked')) {
        if (this.dualView) {
          $('.webgis-view-split').remove();
          $('.webgis-view, #map').css('width', '100vw');
          this.dualView = false;
          $('#map').droppable({ disabled: false });
        }
        if (this.splitView) {
          $('#split_map').remove();
          $('.split_mapLegend').hide();
          $('.mapboxgl-compare').remove();
          this.splitView = false;
          $('#map').droppable({ disabled: false });
        }

        primary_map.resize();

        secondary_map = undefined;

        listeners.setActiveMap(primary_map);
      }
    });

    $('.legend').collapse('hide');



    $('#mode-dual, #mode-split').on('change', () => {
      if (!enableDraggableSettings){
      $('#map-select').collapse('show');
      }
    });

    $('#mode-standard').on('change', () => {
      if (!enableDraggableSettings){
        $('#map-select').collapse('hide');
      }
    });


     $('#edit-map-one, #edit-map-two').on('change', () => {
       if (!enableDraggableSettings){

         if ($('#edit-map-one').is(':checked')) {
        listeners.setActiveMap(primary_map);
        console.log('checked map 1');
      } else {
        listeners.setActiveMap(secondary_map);
        console.log('checked map 2');
      }
      }
    });


    //$('.draggable').addClass('ui-widget-content')
    $('.draggable').draggable({
      //helper: 'clone',
      cancel: false,
      revert: true,
      //scroll: false,
      //containment: 'window',
      //stack:'body',
      start: function(ui) {
        addMouseCLick(ui.clientX, ui.clientY, ui.type, ui.target.id)
/**
        $('.scrollable-menu, .panel')
          .css('visibility', 'hidden')
          .css('overflow', 'visible');
        $(this).css('visibility', 'visible');
        if ($('.navbar-toggler').attr('aria-expanded') === 'true') {
          $('nav').css('visibility', 'hidden');
        }

**/

      },
      stop: function(ui) {
        addMouseCLick(ui.clientX, ui.clientY, ui.type, ui.target.id)
/**
        $('.scrollable-menu, .panel')
          .css('overflow', '')
          .css('visibility', '');
        $(this).css('visibility', '');
        $('nav').css('visibility', '');
 **/
      }
    });


    const handleMousemove = event => {
      if(mouseAndClickRecord){

        addMouseCLick( event.x,  event.y, 'tracking', 'tracking')

      }
    };

    const throttle = (func, delay) => {
      let prev = Date.now() - delay;

      return (...args) => {
        const current = Date.now();
        if (current - prev >= delay) {
          prev = current;
          func.apply(null, args);
        }
      };
    };

    function addMouseCLick(x,y,type, element){
      let mouseTrack = JSON.parse(sessionStorage.getItem('mouseTrack')) || {
        clickType:[],clickX:[],clickY:[],clickTime:[],clickCount:[],clickElement:[]
      };

      mouseTrack.clickX.push(
        x,
      );
      if (y !== "") {
        y = $(document).height() - y
      }
      mouseTrack.clickY.push(y);

      mouseTrack.clickTime.push(
        Date.now()
      );
      mouseTrack.clickElement.push(
        element
      );
      mouseTrack.clickCount.push(
        mouseTrack.clickTime.length
      );
      mouseTrack.clickType.push(
        type
      );

      sessionStorage.setItem('mouseTrack', JSON.stringify(mouseTrack));
    }


    document.addEventListener('mousemove', throttle(handleMousemove, 50));

    document.addEventListener('click', (event) => {

      if(mouseAndClickRecord) {
        addMouseCLick(event.x, event.y, 'click', event.path[0].id)
      }
    });

    let recordBreak;


    function download(content, fileName, contentType) {
      let a = document.createElement("a");
      let file = new Blob([content], {type: contentType});
      a.href = URL.createObjectURL(file);
      a.download = fileName;
      a.click();
    }


    let enableDraggableSettings = true
    let mouseAndClickRecord = false


    $(document).on('keypress', function(key) {
      console.log(key)
      if (key.which === 114) { //when click "r" for Record
        mouseAndClickRecord = !mouseAndClickRecord

        if(mouseAndClickRecord){
          addMouseCLick(0, 0,'recordBreak','recordStart')

          $('#recordIcon').show()
        }else{
          addMouseCLick(0, 0,'recordBreak','recordEnd')

          $('#recordIcon').hide()
        }
      }
      if (key.which === 109) { //when click "m" for change modus drag/drop to click
        enableDraggableSettings = !enableDraggableSettings
        if(enableDraggableSettings){
          $('.draggable').draggable( 'enable' )
          $('#map-select').collapse('hide');
        }else{
          $('.draggable').draggable( 'disable' )
        }
      }

      if (key.which === 112) { //when click "p" for Break
        addMouseCLick('', '','recordBreak','recordBreak')
      }

      if (key.which === 115) { //when click "s" for Break
        download(sessionStorage.getItem('mouseTrack'), 'result.txt', 'text/plain');
      }

      if (key.which === 100) { //when click "d" for delete sessionStorage
        sessionStorage.removeItem('mouseTrack')
      }



        if (key.which === 13){ //when click "Enter"
          console.log(primary_map)
      }


    });



    let acc = document.getElementsByClassName("accordion"),
     i;

    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function() {
        //this.classList.toggle("active");
        let panel = this.nextElementSibling;
        if (panel.style.display === "block") {
          $(".panel").hide()
          panel.style.display = "none";
        } else {
          $(".panel").hide()
          panel.style.display = "block";
        }
      });
    }


  }

}

export default App;
