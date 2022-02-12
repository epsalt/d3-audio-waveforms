import { max } from "d3-array";
import { select } from "d3-selection";
import { scaleLinear, scaleRadial, scaleSequential } from "d3-scale";
import { arc } from "d3-shape";
import { interpolateRgb, piecewise } from "d3-interpolate";
import React, { useEffect } from "react";

const RadialWaveform = ({ audioData, chartOpts, svgRef }) => {
  useEffect(() => {
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    if (!audioData) {
      return;
    }

    const waveform = audioData.resample({ width: 512 * chartOpts.barWidth });
    const channel = waveform.channel(0);
    const minChannel = channel.min_array();
    const maxChannel = channel.max_array();
    const amplitude = maxChannel.map((d, i) => Math.max(d - minChannel[i], 1));

    const width = 500;
    const height = 500;

    const outerRadius = Math.min(width, height) / 2;
    const innerRadius = outerRadius * chartOpts.radius;

    const step = (Math.PI * 2) / amplitude.length;
    const padding = step * chartOpts.barSpacing;

    const x = scaleLinear()
      .domain([0, amplitude.length])
      .range([0, 2 * Math.PI]);

    const y = scaleRadial()
      .domain([0, max(amplitude)])
      .range([innerRadius, outerRadius]);

    const interpolate = piecewise(interpolateRgb.gamma(2.2), chartOpts.colors);

    const vcolor = scaleSequential()
      .domain([0, max(amplitude)])
      .interpolator(interpolate);

    const hcolor = scaleSequential()
      .domain([0, amplitude.length])
      .interpolator(interpolate);

    svg.attr("width", width).attr("height", height);

    const arcPath = arc()
      .innerRadius(innerRadius)
      .outerRadius((d) => y(d))
      .startAngle((_, i) => x(i))
      .endAngle((_, i) => x(i) + step)
      .padAngle(padding)
      .padRadius(innerRadius)
      .cornerRadius((d) => y(d) * step * chartOpts.barRounding);

    svg
      .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
      .attr("transform", "rotate(" + chartOpts.rotate + ")")
      .append("g")
      .attr("stroke", "none")
      .selectAll("path")
      .data(amplitude)
      .join("path")
      .attr("d", arcPath)
      .attr("fill", (d, i) =>
        chartOpts.colorType === "vt" ? vcolor(d) : hcolor(i)
      );
  }, [audioData, chartOpts]);

  return <svg ref={svgRef} />;
};

export default RadialWaveform;
