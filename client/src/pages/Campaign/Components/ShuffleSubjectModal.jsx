// client/src/components/ShuffleSubjectModal.jsx
import React, { useState } from "react";
import { X, Shuffle, AlertCircle, CheckCircle, Send, Calendar, Clock } from "lucide-react";

const API_URL = import.meta.env.VITE_VRI_URL;

const ShuffleSubjectModal = ({ 
  isOpen, 
  onClose, 
  canvasPages, 
  fromEmail, 
  fromName,
  credits,
  onCreditsUpdate
}) => {
  const [subjectLines, setSubjectLines] = useState("");
  const [recipients, setRecipients] = useState("");
  const [uploadedEmails, setUploadedEmails] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  
  // ✅ ADD SCHEDULING STATE
  const [scheduleType, setScheduleType] = useState("immediate");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  if (!isOpen) return null;

  const getAuthToken = () => localStorage.getItem('token');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const emails = text
        .split(/\r?\n|,/)
        .map((line) => line.trim())
        .filter((line) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(line));
      setUploadedEmails(emails);
    };
    reader.readAsText(file);
  };

  const parseRecipients = () => {
    if (uploadedEmails.length > 0) {
      return uploadedEmails;
    }
    return recipients
      .split(/[\n,]+/)
      .map(email => email.trim())
      .filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  };

  const parseSubjectLines = () => {
    return subjectLines
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  const getRecipientCount = () => parseRecipients().length;
  const getSubjectCount = () => parseSubjectLines().length;

  // ✅ GET MINIMUM DATE/TIME FOR SCHEDULING
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  };

  const shuffleAndDistribute = () => {
    const emails = parseRecipients();
    const subjects = parseSubjectLines();
    
    if (emails.length === 0 || subjects.length === 0) return [];

    // Shuffle emails randomly
    const shuffledEmails = [...emails].sort(() => Math.random() - 0.5);
    
    // Distribute emails evenly across subjects
    const distribution = [];
    const emailsPerSubject = Math.ceil(shuffledEmails.length / subjects.length);

    subjects.forEach((subject, index) => {
      const start = index * emailsPerSubject;
      const end = start + emailsPerSubject;
      const emailsForSubject = shuffledEmails.slice(start, end);
      
      if (emailsForSubject.length > 0) {
        distribution.push({
          subject,
          emails: emailsForSubject,
          count: emailsForSubject.length
        });
      }
    });

    return distribution;
  };

  const handleShuffleSend = async () => {
    const emailList = parseRecipients();
    const subjectList = parseSubjectLines();

    if (emailList.length === 0) {
      setSendStatus({ success: false, message: "Please add at least one valid email address" });
      return;
    }

    if (subjectList.length === 0) {
      setSendStatus({ success: false, message: "Please add at least one subject line" });
      return;
    }

    if (emailList.length > credits) {
      setSendStatus({
        success: false,
        message: `Insufficient credits. You need ${emailList.length} credits but only have ${credits}.`
      });
      return;
    }

    if (credits <= 0) {
      setSendStatus({
        success: false,
        message: "You have 0 credits remaining. Please upgrade your plan to send campaigns."
      });
      return;
    }

    // ✅ VALIDATE SCHEDULED TIME
    if (scheduleType === "scheduled") {
      if (!scheduledDate || !scheduledTime) {
        setSendStatus({
          success: false,
          message: "Please select both date and time for scheduled campaign."
        });
        return;
      }

      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const now = new Date();
      
      if (scheduledDateTime <= now) {
        setSendStatus({
          success: false,
          message: "Scheduled time must be in the future (at least 5 minutes from now)."
        });
        return;
      }
    }

    setIsSending(true);
    setSendStatus(null);

    try {
      const token = getAuthToken();
      const distribution = shuffleAndDistribute();

      console.log("📤 Sending shuffled campaign distribution:", distribution);

      if (!fromEmail || !fromName) {
        setSendStatus({
          success: false,
          message: "Missing sender information. Please complete the 'From' setup step first."
        });
        setIsSending(false);
        return;
      }

      // ✅ BUILD PAYLOAD WITH SCHEDULING SUPPORT
      const payload = {
        fromEmail,
        fromName,
        canvasData: canvasPages[0]?.elements || [],
        distribution,
        scheduleType
      };

      // ✅ ADD SCHEDULING DETAILS IF SCHEDULED
      if (scheduleType === "scheduled") {
        payload.scheduledDate = scheduledDate;
        payload.scheduledTime = scheduledTime;
        payload.timezone = timezone;
      }

      console.log("📦 Full payload being sent:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_URL}/api/campaigns/send-shuffled`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log("📡 Response status:", response.status);

      let data;
      try {
        data = await response.json();
        console.log("📥 Response data:", data);
      } catch (err) {
        console.error("❌ Failed to parse response JSON:", err);
        data = null;
      }

      if (!response.ok) {
        const errMsg = data?.error || data?.message || `Server returned ${response.status}`;
        
        if (data?.creditLimitReached || response.status === 403) {
          setSendStatus({ 
            success: false, 
            message: `⚠️ ${errMsg}. Please upgrade your plan.` 
          });
          if (onCreditsUpdate && data?.available !== undefined) {
            onCreditsUpdate(data.available);
          }
          setIsSending(false);
          return;
        }
        
        setSendStatus({ success: false, message: `❌ Error: ${errMsg}` });
        setIsSending(false);
        return;
      }

      // ✅ HANDLE SUCCESS BASED ON SCHEDULE TYPE
      // ✅ HANDLE SUCCESS BASED ON SCHEDULE TYPE
      if (scheduleType === "immediate") {
        const totalSent = data.results?.success?.length || 0;
        const totalFailed = data.results?.failed?.length || 0;

        const finalMessage = totalFailed === 0
          ? `✅ Shuffled campaign sent successfully! Sent: ${totalSent} emails across ${distribution.length} subject lines`
          : `⚠️ Campaign finished. Sent: ${totalSent}, Failed: ${totalFailed}.`;

        setSendStatus({
          success: totalFailed === 0,
          message: finalMessage,
          results: data.results,
          distribution: data.distribution
        });

        // ✅ UPDATE CREDITS AFTER IMMEDIATE SEND
        if (data.creditsRemaining !== undefined && onCreditsUpdate) {
          console.log("✅ Updating credits to:", data.creditsRemaining);
          onCreditsUpdate(data.creditsRemaining);
          localStorage.setItem("totalEmails", data.creditsRemaining);
        }

        setTimeout(() => {
          onClose();
          window.location.href = "/analytics";
        }, 3000);

      } else if (scheduleType === "scheduled") {
        // ✅ SCHEDULED CAMPAIGN - NO CREDITS DEDUCTED YET
        setSendStatus({
          success: true,
          message: `✅ Shuffled campaign scheduled for ${scheduledDate} at ${scheduledTime}. It will be sent automatically across ${distribution.length} subject lines. Credits will be deducted when the campaign executes.`
        });

        // ✅ DO NOT UPDATE CREDITS FOR SCHEDULED CAMPAIGNS
        console.log("📅 Scheduled campaign - credits NOT deducted yet");

        setTimeout(() => {
          onClose();
          window.location.href = "/automation";
        }, 3000);
      }

    } catch (err) {
      console.error("❌ Error sending shuffled campaign:", err);
      setSendStatus({ success: false, message: `❌ Error: ${err.message}` });
    } finally {
      setIsSending(false);
    }
  };

  const distribution = shuffleAndDistribute();
  const recipientCount = getRecipientCount();
  const subjectCount = getSubjectCount();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          <div className="flex items-center gap-3">
            <Shuffle className="text-[#c2831f]" size={24} />
            <h2 className="text-2xl font-bold text-white">Shuffle Subject Lines & Recipients</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-blue-400 font-medium text-sm">How it works:</p>
                <p className="text-blue-300 text-xs mt-1">
                  Add multiple subject lines and email addresses. The system will automatically shuffle and 
                  distribute your emails evenly across all subject lines, ensuring each recipient gets a unique 
                  subject from your list.
                </p>
              </div>
            </div>
          </div>

          {/* Subject Lines Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject Lines (one per line)
            </label>
            <textarea
              value={subjectLines}
              onChange={(e) => setSubjectLines(e.target.value)}
              rows={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#c2831f]"
              placeholder="🎉 Special Offer Just For You!&#10;💎 Exclusive Deal Inside&#10;🚀 Limited Time Opportunity&#10;⭐ Your Personal Invitation&#10;🎁 Don't Miss This Amazing Offer"
            />
            <p className="text-xs text-gray-400 mt-1">
              {subjectCount} subject line{subjectCount !== 1 ? 's' : ''} added
            </p>
          </div>

          {/* Recipients Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recipients (comma or newline separated)
            </label>
            <textarea
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              rows={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#c2831f]"
              placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
              disabled={uploadedEmails.length > 0}
            />
            <p className="text-xs text-gray-400 mt-1">
              Or upload a CSV file:
            </p>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="mt-2 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#c2831f] file:text-white hover:file:bg-[#d09025] cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1">
              {recipientCount} recipient{recipientCount !== 1 ? 's' : ''} added
            </p>
          </div>

          {/* ✅ SCHEDULING OPTIONS */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              When to send
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="scheduleType"
                  value="immediate"
                  checked={scheduleType === "immediate"}
                  onChange={(e) => setScheduleType(e.target.value)}
                  className="mr-3 accent-[#c2831f]"
                />
                <div>
                  <div className="font-medium text-white flex items-center gap-2">
                    <Send size={16} />
                    Send Immediately
                  </div>
                  <div className="text-sm text-gray-400">Send as soon as you confirm</div>
                </div>
              </label>

              {/* <label className="flex items-center">
                <input
                  type="radio"
                  name="scheduleType"
                  value="scheduled"
                  checked={scheduleType === "scheduled"}
                  onChange={(e) => setScheduleType(e.target.value)}
                  className="mr-3 accent-[#c2831f]"
                />
                <div>
                  <div className="font-medium text-white flex items-center gap-2">
                    <Calendar size={16} />
                    Schedule for Later
                  </div>
                  <div className="text-sm text-gray-400">Pick a specific date and time</div>
                </div>
              </label> */}
            </div>

            {/* ✅ SCHEDULE DATE/TIME INPUTS */}
            {scheduleType === "scheduled" && (
              <div className="mt-4 p-4 bg-gray-900 rounded-lg space-y-4 border border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      min={getMinDate()}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#c2831f]"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#c2831f]"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Timezone
                  </label>
                  <select
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#c2831f]"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Kolkata">India</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Distribution Preview */}
          {distribution.length > 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Shuffle size={16} className="text-[#c2831f]" />
                Distribution Preview
              </h3>
              <div className="space-y-2">
                {distribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex-1 truncate mr-4">
                      {item.subject}
                    </span>
                    <span className="text-[#c2831f] font-medium whitespace-nowrap">
                      {item.count} email{item.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credit Info */}
          {recipientCount > 0 && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Total Recipients:</span>
                <span className="text-lg font-bold text-white">{recipientCount}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Available Credits:</span>
                <span className={`text-lg font-bold ${credits >= recipientCount ? 'text-green-400' : 'text-red-400'}`}>
                  {credits}
                </span>
              </div>
              <div className="h-px bg-gray-700 my-2"></div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Credits Needed:</span>
                <span className="text-lg font-bold text-[#c2831f]">{recipientCount}</span>
              </div>

              {recipientCount > credits && (
                <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-red-400 font-medium text-sm">Insufficient Credits</p>
                      <p className="text-red-300 text-xs mt-1">
                        You need <strong>{recipientCount}</strong> credits but only have <strong>{credits}</strong>.
                        Please <a href="/pricing" className="underline hover:text-red-200">purchase more credits</a>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {credits === 0 && (
                <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-700 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-yellow-400 font-medium text-sm">No Credits Available</p>
                      <p className="text-yellow-300 text-xs mt-1">
                        You have 0 credits remaining.{" "}
                        <a href="/pricing" className="underline hover:text-yellow-200">Upgrade your plan</a>{" "}
                        to send campaigns.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status Message */}
          {sendStatus && (
            <div className={`p-4 rounded-lg border ${
              sendStatus.success 
                ? 'bg-green-900/30 border-green-700' 
                : 'bg-red-900/30 border-red-700'
            }`}>
              <div className="flex items-start gap-2">
                {sendStatus.success ? (
                  <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={18} />
                ) : (
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                )}
                <div>
                  <p className={`font-medium text-sm ${
                    sendStatus.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {sendStatus.message}
                  </p>
                  {sendStatus.distribution && (
                    <div className="mt-2 text-xs text-gray-300">
                      <p>Distribution summary:</p>
                      {sendStatus.distribution.map((item, idx) => (
                        <p key={idx} className="ml-2">• {item.subject}: {item.sent} sent</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700 bg-gray-900 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            disabled={isSending}
          >
            Cancel
          </button>
          <button
            onClick={handleShuffleSend}
            disabled={
              isSending ||
              recipientCount === 0 ||
              subjectCount === 0 ||
              recipientCount > credits ||
              credits <= 0 ||
              (scheduleType === "scheduled" && (!scheduledDate || !scheduledTime))
            }
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-white transition-colors ${
              isSending ||
              recipientCount === 0 ||
              subjectCount === 0 ||
              recipientCount > credits ||
              credits <= 0 ||
              (scheduleType === "scheduled" && (!scheduledDate || !scheduledTime))
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-[#c2831f] hover:bg-[#d09025]'
            }`}
          >
            {scheduleType === 'immediate' ? <Send size={16} /> : <Calendar size={16} />}
            {isSending 
              ? 'Processing...' 
              : scheduleType === 'immediate' 
                ? 'Shuffle & Send Now' 
                : 'Schedule Shuffled Campaign'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShuffleSubjectModal;