"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { parseSMSTransaction } from "@/actions/transaction";

export function SMSParser({ onSMSComplete }) {
  const [smsText, setSmsText] = useState("");
  const [showTextArea, setShowTextArea] = useState(false);

  const {
    loading: isProcessing,
    fn: parseSMSFn,
    data: smsData,
    error: smsError,
  } = useFetch(parseSMSTransaction);

  const handleParseSMS = async () => {
    if (!smsText.trim()) {
      toast.error("Please enter SMS text to parse");
      return;
    }

    await parseSMSFn(smsText);
  };

  const handleToggleTextArea = () => {
    setShowTextArea(!showTextArea);
    if (!showTextArea) {
      setSmsText(""); // Clear text when opening
    }
  };

  // Handle successful parsing
  useEffect(() => {
    if (smsData && !isProcessing) {
      onSMSComplete(smsData);
      toast.success("SMS parsed successfully!");
      setSmsText(""); // Clear the input after successful parsing
      setShowTextArea(false); // Hide text area after successful parsing
    }
  }, [smsData, isProcessing]);

  // Handle errors
  useEffect(() => {
    if (smsError && !isProcessing) {
      toast.error(smsError.message || "Failed to parse SMS");
    }
  }, [smsError, isProcessing]);

  return (
    <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Smart Transaction Parser
                </label>
                <Button
                  type="button"
                  onClick={handleToggleTextArea}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 text-white"
                >
                  <MessageSquare className="mr-2" />
                  <span>{showTextArea ? "Hide Parser" : "Parse Transaction"}</span>
                </Button>
              </div>

      {showTextArea && (
        <div className="space-y-3">
          <Textarea
            placeholder="Paste SMS/GPay message OR type naturally: 'I spent 250 rs yesterday on food and ate dosa'"
            value={smsText}
            onChange={(e) => setSmsText(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <Button
            type="button"
            onClick={handleParseSMS}
            disabled={isProcessing || !smsText.trim()}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:opacity-90 text-white"
          >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" />
                        <span>Parsing Transaction...</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="mr-2" />
                        <span>Parse Transaction</span>
                      </>
                    )}
          </Button>
        </div>
      )}
    </div>
  );
}
