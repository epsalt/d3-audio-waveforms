import React, { useEffect, useRef, useState } from "react";
import Palette from "./components/Palette";
import SaveSVG from "./components/SaveSVG";
import Waveform from "./components/Waveform";
import WaveformData from "waveform-data";

const App = () => {
  const [barWidth, setBarWidth] = useState(0.2);
  const [barSpacing, setBarSpacing] = useState(0.5);
  const [colors, setColors] = useState([
    "#fc9272",
    "#fb6a4a",
    "#ef3b2c",
    "#cb181d",
    "#99000d",
  ]);
  const [selectedFile, setSelectedFile] = useState();
  const [audioData, setAudioData] = useState();
  const [error, setError] = useState();
  const ref = useRef(null);

  useEffect(() => {
    loadAudio();
  }, [selectedFile]);

  const loadAudio = async () => {
    const audio = selectedFile ? selectedFile : await fetch("data/chirp.mp3");
    const buffer = await audio.arrayBuffer();

    const options = {
      audio_context: new AudioContext(),
      array_buffer: buffer,
      scale: 1,
    };

    WaveformData.createFromAudio(options, (err, waveform) => {
      if (err) {
        setError("Could not read audio file");
        setAudioData(null);
        return;
      }
      setError(null);
      setAudioData(waveform);
    });
  };

  const fileChangeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  return (
    <div>
      <input type="file" name="file" onChange={fileChangeHandler} />
      <div>
        <input
          name="width"
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={barWidth}
          onChange={(event) => setBarWidth(parseFloat(event.target.value))}
        />
        <label htmlFor="width">Bar Width</label>
      </div>
      <div>
        <input
          name="spacing"
          type="range"
          min="-0.2"
          max="0.9"
          step="0.1"
          value={barSpacing}
          onChange={(event) => setBarSpacing(parseFloat(event.target.value))}
        />
        <label htmlFor="spacing">Bar Spacing</label>
      </div>
      <div>
        <Palette colors={colors} setColors={setColors} />
      </div>
      {error ? (
        <p>{error}</p>
      ) : (
        <div>
          <div>
            <Waveform
              audioData={audioData}
              barSpacing={barSpacing}
              barWidth={barWidth}
              colors={colors}
              svgRef={ref}
            />
          </div>
          <div>
            <SaveSVG label="Save SVG" name="waveform" svgRef={ref} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
