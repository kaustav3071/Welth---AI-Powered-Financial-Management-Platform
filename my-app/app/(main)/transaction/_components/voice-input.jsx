"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { processVoiceInput } from "@/actions/transaction";

export function VoiceInput({ onVoiceComplete }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const recognitionRef = useRef(null);

  const {
    loading: isProcessing,
    fn: processVoiceFn,
    data: voiceData,
    error: voiceError,
  } = useFetch(processVoiceInput);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          setIsSupported(true);
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = false;
          recognitionRef.current.lang = 'en-US';
          recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setTranscript(transcript);
          // Don't auto-process, wait for user to stop
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          
          let errorMessage = "Voice recognition error";
          let showError = true;
          
          switch (event.error) {
            case 'network':
              errorMessage = "Voice service requires internet connection. Please check your connection and try again.";
              break;
            case 'not-allowed':
              errorMessage = "Microphone access denied. Please allow microphone access in your browser settings.";
              break;
            case 'no-speech':
              errorMessage = "No speech detected. Please speak clearly and try again.";
              showError = false; // Don't show error for no speech, just stop listening
              break;
            case 'audio-capture':
              errorMessage = "Microphone not found. Please check your microphone is connected.";
              break;
            case 'service-not-allowed':
              errorMessage = "Voice service not available. Please try again later.";
              break;
            case 'aborted':
              showError = false; // Don't show error for manual stop
              break;
            default:
              errorMessage = `Voice recognition error: ${event.error}`;
          }
          
          if (showError) {
            toast.error(errorMessage);
          }
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
        } catch (error) {
          console.error('Error initializing speech recognition:', error);
          setIsSupported(false);
        }
      } else {
        setIsSupported(false);
      }
    }
  }, []);

  useEffect(() => {
    if (voiceData && !isProcessing) {
      onVoiceComplete(voiceData);
      toast.success("Voice input processed successfully!");
      closeModal(); // Close modal after successful processing
    }
  }, [voiceData, isProcessing]);

  useEffect(() => {
    if (voiceError && !isProcessing) {
      toast.error(voiceError.message || "Failed to process voice input");
    }
  }, [voiceError, isProcessing]);

  const openModal = () => {
    setIsModalOpen(true);
    setTranscript("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsListening(false);
    setTranscript("");
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      // Check internet connection
      if (!navigator.onLine) {
        toast.error("No internet connection. Voice recognition requires internet access.");
        return;
      }
      
      setIsListening(true);
      setTranscript("");
      
      // Add a small delay to ensure proper initialization
      setTimeout(() => {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Error starting speech recognition:', error);
          toast.error("Voice recognition service unavailable. Please try the text input instead.");
          setIsListening(false);
        }
      }, 100);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const processTranscript = () => {
    if (transcript.trim()) {
      processVoiceFn(transcript);
    }
  };

  if (!isSupported) {
    return null; // Don't show anything if not supported
  }

  return (
    <>
      {/* Floating Voice Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          type="button"
          size="icon"
          className="w-14 h-14 rounded-full shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 text-white hover:scale-110"
          onClick={openModal}
          title="Voice input"
        >
          <Mic className="h-6 w-6" />
        </Button>
      </div>

      {/* Voice Input Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-blue-500" />
              Voice Transaction Input
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Status Display */}
            <div className="text-center">
              {isListening ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                    <Mic className="h-8 w-8 text-red-500" />
                  </div>
                  <p className="text-sm text-gray-600">Listening... Speak your transaction details</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <Volume2 className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-600">Click the microphone to start listening</p>
                </div>
              )}
            </div>

            {/* Transcript Display */}
            {transcript && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>You said:</strong> {transcript}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              {!isListening ? (
                <Button
                  onClick={startListening}
                  disabled={isProcessing}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Start Listening
                </Button>
              ) : (
                <Button
                  onClick={stopListening}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <MicOff className="h-4 w-4 mr-2" />
                  Stop Listening
                </Button>
              )}

              {transcript && !isListening && (
                <Button
                  onClick={processTranscript}
                  disabled={isProcessing}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 mr-2" />
                      Process & Fill
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Internet Connection Note */}
            <div className="text-xs text-orange-600 text-center">
              Voice recognition requires internet connection
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
