import { useState, useEffect, useRef } from 'react';
import { StatType, Player } from '../state/gameState';
import { parseTranscript, getStatLabel } from '../utils/voiceParser';

interface VoiceInputProps {
  roster: Player[];
  onStatRecorded: (statType: StatType, playerId: string) => void;
  onPlayerSelected: (playerId: string) => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function VoiceInput({ roster, onStatRecorded, onPlayerSelected }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastAction, setLastAction] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      setLastTranscript(transcript);
      parseAndExecute(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [roster]);

  const parseAndExecute = (transcript: string) => {
    const events = parseTranscript(transcript, roster);

    if (events.length === 0) {
      setLastAction('Could not match any events. Try "Number 5 two pointer" or "Vera 2 point, assist by Bri".');
      return;
    }

    const lastPlayerId = events[events.length - 1].playerId;
    onPlayerSelected(lastPlayerId);

    for (const { playerId, statType } of events) {
      onStatRecorded(statType, playerId);
    }

    const summary = events
      .map(
        (e) =>
          `${getStatLabel(e.statType)} for ${roster.find((p) => p.id === e.playerId)?.name ?? '?'}`
      )
      .join(', ');
    setLastAction(`Recorded: ${summary}`);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSupported = !!SpeechRecognition;

  if (!isSupported) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-3">Voice Input</h3>
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-full py-4 rounded-lg font-bold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isListening ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
              Listening... (Click to Stop)
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              Start Voice Input
            </span>
          )}
        </button>
        
        {lastTranscript && (
          <div className="w-full text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <div className="font-medium">Heard: "{lastTranscript}"</div>
          </div>
        )}
        
        {lastAction && (
          <div className="w-full text-sm text-green-700 bg-green-50 p-2 rounded">
            {lastAction}
          </div>
        )}
        
        <div className="w-full text-xs text-gray-500 text-center mt-2">
          <p>Try: "Number 5 two pointer" or "Vera 2 point, assist by Bri"</p>
          <p className="mt-1">Names are fuzzy-matched (e.g. "Ferrah" → Vera).</p>
        </div>
      </div>
    </div>
  );
}
