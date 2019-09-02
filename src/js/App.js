import Map from './Map.js';
import Listeners from './Listeners.js';
import syncMove from '@mapbox/mapbox-gl-sync-move';
import MapboxCompare from 'mapbox-gl-compare';
import 'mapbox-gl-compare/dist/mapbox-gl-compare.css';
export let primary_map
export let secondary_map
export let dualView = false;
export let splitView = false;
export let duoLegend = false;
import { allInstances } from "./Map";

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
          listeners.setActiveMap(primary_map);
          try{
            $(`#${ui.draggable[0].id}`).click();
            $(`#${ui.draggable[0].id}`).click();
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
      $('#legendMapOption').show();

      $('.split_mapLegend,.split_mapPie').remove();
      if (!this.dualView && $('#mode-dual').is(':checked')) {


        if (this.splitView) {
          allInstances.pop();
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
            listeners.setActiveMap(secondary_map);
            $(`#${ui.draggable[0].id}`).click();
            $(`#${ui.draggable[0].id}`).click();
          }
        });

        this.dualView = true;
      }
    });

    // split mode triggered
    $('#mode-split').on('change', () => {
      $('#legendMapOption').show();
      $('.dual_mapLegend, .dual_mapPie').remove();

      if (!this.splitView && $('#mode-split').is(':checked')) {
        if (this.dualView) {
          allInstances.pop()

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
            $(`#${ui.draggable[0].id}`).click();
          }
        });

        listeners.setActiveMap(primary_map);

        this.splitView = true;
      }
    });

    // standard mode triggered
    $('#mode-standard').on('change', () => {
      $('#legendMapOption').hide();

      $('.dual_mapLegend, .split_mapLegend, .dual_mapPie, .split_mapPie').remove();

      if ($('#mode-standard').is(':checked')) {
        if (this.dualView) {
          allInstances.pop();

          $('.webgis-view-split').remove();
          $('.webgis-view, #map').css('width', '100vw');
          this.dualView = false;
          $('#map').droppable({ disabled: false });
        }
        if (this.splitView) {
          allInstances.pop()

          $('#split_map').remove();
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

      mouseTrack.clickX.push(x,);
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

    $('#legend-duo').click(function() {
      if(!duoLegend){
        console.log('legend-duo')

        allInstances[0].legende.mapLegendeHide();
        allInstances[0].legende.mapLegendeInfoDataClear();
        allInstances[0].legende.mapLegendeShow();

        allInstances[1].legende.mapLegendeHide();
        allInstances[1].legende.mapLegendeInfoDataClear();
        allInstances[1].legende.mapLegendeShow();


      duoLegend=true;

      $(".legend-wrapper").addClass('legend-standard');
        $(`#${allInstances[0].pieName}_myPieChart`).remove()
      $("body").append($(".legend-wrapper").clone(false).addClass('legend-center').removeClass('legend-standard'));


      $( ".legend-center" )
        .filter(function( index ) {
          return $( ".legend", this ).addClass('center')
        }).filter(function( index ) {
          return $( ".legendArrowToggle", this ).attr('data-target','.center').attr('id','legend_collapse_center')
        }).filter(function( index ) {
          return $( ".moreArrowToggle", this ).attr('data-target','.mapSettings_center').attr('id','more_collapse_center')
        }).filter(function( index ) {
          return $( ".arrowToggle", this ).addClass('more_collapse_center')
        }).filter(function( index ) {
          return $( ".arrowToggle", this ).removeClass('arrowToggle')
        }).filter(function( index ) {
          return $( ".mapSettings", this ).addClass('mapSettings_center')
        }).filter(function( index ) {
          return $( ".dual_mapLegend", this ).remove()
        }).filter(function( index ) {
          return $( ".split_mapLegend", this ).remove()
        }).filter(function( index ) {
          return $( ".dual_mapPie", this ).remove()
        }).filter(function( index ) {
          return $( ".split_mapPie", this ).remove()
        })

      $( ".legend-standard" )
        .filter(function( index ) {
          return $( ".legend", this ).addClass('standard')
        }).filter(function( index ) {
          return $( ".legendArrowToggle", this ).attr('data-target','.standard')
        }).filter(function( index ) {
        return $( ".moreArrowToggle", this ).attr('data-target','.mapSettings_standard')
      }).filter(function( index ) {
        return $( ".mapSettings", this ).addClass('mapSettings_standard')
      }).filter(function( index ) {
        return $( ".mapLegend", this ).remove()
      }).filter(function( index ) {
        return $( ".mapPie", this ).remove()
      })


        allInstances[0].legende.legendAddListener(0)
        allInstances[1].legende.legendAddListener(1)
        try {
          allInstances[0].pieChart.pieAddListener(0)
          allInstances[0]._addEventListener()

        }catch(error){
        console.log(error)
        }

      }




    })
    $('#legend-standard').click(function() {
      if(duoLegend) {
        console.log('legend-standard')
        $(`#${allInstances[0].pieName}_myPieChart`).remove()


        duoLegend = false;
        //$(".center").append($(".standard").clone(true));
        $("#data-info").append($("#mapLegend_data-info").clone(true));
        $("#legend-heading").append($("#mapLegend_legend-heading").clone(true));
        $("#timeslider").append($("#mapLegend_timeslider").clone(true));
        $("#legend-scale-bar").append($("#mapLegend_legend").clone(true));
        $("#legend-scale-bar").append($("#mapLegend_discrete-legend").clone(true));
        $("#map_data_option").append($("#mapLegend_map_data_option").clone(true));
        //$("#legend-pie-chart").append($("#mapPie_pieChart").clone(true));

        $('.legend-center').remove();
        $( ".legend-standard" )
          .filter(function( index ) {
            return $( ".legend", this ).removeClass('standard')
          }).filter(function( index ) {
          return $("i", this).attr('data-target', '.legend')
        }).filter(function( index ) {
          return $( ".mapSettings", this ).removeClass('mapSettings_standard')
        }).filter(function( index ) {
          return $( ".moreArrowToggle", this ).attr('data-target','.mapSettings').attr('id','more_collapse')
        }).removeClass('legend-standard');

        allInstances[1].legende.mapLegendeHide();
        allInstances[0].legende.mapLegendeShow();

        allInstances[0].legende.mapLegendeInfoDataClear();
        allInstances[1].legende.mapLegendeInfoDataClear();

        allInstances[1].legende.legendAddListener(1);
        allInstances[0].legende.legendAddListener(0);

        allInstances[1]._addEventListener();
        allInstances[0]._addEventListener();

      }
    })


    let enableDraggableSettings = true;
    let mouseAndClickRecord = false;


    $(document).on('keypress', function(key) {
      console.log(key);
      if (key.which === 114) { //when click "r" for Record
        console.log('Record');
        mouseAndClickRecord = !mouseAndClickRecord;

        if(mouseAndClickRecord){
          addMouseCLick(0, 0,'recordBreak','recordStart');

          $('#recordIcon').html('fiber_manual_record');//.show()
        }else{
          addMouseCLick(0, 0,'recordBreak','recordEnd');

          $('#recordIcon').html('');//hide()
        }
      }
      if (key.which === 109) { //when click "m" for change modus drag/drop to click
        enableDraggableSettings = !enableDraggableSettings;
        if(enableDraggableSettings){
          $('.draggable').draggable( 'enable' );
          $('#map-select').collapse('hide');
        }else{
          $('.draggable').draggable( 'disable' );
        }
      }

      if (key.which === 112) { //when click "p" for Break
        addMouseCLick('', '','recordBreak','recordBreak');

        $('#recordIcon').html('pause_circle_outline');//.show()
        setTimeout(function(){
          $('#recordIcon').html('fiber_manual_record');//.show()
        },1000)

      }

      if (key.which === 115) { //when click "s" for Break
        let string = Date.now() + '_result.txt';
        download(sessionStorage.getItem('mouseTrack'), string, 'text/plain');
        if(mouseAndClickRecord){
          mouseAndClickRecord = !mouseAndClickRecord;
        }

        $('#recordIcon').html('file_download');//.show()
        setTimeout(function(){
          $('#recordIcon').html('');//.show()

        },3000)
      }

      if (key.which === 100) { //when click "d" for delete sessionStorage
        sessionStorage.removeItem('mouseTrack');

        $('#recordIcon').html('delete_forever');//.show()
        setTimeout(function(){
          $('#recordIcon').html('');//.show()

        },3000)

      }



        if (key.which === 13){ //when click "Enter"
          console.log(primary_map);
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
