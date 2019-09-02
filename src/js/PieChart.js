import * as d3 from 'd3';
import { allInstances } from './Map';

const color = d3
  .scaleOrdinal()
  //.domain(['a', 'b', 'c', 'd', 'e', 'f'])
  .range(d3.schemeDark2);

class PieChart {
  constructor(name) {
    this.name = name;
    this.data1 = {
      Wahlbeteiligung: 'Wahlbeteiligung',
      Ungueltige_Stimmen: 'Ungültige_Stimmen',
      Gueltige_Stimmen: 'Gültige_Stimmen',
      Gewinner: 'Gewinner'
    };

    (this.widthPie = 350),
      (this.heightPie = 280),
      (this.marginPie = 10),
      (this.radiusPie =
        Math.min(this.widthPie, this.heightPie) / 2 - this.marginPie);

    this.pieAddListener(this.getActivInstance());

    /**
     .call(
     d3
     .zoom()
     .scaleExtent([1, 15])
     .on('zoom', zoom)
     );

     function zoom() {
  svg.attr('transform', d3.event.transform);
}
     **/
  }

  // A function that create / update the plot for a given variable:
  _updatePipe(data) {
    console.log('_updatePipe');

    if (!$(`#${this.name}_myPieChart`).length) {
      console.log('PIEISNULL');

      this.svg = d3
        .select(`#${this.name}_pieChart`)
        .append('div')
        .attr('id', `${this.name}_myPieChart`)
        .append('svg')
        //.attr('id', `${this.name}_pieChart`)
        .attr('class', this.name)
        .attr('width', this.widthPie)
        .attr('height', this.heightPie)
        .append('g')
        .attr(
          'transform',
          `translate(${this.widthPie / 2},${this.heightPie / 2})`
        );

      $(`#${this.name}_myPieChart`).append(
        `<p id='${this.name}_infoPieChart' class='${this.name} infoPieChart'></p>`
      );
    } else {
      console.log('PIEISNOTNULL');
    }

    // Compute the position of each group on the pie:
    const pie = d3.pie().value(function(d) {
      return d.value;
    });
    const pie2 = d3.pie().value(function(d) {
      return 45;
    });
    const data_ready = pie(d3.entries(data));
    const data_ready2 = pie2(d3.entries(this.data1));

    // map to data
    const u = this.svg
      .selectAll('path.outer')
      .data(data_ready)
      .on('mouseover', this._handleMouseOver)
      .on('mouseout', this._handleMouseOut)
      .on('click', this._handleMouseOnClick);

    const o = this.svg
      .selectAll('path.middle')
      .data(data_ready2)
      .on('mouseover', this._handleMouseOver)
      .on('mouseout', this._handleMouseOut)
      .on('click', this._handleMouseOnClick);

    o.enter()
      .append('path')
      .merge(o)
      .transition()
      .attr(
        'd',
        d3
          .arc()
          .innerRadius(0)
          .outerRadius(40)
      )
      .attr('class', 'middle')
      .attr('parentPie', this.name)
      .attr('fill', function(d) {
        return color(d.data.key);
      })
      .attr('name', function(d) {
        return d.data.key;
      })
      .attr('data', JSON.stringify(data))
      .attr('stroke', 'white')
      .style('stroke-width', '0px')
      .style('opacity', 1);

    // shape helper to build arcs:
    const arcGenerator = d3
      .arc()
      .innerRadius(0)
      .outerRadius(this.radiusPie);

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    u.enter()
      .append('path')
      .merge(u)
      .transition()
      .duration(500)
      .attr(
        'd',
        d3
          .arc()
          .innerRadius(55)
          .outerRadius(this.radiusPie)
      )
      .attr('class', 'outer')
      .attr('parentPie', this.name)
      .attr('fill', function(d) {
        return color(d.data.key);
      })
      .attr('name', function(d) {
        return d.data.key;
      })
      .attr('stroke', 'white')
      .style('stroke-width', '0px')
      .style('opacity', 1);

    /**
     //show lable from path
     // Now add the annotation. Use the centroid method to get the best coordinates
     u //.selectAll('mySlices')
     //.data(data_ready)
     .enter()
     .append('text')
     .text(function(d) {
        console.log(d);

        return `grp ${d.data.key}`;
      })
     .attr('transform', function(d) {
        return `translate(${arcGenerator.centroid(d)})`;
      })
     .style('text-anchor', 'middle')
     .style('font-size', 17);

     // remove the group that is not present anymore
     **/

    u.exit().remove();
    o.exit().remove();
  }

  _handleMouseOver(d, i) {
    const parentPie = $(this).attr('parentPie');

    /**
     // show text when hover over:
     const arcGenerator = d3
     .arc()
     .innerRadius(0)
     .outerRadius(radius);

     // Use D3 to select element, change this.color and size
     d3.select(this)
     .style('fill', 'yellow') //d3.select(this).attr('stroke'))
     .attr('opacity', 0.3);

     // Specify where to put label of text
     d3.select(this.parentNode)
     .append('text')
     .text(function() {
        d3.select(this);

        return `${d.data.key} : ${d.data.value}`;
      })
     .attr('transform', function() {
        d3.select(this);

        return `translate(${arcGenerator.centroid(d)})`;
      })
     .style('text-anchor', 'middle')
     .style('font-size', 17);
     **/
    let myString;
    if (typeof d.data.value === 'string') {
      console.log('data is string');
      myString = `<p><strong>${d.data.key}</strong></p>`;
    } else {
      myString = `<p><strong>${d.data.key} : ${d.data.value}%</strong></p>`;
    }

    //$("#mapPie_infoPieChart").html(myString);
    $(`#${parentPie}_infoPieChart`).html(myString);
  }

  _handleMouseOut(d, i) {
    /**
     // Use D3 to select element, change this.color back to normal
     d3.select(this)
     .style('fill', d3.select(this).attr('fill'))
     .attr('opacity', 1);

     d3.select(this.parentNode)
     .selectAll('text')
     .remove();
     **/
    const parentPie = $(this).attr('parentPie');
    $(`#${parentPie}_infoPieChart`).html('');
  }

  _handleMouseOnClick(d, i) {
    // console.log(d.data.key);
    // console.log(this.parentNode.parentNode.parentNode);
    //this('#map').updateData(d.data.key);
    //KreiseNRW.features.map.updateData(d.data.key);
  }

  getActivInstance() {
    let id;

    if (allInstances[0].pieName === this.name) {
      id = 0;
    } else {
      id = 1;
    }

    return id;
  }

  /**
   * set EventListener to the new LegendElements
   * @param id is the ID from the current Map
   */
  pieAddListener(id) {
    console.log('pieAddListener');
    console.log(this.name);

    document
      .getElementById(`${this.name}_pieChart`)
      .addEventListener('click', e => {
        const target = $(e.target);
        const dataKey = e.path[0].attributes[4].value;
        let data;
        if (target.hasClass('middle') && dataKey === 'Gewinner') {
          data = true;

          /*
          $(`#${allInstances[id].legendName}_legend`).hide();
*/
        } else {
          /*
          $(`#${allInstances[id].legendName}_legend`).show();
*/
          allInstances[id].statistics_state.enabled = false;
          allInstances[id].legende.legendDiscreteHide()
          allInstances[id].legende.legendeShow();
          data = false;
        }
        allInstances[id].legende.year = dataKey;
        allInstances[id].updateData(dataKey, data);

        try {
          allInstances[id].statistics_state.type = 'STANDARD'
          // eslint-disable-next-line no-empty
        } catch (error) {}
      });


  }


}

export default PieChart;
