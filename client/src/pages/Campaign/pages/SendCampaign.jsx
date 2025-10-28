// client/src/pages/Campaign/pages/SendCampaign.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle, ChevronDown, ChevronUp, Send, Users, Settings,
  FileText, Palette, Check, Clock, Calendar, AlertCircle,
  Mail, RefreshCw, LogOut
} from "lucide-react";
import ShuffleSubjectModal from "../Components/ShuffleSubjectModal";
import { Shuffle } from "lucide-react";
const API_URL = import.meta.env.VITE_VRI_URL;

const steps = [
  {
    id: "recipients",
    title: "To",
    description: "Choose who to send to",
    icon: Users,
  },
  {
    id: "setup",
    title: "From",
    description: "Set up your email",
    icon: Settings,
  },
  {
    id: "template",
    title: "Template",
    description: "Choose a template",
    icon: FileText,
  },
  {
    id: "design",
    title: "Design",
    description: "Design your email",
    icon: Palette,
  },
  {
    id: "schedule",
    title: "Schedule",
    description: "Schedule your campaign",
    icon: Clock,
  },
  {
    id: "confirm",
    title: "Confirm",
    description: "Review and send",
    icon: Check,
  },
];

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("EmailPreview Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-medium">Preview Error</h3>
          <p className="text-red-600 text-sm mt-1">
            Unable to display email preview. Please check your email design.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Email Preview Component with Exact Editor Styles
function EmailPreview({ pages, activePage, zoomLevel = 1.0, formData }) {
  if (!pages || !pages.length || activePage === undefined || activePage >= pages.length) {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-lg p-8">
        <div className="text-center text-gray-400">
          <div className="text-5xl mb-3">📧</div>
          <p className="text-gray-600 font-medium">No content to preview</p>
          <p className="text-sm mt-2 text-gray-500">Design your email in the editor to see it here</p>
        </div>
      </div>
    );
  }

  const currentPage = pages[activePage];
  if (!currentPage || !currentPage.elements || currentPage.elements.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-lg p-8">
        <div className="text-center text-gray-400">
          <div className="text-5xl mb-3">📧</div>
          <p className="text-gray-600 font-medium">Empty canvas</p>
          <p className="text-sm mt-2 text-gray-500">Add elements to your email design</p>
        </div>
      </div>
    );
  }

  // Sort elements by Y position (top to bottom)
  const sortedElements = [...currentPage.elements].sort((a, b) => (a.y || 0) - (b.y || 0));

  const renderEmailElement = (element) => {
    try {
      const baseStyle = {
        fontFamily: element.fontFamily || 'Arial, sans-serif',
        color: element.color || '#000000',
        textAlign: element.textAlign || 'left',
        margin: '15px 0',
      };

      switch (element.type) {
        case "heading":
          return (
            <h1 key={element.id} style={{
              ...baseStyle,
              fontSize: `${element.fontSize || 20}px`,
              fontWeight: element.fontWeight || 'bold',
              lineHeight: '1.3',
              marginTop: '25px',
              marginBottom: '15px',
            }}>
              {element.content || 'Heading'}
            </h1>
          );

        case "subheading":
          return (
            <h2 key={element.id} style={{
              ...baseStyle,
              fontSize: `${element.fontSize || 24}px`,
              fontWeight: element.fontWeight || '600',
              lineHeight: '1.4',
              marginTop: '20px',
              marginBottom: '12px',
            }}>
              {element.content || 'Subheading'}
            </h2>
          );

        case "paragraph":
          return (
            <p key={element.id} style={{
              ...baseStyle,
              fontSize: `${element.fontSize || 16}px`,
              lineHeight: '1.6',
              margin: '12px 0',
            }}
              dangerouslySetInnerHTML={{ __html: element.content || 'Paragraph text' }}
            />
          );

        case "blockquote":
          return (
            <blockquote key={element.id} style={{
              ...baseStyle,
              fontSize: `${element.fontSize || 16}px`,
              fontStyle: 'italic',
              borderLeft: `4px solid ${element.borderColor || '#cccccc'}`,
              paddingLeft: '20px',
              margin: '20px 0',
              lineHeight: '1.6',
              color: element.color || '#666666',
            }}>
              {element.content || 'Blockquote text'}
            </blockquote>
          );

        case "button":
          return (
            <div key={element.id} style={{ margin: '25px 0', textAlign: element.textAlign || 'center' }}>
              <a
                href={element.link || '#'}
                style={{
                  display: 'inline-block',
                  padding: '12px 35px',
                  fontSize: `${element.fontSize || 16}px`,
                  fontFamily: element.fontFamily || 'Arial, sans-serif',
                  color: element.color || '#ffffff',
                  backgroundColor: element.backgroundColor || '#007bff',
                  textDecoration: 'none',
                  fontWeight: element.fontWeight || 'bold',
                  borderRadius: `${element.borderRadius || 6}px`,
                  border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none',
                }}
              >
                {element.content || 'Click Me'}
              </a>
            </div>
          );

        case "image":
          return (
            <div key={element.id} style={{ margin: '20px 0', textAlign: element.textAlign || 'center' }}>
              <img
                src={element.src || 'https://via.placeholder.com/600x300/e0e0e0/666666?text=Image'}
                alt={element.alt || 'Email Image'}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: `${element.borderRadius || 0}px`,
                  border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#cccccc'}` : 'none',
                }}
              />
            </div>
          );

        case "card":
          return (
            <div key={element.id} style={{
              backgroundColor: element.backgroundColor || '#f8f9fa',
              border: `${element.borderWidth || 1}px solid ${element.borderColor || '#dee2e6'}`,
              borderRadius: `${element.borderRadius || 8}px`,
              padding: `${element.padding || 20}px`,
              margin: '20px 0',
            }}>
              <div style={{
                fontSize: `${element.fontSize || 16}px`,
                color: element.color || '#000000',
                fontFamily: element.fontFamily || 'Arial, sans-serif',
                lineHeight: '1.6',
              }}>
                {element.content || 'Card content goes here'}
              </div>
            </div>
          );

        case "line":
          return (
            <hr key={element.id} style={{
              border: 'none',
              borderTop: `${element.strokeWidth || 2}px solid ${element.strokeColor || '#cccccc'}`,
              margin: '20px 0',
            }} />
          );

        case "rectangle":
          return (
            <div key={element.id} style={{
              backgroundColor: element.backgroundColor || '#e9ecef',
              height: `${Math.min(element.height || 100, 200)}px`,
              borderRadius: `${element.borderRadius || 0}px`,
              border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#cccccc'}` : 'none',
              margin: '20px 0',
            }} />
          );

        case "circle":
          return (
            <div key={element.id} style={{
              backgroundColor: element.backgroundColor || '#e9ecef',
              width: `${Math.min(element.width || 100, 150)}px`,
              height: `${Math.min(element.height || 100, 150)}px`,
              borderRadius: '50%',
              border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#cccccc'}` : 'none',
              margin: '20px auto',
            }} />
          );

        default:
          return null;
      }
    } catch (error) {
      console.error("Error rendering element:", element, error);
      return null;
    }
  };

  return (
    <div className="h-full bg-gray-100 overflow-auto">
      {/* Email Body */}
      <div className="max-w-2xl mx-auto my-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            {sortedElements.map(element => renderEmailElement(element))}
          </div>

          {/* Email Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 text-center text-sm text-gray-600">
             
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CampaignBuilder() {
  const location = useLocation();
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState("setup");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formData, setFormData] = useState({
    recipients: "",
    fromEmail: "",
    fromName: "",
    subject: "",
    sendTime: "",
    template: "basic",
    designContent: "",
    scheduleType: "immediate",
    scheduledDate: "",
    scheduledTime: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    recurringFrequency: "daily",
    recurringDays: [],
    recurringEndDate: "",
  });

  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [canvasPages, setCanvasPages] = useState([{ id: 1, elements: [] }]);
  const [canvasActivePage, setCanvasActivePage] = useState(0);
  const [canvasZoomLevel, setCanvasZoomLevel] = useState(0.6);
  const [authError, setAuthError] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [credits, setCredits] = useState(0);
  const [recipientError, setRecipientError] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailVerificationStatus, setEmailVerificationStatus] = useState(null);
  const [showShuffleModal, setShowShuffleModal] = useState(false);
  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };
const [showExitModal, setShowExitModal] = useState(false);

  // Calculate recipient count
  const getRecipientCount = () => {
    if (formData.recipients === "all-subscribers") {
      return contacts.length;
    } else if (formData.recipients === "new-customers") {
      return contacts.filter(c => c.type === "new-customer").length;
    } else if (formData.recipients === "vip-clients") {
      return contacts.filter(c => c.type === "vip-client").length;
    } else if (formData.recipients === "manual") {
      return (formData.manualEmails || "")
        .split(/[\n,]+/)
        .filter(e => e.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())).length;
    } else if (formData.recipients === "file") {
      return (formData.bulkFileEmails || []).length;
    }
    return 0;
  };

  // Utility: split array into chunks
  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  useEffect(() => {
    if (location.state?.canvasData) {
      setCanvasPages([{ id: 1, elements: location.state.canvasData }]);
      setCompletedSteps([...completedSteps, "design"]);
      setFormData((prev) => ({
        ...prev,
        subject: location.state.subject || prev.subject,
      }));
    }
  }, [location.state]);

  useEffect(() => { 
    fetchContacts(); 
  }, []);

  // Function to fetch contacts from API
  const fetchContacts = async () => {
    try {
      const token = getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/campaigncontacts`, {
        headers
      });

      if (response.status === 401) {
        setAuthError(true);
        console.error("Authentication error: Please log in again");
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        throw new Error(`Server returned non-JSON response: ${errorText.substring(0, 100)}...`);
      }

      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      } else {
        console.error("Failed to fetch contacts");
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const markComplete = (id) => {
    if (!completedSteps.includes(id)) {
      setCompletedSteps([...completedSteps, id]);
    }
    setExpanded(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const emails = text
        .split(/\r?\n|,/)
        .map((line) => line.trim())
        .filter((line) => line.includes("@"));
      setFormData((prev) => ({ ...prev, bulkFileEmails: emails }));
    };
    reader.readAsText(file);
  };

  const handleTemplateSelect = (template) => {
    setFormData({ ...formData, template });
    markComplete("template");
  };

  const handleRecurringDaysChange = (day) => {
    const days = formData.recurringDays || [];
    if (days.includes(day)) {
      setFormData({
        ...formData,
        recurringDays: days.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        recurringDays: [...days, day]
      });
    }
  };

// ✅ ONLY THE CHANGED PARTS - Replace in your SendCampaign.jsx

// 1️⃣ Update the fetchCredits function (around line 335):
useEffect(() => {
  const fetchCredits = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // ✅ Changed from /api/users/credits to /api/campaigns/credits
      const res = await fetch(`${API_URL}/api/campaigns/credits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        console.error("Failed to fetch credits:", res.status);
        setCredits(0);
        return;
      }
      
      const data = await res.json();
      console.log("✅ Credits fetched:", data);
      
      // ✅ Use the correct field name from response
      const userCredits = data?.emailSendCredits ?? 0;
      setCredits(userCredits);
      localStorage.setItem("totalEmails", userCredits);

    } catch (err) {
      console.error("❌ Failed to fetch credits:", err);
      setCredits(0);
    }
  };
  fetchCredits();
}, []);


const checkEmailVerification = async (email) => {
  if (!email || !email.includes('@')) {
    setEmailVerificationStatus(null);
    return;
  }

  setIsCheckingEmail(true);
  setEmailVerificationStatus(null);

  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/campaigns/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      setEmailVerificationStatus(data.verified === true);
    } else {
      setEmailVerificationStatus(false);
    }
  } catch (error) {
    console.error('Error checking email verification:', error);
    setEmailVerificationStatus(false);
  } finally {
    setIsCheckingEmail(false);
  }
};

const handleEmailBlur = (e) => {
  if (e.target.name === 'fromEmail') {
    checkEmailVerification(e.target.value);
  }
};


// 2️⃣ Update handleSendCampaign function (around line 360):
// ✅ FIXED: Replace your handleSendCampaign function in SendCampaign.jsx

const handleSendCampaign = async () => {
  setIsSending(true);
  setSendStatus(null);
  
  try {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };

    // ✅ Check credits
    const creditsNum = Number(credits);
    console.log("🔍 Current credits:", creditsNum);
    
    if (creditsNum <= 0) {
      setSendStatus({
        success: false,
        message: "⚠️ You have 0 email credits remaining. Please upgrade your plan before sending a campaign.",
      });
      setIsSending(false);
      return;
    }

    // Prepare recipients
    const contactsResponse = await fetch(`${API_URL}/api/campaigncontacts`, { headers });
    if (!contactsResponse.ok) throw new Error("Failed to fetch contacts");
    const contactsData = await contactsResponse.json();

    let recipientsList = [];
    if (formData.recipients === "all-subscribers") {
      recipientsList = contactsData;
    } else if (formData.recipients === "new-customers") {
      recipientsList = contactsData.filter(c => c.type === "new-customer");
    } else if (formData.recipients === "vip-clients") {
      recipientsList = contactsData.filter(c => c.type === "vip-client");
    } else if (formData.recipients === "manual") {
      recipientsList = (formData.manualEmails || "")
        .split(/[\n,]+/)
        .map(email => ({ email: email.trim() }))
        .filter(c => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email));
    } else if (formData.recipients === "file") {
      recipientsList = (formData.bulkFileEmails || [])
        .map(email => ({ email }))
        .filter(c => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email));
    }

    if (recipientsList.length === 0) {
      setSendStatus({ success: false, message: "❌ No valid recipients found." });
      setIsSending(false);
      return;
    }

    // ✅ Check if user has enough credits for recipients
    if (recipientsList.length > creditsNum) {
      setSendStatus({
        success: false,
        message: `❌ Insufficient credits. You need ${recipientsList.length} credits but only have ${creditsNum}.`,
      });
      setIsSending(false);
      return;
    }

    // ✅ PREPARE PAYLOAD WITH PROPER SCHEDULING DATA
    const payload = {
      campaignName: formData.subject,
      subject: formData.subject,
      fromEmail: formData.fromEmail,
      fromName: formData.fromName,
      recipients: recipientsList,
      canvasData: canvasPages[0].elements,
      scheduleType: formData.scheduleType,
    };

    // ✅ ADD SCHEDULING DETAILS BASED ON TYPE
    if (formData.scheduleType === "scheduled") {
      // Combine date and time properly
      payload.scheduledDate = formData.scheduledDate;
      payload.scheduledTime = formData.scheduledTime;
      payload.timezone = formData.timezone;
      
      // Create full datetime for validation
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      const now = new Date();
      
      // ✅ Validate scheduled time is in future
      if (scheduledDateTime <= now) {
        setSendStatus({
          success: false,
          message: "❌ Scheduled time must be in the future (at least 5 minutes from now).",
        });
        setIsSending(false);
        return;
      }
    } else if (formData.scheduleType === "recurring") {
      payload.scheduledDate = formData.scheduledDate;
      payload.scheduledTime = formData.scheduledTime;
      payload.timezone = formData.timezone;
      payload.recurringFrequency = formData.recurringFrequency;
      payload.recurringDays = formData.recurringDays || [];
      payload.recurringEndDate = formData.recurringEndDate || null;
    }

    console.log("📤 Sending payload:", payload);

    const url = `${API_URL}/api/campaigns/send`;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    let data;
    try {
      data = await response.json();
    } catch (err) {
      data = null;
    }

    if (!response.ok) {
      const errMsg = data?.error || data?.message || `Server returned ${response.status}`;
      
      if (data?.creditLimitReached || response.status === 403) {
        setSendStatus({ 
          success: false, 
          message: `⚠️ ${errMsg}. Please upgrade your plan.` 
        });
        setCredits(data?.available ?? 0);
        setIsSending(false);
        return;
      }
      
      setSendStatus({ success: false, message: `❌ Error: ${errMsg}` });
      setIsSending(false);
      return;
    }

    // ✅ HANDLE SUCCESS BASED ON SCHEDULE TYPE
    if (formData.scheduleType === "immediate") {
      // Immediate send - show results
      const finalMessage = data.results?.failed?.length === 0
        ? `✅ Campaign sent successfully! Sent: ${data.results.success.length}`
        : `⚠️ Campaign finished. Sent: ${data.results.success.length}, Failed: ${data.results.failed.length}.`;

      setSendStatus({
        success: data.results?.failed?.length === 0,
        message: finalMessage,
        results: data.results,
      });

      // Update credits after immediate send
      if (data.creditsRemaining !== undefined) {
        setCredits(data.creditsRemaining);
        localStorage.setItem("totalEmails", data.creditsRemaining);
      }

      setTimeout(() => {
        navigate("/analytics");
      }, 3000);

    } else {
      // Scheduled or Recurring - just confirm it's scheduled
      const scheduleMessage = formData.scheduleType === "scheduled"
        ? `✅ Campaign scheduled for ${formData.scheduledDate} at ${formData.scheduledTime}. It will be sent automatically.`
        : `✅ Recurring campaign created (${formData.recurringFrequency}). It will be sent automatically based on your schedule.`;

      setSendStatus({
        success: true,
        message: scheduleMessage,
      });

      setTimeout(() => {
        navigate("/automation");
      }, 3000);
    }

  } catch (err) {
    console.error("❌ Error sending campaign:", err);
    setSendStatus({ success: false, message: `❌ Error: ${err.message}` });
  } finally {
    setIsSending(false);
    setBatchProgress({ current: 0, total: 0 });
  }
};

  // Get minimum date for scheduling (current date + 5 minutes)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  };

  // Handle authentication error
  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
        <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h2>
          <p className="text-gray-300 mb-6">
            You need to be logged in to access this feature. Please log in again.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-[#c2831f] hover:bg-[#d09025] text-white rounded-md font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left Side - Title */}
          <h1 className="text-2xl font-bold text-white">Send Campaign</h1>

          {/* Middle - Shuffle Button */}
          <div className="flex items-right ml-125">
            <button
              onClick={() => setShowShuffleModal(true)}
              className="flex items-right gap-2 px-4 py-2 text-sm font-medium text-white 
                        bg-[#c2831f] rounded-md cursor-pointer transition-all shadow-md hover:shadow-lg">
              <Shuffle size={16} />
              Shuffle Subject Lines & To: Mails
            </button>
          </div>

          {/* Shuffle Modal */}
          <ShuffleSubjectModal
            isOpen={showShuffleModal}
            onClose={() => setShowShuffleModal(false)}
            canvasPages={canvasPages}
            fromEmail={formData.fromEmail}
            fromName={formData.fromName}
            credits={credits}
            onCreditsUpdate={(newCredits) => {
              setCredits(newCredits);
              localStorage.setItem("totalEmails", newCredits);
            }}
          />

          {/* Right Side - Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Credits Info */}
            <span className="text-sm text-gray-300 bg-gray-900 px-3 py-1.5 rounded-md border border-gray-700">
              Send Email: <span className="text-[#d99c2b] font-semibold">{credits || 0}</span>
            </span>

            {/* Navigation Buttons */}
            <button
              onClick={() => navigate("/texteditor")}
              className="px-4 py-2 text-sm text-white bg-transparent border border-[#d99c2b] rounded-md 
                        hover:bg-[#d99c2b] hover:text-black transition-all duration-300"
            >
              Text Editor Page
            </button>

            <button
              onClick={() => navigate("/all-templates")}
              className="px-4 py-2 text-sm text-white bg-transparent border border-[#d99c2b] rounded-md 
                        hover:bg-[#d99c2b] hover:text-black transition-all duration-300"
            >
              Choose Templates
            </button>

            {/* Send / Schedule Button */}
            <button
              onClick={handleSendCampaign}
              disabled={
                credits <= 0 ||
                !completedSteps.includes("recipients") ||
                !completedSteps.includes("setup") ||
                !completedSteps.includes("template") ||
                !completedSteps.includes("schedule") ||
                isSending
              }
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md 
                transition-all duration-300 shadow-md 
                ${!completedSteps.includes("recipients") ||
                  !completedSteps.includes("setup") ||
                  !completedSteps.includes("template") ||
                  !completedSteps.includes("schedule") ||
                  isSending
                  ? "bg-gray-800 cursor-not-allowed text-gray-500 border border-gray-700"
                  : "bg-[#c2831f] hover:bg-[#d99c2b] text-black shadow-lg hover:shadow-[#d99c2b]/30"
                }`}
            >
              {formData.scheduleType === "immediate" ? (
                <Send size={16} />
              ) : (
                <Calendar size={16} />
              )}
              {isSending
                ? "Processing..."
                : formData.scheduleType === "immediate"
                  ? "Send Now"
                  : "Schedule Campaign"}
            </button>
          </div>
        </div>
      </header>


      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Step Tracker */}
        <div className="w-64 bg-black border-r border-gray-800 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400  tracking-wider">
              Campaign Steps
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-5 top-8 bottom-0 w-0.5 bg-gray-700"></div>
            <div className="space-y-8">
              {steps.map(({ id, title, description, icon: Icon }, index) => {
                const isCompleted = completedSteps.includes(id);
                const isExpanded = expanded === id;
                return (
                  <div key={id} className="relative flex items-start">
                    <div
                      className={`relative z-10 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${isCompleted ? "bg-[#c2831f]" : "bg-gray-800"
                        }`}
                    >
                      {isCompleted ? (
                        <CheckCircle size={20} className="text-white" />
                      ) : (
                        <Icon size={18} className="text-gray-400" />
                      )}
                    </div>
                    <div className="ml-4 pt-1">
                      <button
                        onClick={() => toggleExpand(id)}
                        className={`text-left ${isExpanded ? "text-[#c2831f]" : "hover:text-gray-300"
                          }`}
                      >
                        <div className="font-medium">{title}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {description}
                        </div>
                      </button>
                      {isCompleted && (
                        <div className="mt-2 text-xs text-[#c2831f] flex items-center">
                          <div className="w-2 h-2 rounded-full bg-[#c2831f] mr-1"></div>
                          Completed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Exit Option */}
          <div className="mt-20 pt-6 border-t border-gray-800">
            <button
              onClick={() => setShowExitModal(true)}
              className="flex items-center gap-2 text-gray-400 hover:text-[#c2831f] transition-colors duration-300"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Exit Campaign</span>
            </button>
            {/* Exit Confirmation Modal */}
            {showExitModal && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div className="bg-[#111] border border-gray-800 rounded-xl p-8 w-[90%] max-w-md text-center shadow-xl">
                  <h2 className="text-lg font-semibold text-white mb-3">
                    Exit Campaign Setup?
                  </h2>
                  <p className="text-gray-400 text-sm mb-6">
                    Are you sure you want to exit? All unsaved progress will be lost.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setShowExitModal(false)}
                      className="px-4 py-2 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-4 py-2 rounded-md bg-[#c2831f] text-black font-semibold hover:bg-[#d99c2b] transition-all"
                    >
                      Yes, Exit
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-black">
          <div className="max-w-3xl mx-auto">
            {steps.map(({ id, title, description }) => {
              const isExpanded = expanded === id;
              const isCompleted = completedSteps.includes(id);
              return (
                <div
                  key={id}
                  className={`mb-8 border border-gray-800 rounded-lg overflow-hidden transition-all ${isExpanded ? "shadow-lg" : ""
                    }`}
                >
                  <button
                    onClick={() => toggleExpand(id)}
                    className="flex justify-between items-center w-full px-6 py-4 bg-black hover:bg-gray-900 focus:outline-none"
                  >
                    <div className="flex items-center">
                      <div
                        className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${isCompleted
                          ? "bg-[#c2831f]/20 text-[#c2831f]"
                          : "bg-gray-800 text-gray-400"
                          }`}
                      >
                        {isCompleted ? (
                          <CheckCircle size={16} />
                        ) : (
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="ml-4 text-left">
                        <div className="text-lg font-medium text-white">
                          {title}
                        </div>
                        <div className="text-sm text-gray-400">
                          {description}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="text-gray-400" />
                    ) : (
                      <ChevronDown className="text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-6 py-5 bg-gray-900 border-t border-gray-800">
                      {id === "recipients" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Choose an audience
                            </label>
                            <select
                              name="recipients"
                              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c2831f] text-white"
                              value={formData.recipients}
                              onChange={(e) => {
                                handleChange(e);
                                setRecipientError(""); // Clear error when changing selection
                              }}
                            >
                              <option value="">Select an option</option>
                              <option value="manual">Manual (paste emails)</option>
                              <option value="file">Upload File (CSV)</option>
                            </select>

                            {formData.recipients === "manual" && (
                              <div className="mt-3">
                                <label className="block text-sm text-gray-300 mb-1">
                                  Paste emails (comma or newline separated)
                                </label>
                                <textarea
                                  rows={4}
                                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                                  value={formData.manualEmails}
                                  onChange={(e) => {
                                    setFormData({
                                      ...formData,
                                      manualEmails: e.target.value,
                                    });
                                    setRecipientError(""); // Clear error when typing
                                  }}
                                  placeholder="example1@email.com, example2@email.com"
                                />
                              </div>
                            )}

                            {formData.recipients === "file" && (
                              <div className="mt-3">
                                <label className="block text-sm text-gray-300 mb-1">
                                  Upload CSV file (with "email" column)
                                </label>
                                <input
                                  type="file"
                                  accept=".csv"
                                  className="block w-full text-gray-300"
                                  onChange={(e) => {
                                    handleFileUpload(e);
                                    setRecipientError(""); // Clear error when uploading
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          {/* ✅ CREDIT AND RECIPIENT COUNT DISPLAY */}
                          {formData.recipients && (
                            <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400">Recipients selected:</span>
                                <span className="text-lg font-bold text-white">
                                  {getRecipientCount()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400">Available credits:</span>
                                <span className={`text-lg font-bold ${credits >= getRecipientCount() ? 'text-green-400' : 'text-red-400'}`}>
                                  {credits}
                                </span>
                              </div>
                              <div className="h-px bg-gray-700 my-2"></div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">Credits needed:</span>
                                <span className="text-lg font-bold text-[#c2831f]">
                                  {getRecipientCount()}
                                </span>
                              </div>
                              
                              {/* ✅ CREDIT VALIDATION MESSAGE */}
                              {getRecipientCount() > credits && (
                                <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-md">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                                    <div>
                                      <p className="text-red-400 font-medium text-sm">
                                        Insufficient Credits
                                      </p>
                                      <p className="text-red-300 text-xs mt-1">
                                        You need <strong>{getRecipientCount()}</strong> credits but only have <strong>{credits}</strong>. 
                                        Please reduce recipients or{" "}
                                        <a href="/pricing" className="underline hover:text-red-200">
                                          purchase more credits
                                        </a>.
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
                                      <p className="text-yellow-400 font-medium text-sm">
                                        No Credits Available
                                      </p>
                                      <p className="text-yellow-300 text-xs mt-1">
                                        You have 0 credits remaining.{" "}
                                        <a href="/pricing" className="underline hover:text-yellow-200">
                                          Upgrade your plan
                                        </a>{" "}
                                        to send campaigns.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ✅ ERROR MESSAGE */}
                          {recipientError && (
                            <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-md">
                              <p className="text-red-400 text-sm">{recipientError}</p>
                            </div>
                          )}

                          {/* ✅ SAVE BUTTON WITH VALIDATION */}
                          <button
                            onClick={() => {
                              // Validate recipient count
                              const count = getRecipientCount();
                              
                              if (!formData.recipients) {
                                setRecipientError("Please select an audience type");
                                return;
                              }
                              
                              if (count === 0) {
                                setRecipientError("Please add at least one valid email address");
                                return;
                              }
                              
                              // ✅ CHECK CREDITS BEFORE ALLOWING TO PROCEED
                              if (count > credits) {
                                setRecipientError(
                                  `You don't have enough credits. You need ${count} credits but only have ${credits}. Please reduce recipients or purchase more credits.`
                                );
                                return;
                              }
                              
                              if (credits === 0) {
                                setRecipientError(
                                  "You have 0 credits remaining. Please upgrade your plan to send campaigns."
                                );
                                return;
                              }
                              
                              // All validations passed
                              setRecipientError("");
                              markComplete(id);
                            }}
                            className="mt-2 px-4 py-2 rounded-md bg-[#c2831f] hover:bg-[#d09025] text-white transition-colors"
                          >
                            Save and Continue
                          </button>
                        </div>
                      )}

                    {id === "setup" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            From Email Address
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              name="fromEmail"
                              required
                              value={formData.fromEmail}
                              onChange={handleChange}
                              onBlur={handleEmailBlur}
                              className={`w-full bg-gray-800 border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 text-white ${
                                emailVerificationStatus === true
                                  ? 'border-green-500 focus:ring-green-500'
                                  : emailVerificationStatus === false
                                  ? 'border-red-500 focus:ring-red-500'
                                  : 'border-gray-700 focus:ring-[#c2831f]'
                              }`}
                              placeholder="Enter verified sender email"
                            />
                            
                            {/* Loading Spinner */}
                            {isCheckingEmail && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <RefreshCw className="animate-spin text-gray-400" size={18} />
                              </div>
                            )}
                            
                            {/* Verification Status Icons */}
                            {!isCheckingEmail && emailVerificationStatus === true && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <CheckCircle className="text-green-500" size={20} />
                              </div>
                            )}
                            
                            {!isCheckingEmail && emailVerificationStatus === false && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <AlertCircle className="text-red-500" size={20} />
                              </div>
                            )}
                          </div>

                          {/* Verification Messages */}
                          {emailVerificationStatus === true && (
                            <div className="mt-2 p-3 bg-green-900/30 border border-green-700 rounded-md">
                              <div className="flex items-start gap-2">
                                <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={18} />
                                <div>
                                  <p className="text-green-400 font-medium text-sm">
                                    Email Verified ✓
                                  </p>
                                  <p className="text-green-300 text-xs mt-1">
                                    This email is verified and ready to send campaigns.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {emailVerificationStatus === false && (
                            <div className="mt-2 p-3 bg-red-900/30 border border-red-700 rounded-md">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                                <div>
                                  <p className="text-red-400 font-medium text-sm">
                                    Email Not Verified ✗
                                  </p>
                                  <p className="text-red-300 text-xs mt-1">
                                    This email is not verified. Only verified emails can send campaigns.{" "}
                                    <a
                                      href="/email-campaign"
                                      className="text-[#c2831f] underline hover:text-[#d09025] font-medium"
                                    >
                                      Click here to request verification
                                    </a>
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {!emailVerificationStatus && !isCheckingEmail && formData.fromEmail && (
                            <p className="text-xs text-gray-400 mt-2">
                              ⚠️ Only verified emails can be used.{" "}
                              <a
                                href="/email-campaign"
                                className="text-[#c2831f] underline hover:text-[#d09025]"
                              >
                                Click here to request verification
                              </a>
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            From Name
                          </label>
                          <input
                            type="text"
                            name="fromName"
                            required
                            value={formData.fromName}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c2831f] text-white"
                            placeholder="Your sender name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Subject Line
                          </label>
                          <input
                            type="text"
                            name="subject"
                            required
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c2831f] text-white"
                            placeholder="Enter your email subject"
                          />
                        </div>

                        <button
                          onClick={() => {
                            // Validate email verification before allowing to continue
                            if (!formData.fromEmail || !formData.fromName) {
                              return;
                            }
                            
                            if (emailVerificationStatus !== true) {
                              // Show error if email is not verified
                              alert('Please use a verified email address. Click "Click here to request verification" to verify your email.');
                              return;
                            }
                            
                            markComplete(id);
                          }}
                          disabled={
                            !formData.fromEmail || 
                            !formData.fromName || 
                            emailVerificationStatus !== true ||
                            isCheckingEmail
                          }
                          className={`mt-4 px-4 py-2 rounded-md ${
                            !formData.fromEmail || 
                            !formData.fromName || 
                            emailVerificationStatus !== true ||
                            isCheckingEmail
                              ? "bg-gray-700 cursor-not-allowed text-gray-400"
                              : "bg-[#c2831f] hover:bg-[#d09025] text-white"
                          }`}
                        >
                          {isCheckingEmail ? "Checking email..." : "Save and Continue"}
                        </button>
                      </div>
                    )}

                      {id === "template" && (
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Choose a template
                          </label>
                          <div className="grid grid-cols-3 gap-4">
                            {["basic", "newsletter", "promotion"].map(
                              (template) => (
                                <div
                                  key={template}
                                  onClick={() => handleTemplateSelect(template)}
                                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${formData.template === template
                                    ? "border-[#c2831f] bg-[#c2831f]/10"
                                    : "border-gray-700 hover:border-gray-600"
                                    }`}
                                >
                                  <div className="h-32 bg-gray-800 rounded mb-2 flex items-center justify-center">
                                    <span className="text-sm text-gray-400">
                                      {template.charAt(0).toUpperCase() +
                                        template.slice(1)}
                                    </span>
                                  </div>
                                  <div className="text-sm font-medium text-center text-white">
                                    {template.charAt(0).toUpperCase() +
                                      template.slice(1)}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {id === "design" && (
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Design your email
                          </label>
                          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                            <p className="text-gray-400 mb-4">
                              Use the design editor to create your email
                              template. Your design will appear in the preview
                              panel.
                            </p>
                            <a
                              href="/editor"
                              className="px-4 py-2 bg-[#c2831f] text-white rounded-md hover:bg-[#d09025]"
                            >
                              Open Design Editor
                            </a>
                          </div>
                        </div>
                      )}

                      {id === "schedule" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                              When to send
                            </label>
                            <div className="space-y-3">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="scheduleType"
                                  value="immediate"
                                  checked={formData.scheduleType === "immediate"}
                                  onChange={handleChange}
                                  className="mr-3 accent-[#c2831f]"
                                />
                                <div>
                                  <div className="font-medium text-white">Send Immediately</div>
                                  <div className="text-sm text-gray-400">Send as soon as you confirm</div>
                                </div>
                              </label>

                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="scheduleType"
                                  value="scheduled"
                                  checked={formData.scheduleType === "scheduled"}
                                  onChange={handleChange}
                                  className="mr-3 accent-[#c2831f]"
                                />
                                <div>
                                  <div className="font-medium text-white">Schedule for Later</div>
                                  <div className="text-sm text-gray-400">Pick a specific date and time</div>
                                </div>
                              </label>

                              {/* <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="scheduleType"
                                  value="recurring"
                                  checked={formData.scheduleType === "recurring"}
                                  onChange={handleChange}
                                  className="mr-3 accent-[#c2831f]"
                                />
                                <div>
                                  <div className="font-medium text-white">Recurring Campaign</div>
                                  <div className="text-sm text-gray-400">Send automatically on a schedule</div>
                                </div>
                              </label> */}
                            </div>
                          </div>

                          {formData.scheduleType === "scheduled" && (
                            <div className="mt-4 p-4 bg-gray-800 rounded-lg space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Date
                                  </label>
                                  <input
                                    type="date"
                                    name="scheduledDate"
                                    min={getMinDate()}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                                    value={formData.scheduledDate}
                                    onChange={handleChange}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Time
                                  </label>
                                  <input
                                    type="time"
                                    name="scheduledTime"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                                    value={formData.scheduledTime}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                  Timezone
                                </label>
                                <select
                                  name="timezone"
                                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                                  value={formData.timezone}
                                  onChange={handleChange}
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

                          {formData.scheduleType === "recurring" && (
                            <div className="mt-4 p-4 bg-gray-800 rounded-lg space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                  Frequency
                                </label>
                                <select
                                  name="recurringFrequency"
                                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                                  value={formData.recurringFrequency}
                                  onChange={handleChange}
                                >
                                  <option value="daily">Daily</option>
                                  <option value="weekly">Weekly</option>
                                  <option value="monthly">Monthly</option>
                                </select>
                              </div>

                              {formData.recurringFrequency === "weekly" && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Days of the week
                                  </label>
                                  <div className="flex flex-wrap gap-2">
                                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                      <label key={day} className="flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={formData.recurringDays.includes(day)}
                                          onChange={() => handleRecurringDaysChange(day)}
                                          className="mr-2 accent-[#c2831f]"
                                        />
                                        <span className="text-sm text-white">{day}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Start Date
                                  </label>
                                  <input
                                    type="date"
                                    name="scheduledDate"
                                    min={getMinDate()}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                                    value={formData.scheduledDate}
                                    onChange={handleChange}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-1">
                                    End Date (optional)
                                  </label>
                                  <input
                                    type="date"
                                    name="recurringEndDate"
                                    min={formData.scheduledDate || getMinDate()}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                                    value={formData.recurringEndDate}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                  Time
                                </label>
                                <input
                                  type="time"
                                  name="scheduledTime"
                                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                                  value={formData.scheduledTime}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => markComplete(id)}
                            disabled={
                              (formData.scheduleType === "scheduled" && (!formData.scheduledDate || !formData.scheduledTime)) ||
                              (formData.scheduleType === "recurring" && (!formData.scheduledDate || !formData.scheduledTime || (formData.recurringFrequency === "weekly" && formData.recurringDays.length === 0)))
                            }
                            className={`mt-2 px-4 py-2 rounded-md ${(formData.scheduleType === "scheduled" && (!formData.scheduledDate || !formData.scheduledTime)) ||
                              (formData.scheduleType === "recurring" && (!formData.scheduledDate || !formData.scheduledTime || (formData.recurringFrequency === "weekly" && formData.recurringDays.length === 0)))
                              ? "bg-gray-700 cursor-not-allowed"
                              : "bg-[#c2831f] hover:bg-[#d09025] text-white"
                              }`}
                          >
                            Save and Continue
                          </button>
                        </div>
                      )}

                      {id === "confirm" && (
                        <div className="space-y-6">
                          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <h3 className="font-medium text-white mb-3">
                              Campaign Summary
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex">
                                <span className="w-32 text-gray-400">
                                  Campaign:
                                </span>
                                <span className="font-medium text-white">
                                  {formData.subject || "Untitled Campaign"}
                                </span>
                              </div>

                              <div className="flex">
                                <span className="w-32 text-gray-400">
                                  Recipients:
                                </span>
                                <span className="font-medium text-white">
                                  {formData.recipients === "all-subscribers" &&
                                    `All Subscribers (${contacts.length} contacts)`}
                                  {formData.recipients === "new-customers" &&
                                    `New Customers (${contacts.filter((c) => c.type === "new-customer").length
                                    } contacts)`}
                                  {formData.recipients === "vip-clients" &&
                                    `VIP Clients (${contacts.filter((c) => c.type === "vip-client").length
                                    } contacts)`}
                                  {formData.recipients === "manual" &&
                                    `Manual Entry (${getRecipientCount()} contacts)`}
                                  {formData.recipients === "file" &&
                                    `File Upload (${getRecipientCount()} contacts)`}
                                  {!formData.recipients && "Not selected"}
                                </span>
                              </div>

                              <div className="flex">
                                <span className="w-32 text-gray-400">
                                  From:
                                </span>
                                <span className="font-medium text-white">
                                  {formData.fromName} &lt;{formData.fromEmail}&gt;
                                </span>
                              </div>

                              <div className="flex">
                                <span className="w-32 text-gray-400">
                                  Subject:
                                </span>
                                <span className="font-medium text-white">
                                  {formData.subject || "Not set"}
                                </span>
                              </div>

                              <div className="flex">
                                <span className="w-32 text-gray-400">
                                  Template:
                                </span>
                                <span className="font-medium text-white">
                                  {formData.template}
                                </span>
                              </div>

                              <div className="flex">
                                <span className="w-32 text-gray-400">
                                  Schedule:
                                </span>
                                <span className="font-medium text-white">
                                  {formData.scheduleType === "immediate" && "Send Immediately"}
                                  {formData.scheduleType === "scheduled" &&
                                    `${formData.scheduledDate} at ${formData.scheduledTime}`}
                                  {formData.scheduleType === "recurring" &&
                                    `${formData.recurringFrequency} ${formData.recurringFrequency === "weekly"
                                      ? `(${formData.recurringDays.join(", ")})`
                                      : ""
                                    } starting ${formData.scheduledDate}`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {sendStatus && (
                            <div className={`mt-4 p-3 rounded ${sendStatus.success
                              ? "bg-green-900/30 text-green-400"
                              : "bg-yellow-900/30 text-yellow-400"
                              }`}>
                              {sendStatus.message}
                            </div>
                          )}

                          {batchProgress.total > 0 && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-[#c2831f] h-2 rounded-full transition-all"
                                  style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                Batch {batchProgress.current} of {batchProgress.total}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Preview Section */}
        <div className="w-[500px] border-l border-gray-800 bg-gray-900 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h3 className="font-bold text-lg">Email Preview</h3>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 h-full overflow-auto">
              <ErrorBoundary>
                <EmailPreview
                  pages={canvasPages}
                  activePage={canvasActivePage}
                  zoomLevel={canvasZoomLevel}
                  formData={formData}
                />
              </ErrorBoundary>
            </div>
          </div>

          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleSendCampaign}
              disabled={
                credits <= 0 ||
                !completedSteps.includes("recipients") ||
                !completedSteps.includes("setup") ||
                !completedSteps.includes("template") ||
                !completedSteps.includes("schedule") ||
                isSending
              }


              className={`w-full flex items-center justify-center gap-2 py-3 rounded-md text-white ${!completedSteps.includes("recipients") ||
                !completedSteps.includes("setup") ||
                !completedSteps.includes("template") ||
                !completedSteps.includes("schedule") ||
                isSending
                ? "bg-gray-800 cursor-not-allowed"
                : "bg-[#c2831f] hover:bg-[#d09025]"
                }`}
            >
              {formData.scheduleType === 'immediate' ? <Send size={16} /> : <Calendar size={16} />}
              {isSending
                ? "Processing..."
                : formData.scheduleType === 'immediate'
                  ? "Send Now"
                  : "Schedule Campaign"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}