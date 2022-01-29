import { min, max } from "d3-array";
import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import React, { useEffect, useRef } from "react";

const Waveform = ({ audioData, barSpacing, barWidth }) => {
  const ref = useRef();

  useEffect(() => {
    const svg = select(ref.current);
    svg.selectAll("*").remove();

    if (!audioData) {
      return;
    }

    const waveform = audioData.resample({ width: 512 * (1 - barWidth) });
    const channel = waveform.channel(0);
    const minChannel = channel.min_array();
    const maxChannel = channel.max_array();

    const width = 500;
    const height = 500;

    const step = width / maxChannel.length;
    const padding = step * barSpacing;
    const bandwidth = step - padding;

    const x = scaleLinear().domain([0, waveform.length]).range([0, width]);

    const y = scaleLinear()
      .domain([min(minChannel), max(maxChannel)])
      .range([height / 2, -height / 2]);

    svg.attr("width", width).attr("height", height);

    svg
      .append("g")
      .attr("transform", () => `translate(0, ${height / 2})`)
      .attr("fill", "blue")
      .attr("stroke", "none")
      .selectAll("rect")
      .data(maxChannel)
      .join("rect")
      .attr("x", (_, i) => x(i))
      .attr("y", (_, i) => y(maxChannel[i]))
      .attr("height", (d, i) => Math.max(y(minChannel[i]) - y(d), y(0) - y(1)))
      .attr("width", bandwidth);
  }, [audioData, barSpacing, barWidth]);

  return <svg ref={ref} />;
};

export default Waveform;
