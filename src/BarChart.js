import { useState,useEffect, useRef } from 'react';
import * as d3 from 'd3';

function BarChart () {
  function quarter(x) {
    if(x === 1)return 1
    else if(x === 4)return 2
    else if(x === 7)return 3
    else return 4
  } 


  const [data, setData] = useState(0);
  const svgRef = useRef();
  const initialMount = useRef(true);
  useEffect(() => {
    const getData = async () => {
      const response = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json')
      const info = await response.json();
      if(response.ok){
        console.log(' i fire once')
        setData(info.data);
      }
    }
    getData();
  }, [])

  useEffect(() => {
    if(initialMount.current){
      initialMount.current = false;
    } else {
    const dates = []
    for(let i = 0; i < data.length; i++){
      dates.push(data[i][0])
    }
    const formatDate = d3.timeParse("%Y-%m-%d")
    const domain = d3.extent([new Date(), formatDate('2025-05-11')]);
    // setting up the svg
    const w = 1200
    const h = 700
    const svg = d3.select(svgRef.current)
    .attr('width', w)
    .attr('height', h)
    .style('background', '#d3d3d3')
    .style('margin', '100')
    .style('overflow', 'visible') 
    // setting up the scaling
    const xScale = d3.scaleTime()
    .domain([formatDate(dates[0]),formatDate('2017-01-01')])
    .range([5, w-5]);
    const yScale = d3.scaleLinear()
    .domain([0, 20000])
    .range([h, 0]);
    // setting the axis
    const xAxis = d3.axisBottom(xScale)
    .ticks(15)
    .tickFormat((x) =>{
      const formatYear = d3.timeFormat("%Y")
      return formatYear(x);
    })
    const yAxis = d3.axisLeft(yScale)
    .ticks(10)
    svg.append('g')
      .call(xAxis)
      .attr('id','x-axis')
      .attr('transform', `translate(0, ${h + 5})`);
    svg.append('g')
      .call(yAxis)
      .attr('id','y-axis')
      .attr('transform', `translate(-5, 0)`);

    // setting up the data
    svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr("x", (d, i) => xScale(formatDate(d[0])))
    .attr("y", (d, i) => yScale(d[1]))
    .attr('width', 4.2)
    .attr('fill','navy')
    .attr('data-gdp', (d, i) => d[1])
    .attr('data-date', (d, i) => d[0])
    .attr('data-year', (d , i) => d[0].slice(0,4))
    .attr('data-quarter', (d, i) => quarter(parseInt(d[0].slice(5,7))))
    .attr('height', (d,i) => {
      return h - yScale(d[1])})
     .style('background', '#d9d9d9')
     
     const tooltip = d3.select('.container')
     .append('div')
     .attr('id','tooltip')
     .style('visibilty', 'hidden')
     .style('position', 'absolute')

    d3.selectAll('.bar')
    .on('mouseover.visible', function(){
      return tooltip.style('visibility', 'visible')})
    .on('mouseover.text', function(event){
      const e = event.target
      tooltip.text(e.dataset.year + ' Q' + e.dataset.quarter + ' ' + e.dataset.gdp + 'B')
      tooltip.attr('data-date', e.dataset.date)
    })
    .on('mousemove', function(event){
      return tooltip.style('top', ( event.clientY-100 )+ 'px').style('left', (event.pageX-100) + 'px')
    })
    .on('mouseout', function(){
      return tooltip.style('visibility', 'hidden')
    })
    // adding the tooltip
}},[data])


  return(
    <>
    <h2 id="title">United States Quarter GDP</h2>
    <div className='container'>
      <svg ref={svgRef}></svg>
    </div>
    </>
  )
}

export default BarChart