"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Loader2, Volume2, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { processVoiceInput } from "@/actions/transaction";

const MAX_RETRIES = 2;

export function VoiceInput({ onVoiceComplete }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [textInput, setTextInput] = useState("");
  const recognitionRef = useRef(null);
  const retryCountRef = useRef(0);

  const {
    loading: isProcessing,
    fn: processVoiceFn,
    data: voiceData,
    error: voiceError,
  } = useFetch(processVoiceInput);

  const initRecognition = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        retryCountRef.current = 0; // Reset retry counter on success
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);

        let errorMessage = "Voice recognition error";
        let showError = true;

        switch (event.error) {
          case "network":
            // Auto-retry on transient network errors
            if (retryCountRef.current < MAX_RETRIES) {
              retryCountRef.current += 1;
              console.log(
                `Retrying speech recognition (${retryCountRef.current}/${MAX_RETRIES})...`
              );
              toast.info(
                `Voice service connection issue. Retrying (${retryCountRef.current}/${MAX_RETRIES})...`
              );
              setTimeout(() => {
                try {
                  recognition.start();
                } catch {
                  setIsListening(false);
                  setShowTextFallback(true);
                  toast.error(
                    "Voice service unavailable. Use the text input below instead."
                  );
                }
              }, 500);
              return; // Don't stop listening while retrying
            }
            errorMessage =
              "Voice service couldn't connect to Google's speech servers. This can happen due to network/firewall settings. Use the text input below to type your transaction instead.";
            setShowTextFallback(true);
            break;
          case "not-allowed":
            errorMessage =
              "Microphone access denied. Please allow microphone access in your browser settings.";
            break;
          case "no-speech":
            errorMessage =
              "No speech detected. Please speak clearly and try again.";
            showError = false;
            break;
          case "audio-capture":
            errorMessage =
              "Microphone not found. Please check your microphone is connected.";
            break;
          case "service-not-allowed":
            errorMessage =
              "Voice service not available in this browser. Use the text input below instead.";
            setShowTextFallback(true);
            break;
          case "aborted":
            showError = false;
            break;
          default:
            errorMessage = `Voice recognition error: ${event.error}`;
        }

        if (showError) {
          toast.error(errorMessage);
        }
        retryCountRef.current = 0;
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    initRecognition();
  }, [initRecognition]);

  useEffect(() => {
    if (voiceData && !isProcessing) {
      onVoiceComplete(voiceData);
      toast.success("Input processed successfully!");
      closeModal();
    }
  }, [voiceData, isProcessing]);

  useEffect(() => {
    if (voiceError && !isProcessing) {
      toast.error(voiceError.message || "Failed to process input");
    }
  }, [voiceError, isProcessing]);

  const openModal = () => {
    setIsModalOpen(true);
    setTranscript("");
    setTextInput("");
    retryCountRef.current = 0;
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsListening(false);
    setTranscript("");
    setTextInput("");
    setShowTextFallback(false);
    retryCountRef.current = 0;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore errors when stopping
      }
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) return;

    if (!navigator.onLine) {
      toast.error(
        "No internet connection. Try the text input below instead."
      );
      setShowTextFallback(true);
      return;
    }

    setIsListening(true);
    setTranscript("");
    retryCountRef.current = 0;

    // Re-initialize to clear any stale state
    initRecognition();

    setTimeout(() => {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast.error(
          "Voice recognition unavailable. Use the text input below instead."
        );
        setIsListening(false);
        setShowTextFallback(true);
      }
    }, 100);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      setIsListening(false);
    }
  };

  const processTranscript = () => {
    if (transcript.trim()) {
      processVoiceFn(transcript);
    }
  };

  const processTextInput = () => {
    if (textInput.trim()) {
      processVoiceFn(textInput);
    }
  };

  if (!isSupported) {
    // Even when speech recognition is unsupported, still show the button
    // so users can access the text fallback
    return null;
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

            {/* Text Fallback Input */}
            {showTextFallback && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Keyboard className="h-4 w-4" />
                  Type your transaction instead
                </div>
                <Textarea
                  placeholder='e.g. "Spent 500 on groceries at BigBasket yesterday"'
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
                <Button
                  onClick={processTextInput}
                  disabled={isProcessing || !textInput.trim()}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Process & Fill"
                  )}
                </Button>
              </div>
            )}

            {/* Toggle Text Input Link */}
            {!showTextFallback && (
              <button
                type="button"
                className="text-xs text-blue-500 hover:text-blue-700 underline w-full text-center"
                onClick={() => setShowTextFallback(true)}
              >
                Prefer typing? Switch to text input
              </button>
            )}

            {/* Internet Connection Note */}
            <div className="text-xs text-orange-600 text-center">
              Voice recognition requires connection to Google&apos;s speech servers
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
