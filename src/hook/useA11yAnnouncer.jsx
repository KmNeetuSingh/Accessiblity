import { useState, useRef, useEffect } from "react";

export const useA11yAnnouncer = () => {
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("polite");

  const timeoutRef = useRef(null);
  const delayTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);

  const createBeep = (frequency = 800, duration = 200, volume = 0.1) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);

      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };

      console.log("🔊 Beep played:", frequency + "Hz");
    } catch (error) {
      console.log("🔇 Audio beep failed:", error.message);
    }
  };

  const speakMessage = (text, isError = false) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.2;
      utterance.pitch = isError ? 0.8 : 1;
      utterance.volume = 0.7;

      console.log("🗣️ Speaking:", text);
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current);
    };
  }, []);

  const announce = (text, options = {}) => {
    const {
      mode = "polite",
      timeout = 3000,
      vibrate = true,
      playSound = true,
      enableSpeech = false,
      beepProfile = {},
    } = options;

    const { frequency = 800, duration = 200, volume = 0.1 } = beepProfile;

    console.log("🔊 Announcing:", text);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current);

    setMessage("");
    setPriority(mode);

    delayTimeoutRef.current = setTimeout(() => {
      setMessage(text);

      if (playSound) {
        createBeep(frequency, duration, volume);
      }

      if (enableSpeech) {
        speakMessage(text, mode === "assertive");
      }

      if (vibrate && navigator.vibrate) {
        if (mode === "assertive") {
          navigator.vibrate([100, 50, 100]);
        } else {
          navigator.vibrate(200);
        }
        console.log("📳 Vibrated");
      }

      console.log("📢 Screen reader should announce:", text);
    }, 100);

    timeoutRef.current = setTimeout(() => {
      setMessage("");
    }, timeout);
  };

  const Announcer = () => (
    <>
      {/* Debug panel (remove/comment out in production) */}
      <div
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: 8,
          fontSize: 11,
          borderRadius: 4,
          zIndex: 9999,
          fontFamily: "monospace",
          maxWidth: 200,
        }}
      >
        <div><strong>A11y Debug</strong></div>
        <div>Message: "{message}"</div>
        <div>Priority: {priority}</div>
        <div>Audio: {audioContextRef.current?.state || "not-initialized"}</div>
        <div>Speech: {"speechSynthesis" in window ? "available" : "unavailable"}</div>
      </div>

      {/* Screen reader live region */}
      <div
        role="status"
        aria-live={priority}
        aria-atomic="true"
        style={{
          position: "absolute",
          left: "-9999px",
          whiteSpace: "nowrap",
          height: 0,
          overflow: "hidden",
        }}
      >
        {message}
      </div>
    </>
  );

  return { announce, Announcer };
};
