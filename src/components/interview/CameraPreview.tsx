import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";

export function CameraPreview({ compact = false }: { compact?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [on, setOn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setOn(false);
  };

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setOn(true);
      setError(null);
    } catch {
      setError("Camera access denied");
    }
  };

  useEffect(() => () => stop(), []);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold">Camera preview</span>
        <Button size="sm" variant={on ? "secondary" : "outline"} onClick={on ? stop : start}>
          {on ? <CameraOff className="size-4" /> : <Camera className="size-4" />}
          {on ? "Off" : "On"}
        </Button>
      </div>
      <div className={`relative overflow-hidden rounded-xl bg-black/40 ${compact ? "aspect-video" : "aspect-video"}`}>
        <video ref={videoRef} autoPlay muted playsInline className="size-full object-cover" />
        {!on && (
          <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
            {error ?? "Camera is off"}
          </div>
        )}
      </div>
      {on && <p className="mt-2 text-xs text-muted-foreground">Practice eye contact and posture — look into the camera.</p>}
    </div>
  );
}
