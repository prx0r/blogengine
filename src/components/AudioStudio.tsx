"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const EDGE_VOICES = [
  { name: "en-US-AriaNeural", gender: "Female", style: "New England" },
  { name: "en-US-JennyNeural", gender: "Female", style: "Midwest" },
  { name: "en-US-GuyNeural", gender: "Male", style: "Neutral" },
  { name: "en-US-DavisNeural", gender: "Male", style: "Warm" },
  { name: "en-US-TonyNeural", gender: "Male", style: "Deep" },
  { name: "en-US-SaraNeural", gender: "Female", style: "Friendly" },
  { name: "en-US-JaneNeural", gender: "Female", style: "Smooth" },
  { name: "en-US-JasonNeural", gender: "Male", style: "Articulate" },
  { name: "en-US-NancyNeural", gender: "Female", style: "Cheerful" },
  { name: "en-US-AmberNeural", gender: "Female", style: "Energetic" },
  { name: "en-US-AnaNeural", gender: "Female", style: "Child" },
  { name: "en-US-AshleyNeural", gender: "Female", style: "Casual" },
  { name: "en-US-BrandonNeural", gender: "Male", style: "Bright" },
  { name: "en-US-ChristopherNeural", gender: "Male", style: "Professional" },
  { name: "en-US-CoraNeural", gender: "Female", style: "Soft" },
  { name: "en-US-ElizabethNeural", gender: "Female", style: "Authoritative" },
  { name: "en-US-EricNeural", gender: "Male", style: "Rational" },
  { name: "en-US-MichelleNeural", gender: "Female", style: "Pleasant" },
  { name: "en-US-RogerNeural", gender: "Male", style: "Mature" },
  { name: "en-US-SteffanNeural", gender: "Male", style: "Narrative" },
  { name: "en-GB-RyanNeural", gender: "Male", style: "British" },
  { name: "en-GB-SoniaNeural", gender: "Female", style: "British" },
  { name: "en-GB-LibbyNeural", gender: "Female", style: "British" },
  { name: "en-GB-MaisieNeural", gender: "Female", style: "British Child" },
  { name: "en-GB-ThomasNeural", gender: "Male", style: "British" },
  { name: "en-AU-NatashaNeural", gender: "Female", style: "Australian" },
  { name: "en-AU-WilliamNeural", gender: "Male", style: "Australian" },
  { name: "en-IN-NeerjaNeural", gender: "Female", style: "Indian" },
  { name: "en-IN-PrabhatNeural", gender: "Male", style: "Indian" },
];

type EffectParams = {
  reverbMix: number;
  reverbDecay: number;
  eqLow: number;
  eqMid: number;
  eqHigh: number;
  delayTime: number;
  delayMix: number;
  gain: number;
};

type Preset = {
  id: string;
  name: string;
  voiceName: string;
  effects: EffectParams;
  createdAt: string;
};

const DEFAULT_EFFECTS: EffectParams = {
  reverbMix: 0.3,
  reverbDecay: 2.0,
  eqLow: 0,
  eqMid: 0,
  eqHigh: 0,
  delayTime: 0.3,
  delayMix: 0,
  gain: 1.0,
};

function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-500 font-mono">{value.toFixed(step < 0.1 ? 2 : 1)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-zinc-800 accent-zinc-400 cursor-pointer" />
    </div>
  );
}

function EffectCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-zinc-800 p-4 bg-zinc-900/50 space-y-3">
      <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

export default function AudioStudio() {
  const [selectedVoice, setSelectedVoice] = useState(EDGE_VOICES[0].name);
  const [text, setText] = useState("The mundus imaginalis is a real order of reality, corresponding to a real mode of perception.");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [showEffects, setShowEffects] = useState(false);
  const [effects, setEffects] = useState<EffectParams>(DEFAULT_EFFECTS);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"voices" | "effects" | "presets">("voices");

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("audio-presets");
    if (saved) {
      try { setPresets(JSON.parse(saved)); } catch {}
    }
  }, []);

  const savePresets = useCallback((p: Preset[]) => {
    setPresets(p);
    localStorage.setItem("audio-presets", JSON.stringify(p));
  }, []);

  const playVoice = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = window.speechSynthesis.getVoices().find(v => v.name === selectedVoice) || null;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlaying(false);
    synthRef.current = utterance;
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  }, [text, selectedVoice]);

  const stopVoice = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const startRecording = useCallback(async () => {
    if (!window.speechSynthesis) return;
    stopVoice();
    setRecordedUrl(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setIsRecording(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = window.speechSynthesis.getVoices().find(v => v.name === selectedVoice) || null;
      utterance.rate = 0.9;
      utterance.onend = () => {
        recorder.stop();
        setIsRecording(false);
      };
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Recording error:", err);
      setIsRecording(false);
    }
  }, [text, selectedVoice, stopVoice]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) audioContextRef.current = new AudioContext();
    return audioContextRef.current;
  }, []);

  const playWithEffects = useCallback(async () => {
    if (!recordedUrl) return;
    const ctx = getAudioContext();
    const response = await fetch(recordedUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    let chain: AudioNode = source;

    if (effects.eqLow !== 0) {
      const lowShelf = ctx.createBiquadFilter();
      lowShelf.type = "lowshelf";
      lowShelf.frequency.value = 200;
      lowShelf.gain.value = effects.eqLow;
      chain.connect(lowShelf);
      chain = lowShelf;
    }

    if (effects.eqMid !== 0) {
      const peaking = ctx.createBiquadFilter();
      peaking.type = "peaking";
      peaking.frequency.value = 2000;
      peaking.Q.value = 1;
      peaking.gain.value = effects.eqMid;
      chain.connect(peaking);
      chain = peaking;
    }

    if (effects.eqHigh !== 0) {
      const highShelf = ctx.createBiquadFilter();
      highShelf.type = "highshelf";
      highShelf.frequency.value = 8000;
      highShelf.gain.value = effects.eqHigh;
      chain.connect(highShelf);
      chain = highShelf;
    }

    if (effects.reverbMix > 0) {
      const convolver = ctx.createConvolver();
      const sampleRate = ctx.sampleRate;
      const length = sampleRate * effects.reverbDecay;
      const impulse = ctx.createBuffer(2, length, sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
      }
      convolver.buffer = impulse;

      const wet = ctx.createGain();
      wet.gain.value = effects.reverbMix;
      const dry = ctx.createGain();
      dry.gain.value = 1 - effects.reverbMix;

      chain.connect(dry);
      chain.connect(convolver);
      convolver.connect(wet);

      const merge = ctx.createGain();
      dry.connect(merge);
      wet.connect(merge);
      chain = merge;
    }

    if (effects.delayMix > 0) {
      const delay = ctx.createDelay(2);
      delay.delayTime.value = effects.delayTime;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.3;
      const delayWet = ctx.createGain();
      delayWet.gain.value = effects.delayMix;

      chain.connect(delayWet);
      delay.connect(feedback);
      feedback.connect(delay);
      delayWet.connect(ctx.destination);

      delayWet.connect(delay);
    }

    const finalGain = ctx.createGain();
    finalGain.gain.value = effects.gain;
    chain.connect(finalGain);
    finalGain.connect(ctx.destination);

    source.start();
  }, [recordedUrl, effects, getAudioContext]);

  const savePreset = useCallback(() => {
    if (!presetName.trim()) return;
    const preset: Preset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      voiceName: selectedVoice,
      effects: { ...effects },
      createdAt: new Date().toISOString(),
    };
    savePresets([...presets, preset]);
    setPresetName("");
    setShowSaveDialog(false);
  }, [presetName, selectedVoice, effects, presets, savePresets]);

  const loadPreset = useCallback((preset: Preset) => {
    setSelectedVoice(preset.voiceName);
    setEffects(preset.effects);
  }, []);

  const deletePreset = useCallback((id: string) => {
    savePresets(presets.filter(p => p.id !== id));
  }, [presets, savePresets]);

  const exportPresets = useCallback(() => {
    const blob = new Blob([JSON.stringify(presets, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audio-presets.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [presets]);

  const importPresets = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const imported = JSON.parse(text);
        if (Array.isArray(imported)) savePresets(imported);
      } catch {}
    };
    input.click();
  }, [savePresets]);

  return (
    <div className="space-y-8">
      <div className="flex gap-1 border-b border-zinc-800">
        {(["voices", "effects", "presets"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors capitalize
              ${activeTab === tab ? "text-zinc-200 border-b-2 border-zinc-400" : "text-zinc-500 hover:text-zinc-300"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "voices" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Test Text</label>
            <textarea value={text} onChange={e => setText(e.target.value)}
              className="w-full h-24 rounded border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-200 resize-none focus:outline-none focus:border-zinc-600" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto pr-2">
            {EDGE_VOICES.map(v => (
              <button key={v.name} onClick={() => setSelectedVoice(v.name)}
                className={`text-left p-3 rounded border text-xs transition-colors
                  ${selectedVoice === v.name
                    ? "border-zinc-400 bg-zinc-800/80 text-zinc-200"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"}`}>
                <div className="font-medium mb-0.5">{v.name.replace("en-US-", "").replace("en-GB-", "").replace("en-AU-", "").replace("en-IN-", "")}</div>
                <div className="text-zinc-600">{v.gender} · {v.style}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={isPlaying ? stopVoice : playVoice}
              className="px-5 py-2 rounded text-sm font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors">
              {isPlaying ? "■ Stop" : "▶ Preview"}
            </button>
            <button onClick={isRecording ? () => {} : startRecording}
              disabled={isRecording}
              className={`px-5 py-2 rounded text-sm font-medium transition-colors
                ${isRecording ? "bg-red-900/50 text-red-400" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"}`}>
              {isRecording ? "● Recording..." : "● Record"}
            </button>
          </div>

          {recordedUrl && (
            <div className="space-y-2">
              <div className="text-xs text-zinc-500">Recorded audio:</div>
              <audio src={recordedUrl} controls className="w-full" />
              {!showEffects && (
                <button onClick={() => setShowEffects(true)}
                  className="text-xs text-zinc-400 hover:text-zinc-200 underline">
                  Apply effects to recording →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "effects" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EffectCard title="Reverb">
              <Slider label="Mix" value={effects.reverbMix} min={0} max={1} step={0.01} onChange={v => setEffects(e => ({ ...e, reverbMix: v }))} />
              <Slider label="Decay" value={effects.reverbDecay} min={0.5} max={5} step={0.1} onChange={v => setEffects(e => ({ ...e, reverbDecay: v }))} />
            </EffectCard>

            <EffectCard title="EQ">
              <Slider label="Low (200 Hz)" value={effects.eqLow} min={-12} max={12} step={0.5} onChange={v => setEffects(e => ({ ...e, eqLow: v }))} />
              <Slider label="Mid (2 kHz)" value={effects.eqMid} min={-12} max={12} step={0.5} onChange={v => setEffects(e => ({ ...e, eqMid: v }))} />
              <Slider label="High (8 kHz)" value={effects.eqHigh} min={-12} max={12} step={0.5} onChange={v => setEffects(e => ({ ...e, eqHigh: v }))} />
            </EffectCard>

            <EffectCard title="Delay">
              <Slider label="Time" value={effects.delayTime} min={0.05} max={1.5} step={0.01} onChange={v => setEffects(e => ({ ...e, delayTime: v }))} />
              <Slider label="Mix" value={effects.delayMix} min={0} max={1} step={0.01} onChange={v => setEffects(e => ({ ...e, delayMix: v }))} />
            </EffectCard>

            <EffectCard title="Output">
              <Slider label="Gain" value={effects.gain} min={0} max={2} step={0.01} onChange={v => setEffects(e => ({ ...e, gain: v }))} />
            </EffectCard>
          </div>

          <div className="text-xs text-zinc-500 space-y-1">
            <p>Effects are applied to the <strong className="text-zinc-400">recorded audio</strong> playback.</p>
            <p>1. Go to the Voices tab, record a phrase, then come here to process it.</p>
            <p>2. Or use the test tone to preview effect settings.</p>
          </div>

          <div className="flex gap-3">
            {recordedUrl && (
              <button onClick={playWithEffects}
                className="px-5 py-2 rounded text-sm font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors">
                ▶ Play with Effects
              </button>
            )}
            <button onClick={() => setEffects(DEFAULT_EFFECTS)}
              className="px-5 py-2 rounded text-sm font-medium border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
              Reset
            </button>
            <button onClick={() => setShowSaveDialog(true)}
              className="px-5 py-2 rounded text-sm font-medium border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
              Save as Preset
            </button>
          </div>

          {showSaveDialog && (
            <div className="rounded border border-zinc-800 p-4 bg-zinc-900/80 space-y-3">
              <input value={presetName} onChange={e => setPresetName(e.target.value)}
                placeholder="Preset name..."
                className="w-full rounded border border-zinc-800 bg-zinc-950 p-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600" />
              <div className="flex gap-2">
                <button onClick={savePreset}
                  className="px-4 py-1.5 rounded text-sm font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors">
                  Save
                </button>
                <button onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-1.5 rounded text-sm font-medium border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "presets" && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <button onClick={exportPresets}
              className="px-4 py-2 rounded text-sm font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors">
              Export Presets
            </button>
            <button onClick={importPresets}
              className="px-4 py-2 rounded text-sm font-medium border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
              Import Presets
            </button>
          </div>

          {presets.length === 0 ? (
            <p className="text-sm text-zinc-500">No saved presets yet. Go to the Effects tab to create one.</p>
          ) : (
            <div className="space-y-2">
              {presets.map(p => (
                <div key={p.id} className="rounded border border-zinc-800 p-4 bg-zinc-900/50 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-zinc-200">{p.name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {p.voiceName} · Reverb: {(p.effects.reverbMix * 100).toFixed(0)}% · Delay: {(p.effects.delayMix * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => loadPreset(p)}
                      className="px-3 py-1 rounded text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">
                      Load
                    </button>
                    <button onClick={() => deletePreset(p.id)}
                      className="px-3 py-1 rounded text-xs font-medium border border-zinc-800 text-zinc-500 hover:text-red-400 transition-colors">
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
