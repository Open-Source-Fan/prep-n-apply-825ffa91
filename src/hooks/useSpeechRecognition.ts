import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionType = typeof window extends { SpeechRecognition: infer T } ? T : unknown;

const FILLERS = ["um", "uh", "like", "you know", "so", "actually", "basically", "literally"];

export function useSpeechRecognition() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [fillerCount, setFillerCount] = useState(0);
  const [wpm, setWpm] = useState(0);
  const recRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const baseRef = useRef<string>("");

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      setSupported(true);
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.onresult = (e: any) => {
        let interim = "";
        let final = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) final += t + " ";
          else interim += t;
        }
        const full = (baseRef.current + final + interim).trim();
        setTranscript(full);
        // filler detection
        const lower = full.toLowerCase();
        let count = 0;
        for (const f of FILLERS) {
          const matches = lower.match(new RegExp(`\\b${f}\\b`, "g"));
          if (matches) count += matches.length;
        }
        setFillerCount(count);
        // wpm
        const words = full.split(/\s+/).filter(Boolean).length;
        const mins = (Date.now() - startTimeRef.current) / 60000;
        if (mins > 0.05) setWpm(Math.round(words / mins));
        if (final) baseRef.current += final;
      };
      rec.onend = () => setListening(false);
      recRef.current = rec;
    }
  }, []);

  const start = useCallback(() => {
    if (!recRef.current) return;
    baseRef.current = transcript ? transcript + " " : "";
    startTimeRef.current = Date.now();
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      /* already started */
    }
  }, [transcript]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    baseRef.current = "";
    setTranscript("");
    setFillerCount(0);
    setWpm(0);
  }, []);

  return { supported, listening, transcript, setTranscript, fillerCount, wpm, start, stop, reset };
}
