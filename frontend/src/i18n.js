// Multilingual Localization System & Text-to-Speech Helper
// Supported Languages: English (en), Tamil (ta), Hindi (hi), Telugu (te), Malayalam (ml), Kannada (kn)

export const languages = [
  { code: "en", label: "English" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" }
];

export const translations = {
  en: {
    appTitle: "FixLink",
    tagline: "AI-Powered Multilingual Smart Maintenance System",
    badgeAi: "AI-Powered",
    userRole: "User",
    technicianRole: "Technician",
    logout: "Sign Out",

    // Navigation
    navDashboard: "Dashboard",
    navRaiseComplaint: "Raise Complaint",
    navChatAssistant: "AI Chat",
    navVideoRepair: "Live Video Repair",
    navHistory: "History",
    navProfile: "Profile",
    navTechJobs: "Assigned Jobs",
    navTechHistory: "Completed Work",
    navTechProfile: "My Profile",
    assignedJobsTitle: "Assigned Maintenance Jobs",
    techSubtitle: "Manage your assigned repair work orders and post service logs.",

    // Dashboard
    residentPortal: "FixLink Resident Portal",
    welcomeBack: "Welcome back",
    roomLocation: "Room / Location",
    userDashboardSubtitle: "Smart AI Maintenance & Assisted Repair Center",
    statActive: "Active Repairs",
    statPending: "Active Complaints",
    statCompleted: "Resolved Issues",
    statResolved: "Resolved",
    statTotal: "Total Complaints",
    statPredictive: "AI Warnings",
    statRating: "Avg Satisfaction",
    quickActions: "Quick Actions",
    btnNewComplaint: "Report New Issue",
    raiseNewComplaint: "Raise New Complaint",
    raiseNewComplaintDesc: "Voice recording, live camera snapshot, or typed description.",
    trackStatus: "Track Status & Reports",
    trackStatusDesc: "Check technician progress, service timeline, and give feedback.",
    aiRepairChatbot: "AI Repair Chatbot",
    aiRepairChatbotDesc: "Instant AI advice for troubleshooting and simple repairs.",
    recentComplaints: "Recent Complaints",
    viewAll: "View All",
    noComplaints: "No complaints filed yet.",
    noComplaintsDesc: "Click below to raise your first maintenance request.",

    // Raise Complaint
    intakeTitle: "Multimodal AI Complaint Intake",
    intakeSubtitle: "Report machine, appliance, or infrastructure issues using voice, text, photo, or live video.",
    step1Category: "Select Category",
    step2Describe: "Describe Problem",
    step3Location: "Service Location",
    recordVoice: "Record Voice",
    closeMic: "Close Mic",
    takePhoto: "Take / Upload Photo",
    closeCamera: "Close Camera",
    defectPhotoAttached: "Defect Photo Attached",
    defectPhotoReady: "Ready for AI diagnosis and technician reference.",
    btnRemove: "Remove",
    labelTitle: "Issue Title",
    placeholderTitle: "e.g. Washroom tap leaking",
    labelDescription: "Detailed Description",
    placeholderDescription: "Describe what happened, unusual sounds, smells, or click 'Record Voice'...",
    askAiDiagnosis: "Ask AI for Solution & Diagnosis",
    aiAnalyzing: "AI Analyzing Problem...",
    selected: "Selected",
    labelLocation: "Location / Room No.",
    placeholderLocation: "e.g. Block B, Room 304",
    labelContact: "Contact Number",
    placeholderContact: "e.g. +91 98765 43210",
    btnDiagnose: "Analyze with AI",
    btnSubmit: "Submit Maintenance Ticket",
    submitting: "Submitting Ticket...",

    // Confirmation & Safety
    confirmTitle: "AI Understanding Confirmation",
    confirmQuestion: "Is my understanding of your problem correct?",
    btnYes: "Yes, Correct",
    btnNo: "No, Clarify",
    clarificationHelp: "Help AI understand: What is different about the problem?",
    clarificationPlaceholder: "e.g. Actually the pipe isn't leaking...",
    cancel: "Cancel",
    updating: "Updating...",
    reanalyzeAi: "Re-analyze with AI",
    safeTitle: "Safe for Guided DIY Repair",
    unsafeTitle: "Hazard Detected - Certified Technician Required",
    safeDiySolution: "AI Solution: Safe for Guided Self-Repair",
    hazardousAlert: "AI Hazard Alert: Certified Technician Required",
    solutionGuide: "Solution Guide",
    viewFullGuide: "View Full Guide",
    launchLiveHelp: "Launch Live AR Help",
    safetyCautionLabel: "Safety Caution",
    safetyCautionText: "Do not touch dangerous fixtures. A certified technician will be dispatched.",
    btnViewDiy: "Open Step-by-Step DIY Guide",
    btnAutoDispatch: "Auto-Dispatch Nearest Technician",

    // Technician
    techDashboardTitle: "Technician Dispatch Console",
    availabilityLabel: "Availability Status",
    statusAvailable: "Available for Dispatch",
    statusBusy: "Busy / On Task",
    btnAccept: "Accept Task",
    btnReject: "Decline",
    btnStartProgress: "Mark In Progress",
    btnCompleteProof: "Complete & Upload Proof",
    noJobsAssigned: "No pending repair orders assigned to your queue.",

    // Categories
    cat_electrical: "Electrical",
    cat_plumbing: "Plumbing",
    cat_infrastructure: "Infrastructure",
    cat_cleaning: "Sanitation",
    cat_security: "Security",
    cat_network: "Internet / Wi-Fi",
    cat_other: "General Maintenance"
  },
  ta: {
    appTitle: "பிக்ஸ்லிங்க்",
    tagline: "AI-இயங்கும் பலமொழி ஸ்மார்ட் பராமரிப்பு உதவி அமைப்பு",
    badgeAi: "AI-இயங்கும் தளம்",
    userRole: "பயனர்",
    technicianRole: "தொழில்நுட்ப வல்லுநர்",
    logout: "வெளியேறு",

    // Navigation
    navDashboard: "முகப்பு",
    navRaiseComplaint: "புகார் பதிவு செய்",
    navChatAssistant: "AI அரட்டை",
    navVideoRepair: "நேரலை வீடியோ பழுது",
    navHistory: "புகார் வரலாறு",
    navProfile: "சுயவிவரம்",
    navTechJobs: "ஒதுக்கப்பட்ட பணிகள்",
    navTechHistory: "முடிந்த பணிகள்",
    navTechProfile: "என் விவரம்",
    assignedJobsTitle: "ஒதுக்கப்பட்ட பழுதுபார்ப்பு பணிகள்",
    techSubtitle: "உங்கள் பராமரிப்பு பணி ஆணைகளை நிர்வகிக்கவும்.",

    // Dashboard
    residentPortal: "FixLink குடியிருப்பு மையம்",
    welcomeBack: "மீண்டும் வருக",
    roomLocation: "அறை / இருப்பிடம்",
    userDashboardSubtitle: "ஸ்மார்ட் AI பராமரிப்பு மற்றும் பழுதுபார்ப்பு மையம்",
    statActive: "செயலில் உள்ளவை",
    statPending: "நிலுவை புகார்கள்",
    statCompleted: "தீர்க்கப்பட்டவை",
    statResolved: "தீர்க்கப்பட்டவை",
    statTotal: "மொத்த புகார்கள்",
    statPredictive: "AI எச்சரிக்கைகள்",
    statRating: "மதிப்பீடு",
    quickActions: "விரைவு நடவடிக்கைகள்",
    btnNewComplaint: "புதிய பிரச்சனை பதிவு",
    raiseNewComplaint: "புதிய பிரச்சனை பதிவு",
    raiseNewComplaintDesc: "குரல் பதிவு, நேரலை கேமரா புகைப்படம் அல்லது உரை விளக்கம்.",
    trackStatus: "புகார் நிலை & அறிக்கைகள்",
    trackStatusDesc: "டெக்னீஷியன் பணி முன்னேற்றம், காலக்கெடு மற்றும் கருத்துக்களை வழங்கவும்.",
    aiRepairChatbot: "AI பழுது வழிகாட்டி",
    aiRepairChatbotDesc: "உபகரண பழுதுகளுக்கு உடனடி AI வழிகாட்டுதல் மற்றும் எளிய தீர்வுகள்.",
    recentComplaints: "சமீபத்திய புகார்கள்",
    viewAll: "அனைத்தும் காண்க",
    noComplaints: "இதுவரை புகார்கள் எதுவும் இல்லை.",
    noComplaintsDesc: "உங்கள் முதல் பராமரிப்பு கோரிக்கையை பதிவு செய்ய கீழே கிளிக் செய்க.",

    // Raise Complaint
    intakeTitle: "பல்வகை AI பராமரிப்புப் பதிவு",
    intakeSubtitle: "குரல், உரை, புகைப்படம் அல்லது வீடியோ மூலம் மின், குழாய் அல்லது இயந்திர பழுதை தெரிவிக்கவும்.",
    step1Category: "பழுது பிரிவு தேர்வு செய்க",
    step2Describe: "பிரச்சனை விளக்கம்",
    step3Location: "சேவை இருப்பிடம்",
    recordVoice: "குரல் பதிவு",
    closeMic: "மைக் மூடு",
    takePhoto: "படம் எடு / பதிவேற்று",
    closeCamera: "கேமரா மூடு",
    defectPhotoAttached: "பழுது படம் இணைக்கப்பட்டது",
    defectPhotoReady: "AI ஆய்வு மற்றும் தொழில்நுட்ப குறிப்புக்கு தயாராக உள்ளது.",
    btnRemove: "நீக்கு",
    labelTitle: "புகார் தலைப்பு",
    placeholderTitle: "எ.கா. வாஷ்ரூம் குழாய் கசிகிறது",
    labelDescription: "முழு விவரம்",
    placeholderDescription: "நடந்த பிரச்சனை, சத்தம் அல்லது சேதத்தின் விவரங்களை கூறவும்...",
    askAiDiagnosis: "AI தீர்வு & பகுப்பாய்வு பெறு",
    aiAnalyzing: "AI ஆராய்கிறது...",
    selected: "தேர்ந்தெடுக்கப்பட்டது",
    labelLocation: "இடம் / அறை எண்",
    placeholderLocation: "எ.கா. பிளாக் B, அறை 304",
    labelContact: "தொடர்பு எண்",
    placeholderContact: "எ.கா. +91 98765 43210",
    btnDiagnose: "AI மூலம் பரிசோதி",
    btnSubmit: "புகாரைப் பதிவு செய்",
    submitting: "பதிவு செய்யப்படுகிறது...",

    // Confirmation & Safety
    confirmTitle: "AI புரிதல் உறுதிப்படுத்தல்",
    confirmQuestion: "உங்களின் பிரச்சனை குறித்த எனது புரிதல் சரியானதா?",
    btnYes: "ஆம், சரியானது",
    btnNo: "இல்லை, திருத்துகிறேன்",
    clarificationHelp: "AI-க்கு விளக்குங்கள்: பிரச்சனை எதில் வேறுபடுகிறது?",
    clarificationPlaceholder: "விபரத்தை இங்கே உள்ளிடவும்...",
    cancel: "ரத்து",
    updating: "புதுப்பிக்கிறது...",
    reanalyzeAi: "மீண்டும் ஆராய்",
    safeTitle: "பாதுகாப்பான பழுதுபார்ப்பு (சுயமாக செய்யலாம்)",
    unsafeTitle: "அபாயம் கண்டறியப்பட்டது - தகுதியான வல்லுநர் தேவை",
    safeDiySolution: "AI தீர்வு: சுயமாக சரிசெய்யலாம்",
    hazardousAlert: "AI எச்சரிக்கை: வல்லுநர் தேவை",
    solutionGuide: "தீர்வு வழிகாட்டி",
    viewFullGuide: "முழு வழிகாட்டி",
    launchLiveHelp: "நேரலை பழுது உதவி",
    safetyCautionLabel: "பாதுகாப்பு எச்சரிக்கை",
    safetyCautionText: "மின்சார உபகரணங்களை தொடாதீர்கள். தகுதியான வல்லுநர் அனுப்பப்படுவார்.",
    btnViewDiy: "படிப்படியான வழிகாட்டியைத் திற",
    btnAutoDispatch: "வல்லுநரை உடனடியாக நியமிக்கவும்",

    // Technician
    techDashboardTitle: "தொழில்நுட்ப வல்லுநர் கட்டுப்பாட்டு பலகை",
    availabilityLabel: "தற்போதைய நிலை",
    statusAvailable: "பணிக்கு தயார் (Available)",
    statusBusy: "வேலையில் உள்ளார் (Busy)",
    btnAccept: "பணியை ஏற்றுக்கொள்",
    btnReject: "நிராகரி",
    btnStartProgress: "வேலை நடக்கிறது என மாற்று",
    btnCompleteProof: "நிறைவு செய் & சான்று பதிவேற்று",
    noJobsAssigned: "தற்போது புதிய பணிகள் எதுவும் நிலுவையில் இல்லை.",

    // Categories
    cat_electrical: "மின்சாரம்",
    cat_plumbing: "குழாய் & நீர்",
    cat_infrastructure: "கட்டமைப்பு",
    cat_cleaning: "சுகாதாரம்",
    cat_security: "பாதுகாப்பு",
    cat_network: "இணையம்",
    cat_other: "மற்றவை"
  },
  ml: {
    appTitle: "FixLink",
    tagline: "AI സ്മാർട്ട് മെയിന്റനൻസ് സിസ്റ്റം",
    badgeAi: "AI പവേർഡ്",
    userRole: "ഉപഭോക്താവ്",
    technicianRole: "ടെക്നീഷ്യൻ",
    logout: "ലോഗ് ഔട്ട്",

    // Navigation
    navDashboard: "ഡാഷ്‌ബോർഡ്",
    navRaiseComplaint: "പരാതി നൽകുക",
    navChatAssistant: "AI ചാറ്റ്",
    navVideoRepair: "വീഡിയോ റിപ്പയർ",
    navHistory: "ചരിത്രം",
    navProfile: "പ്രൊഫൈൽ",
    navTechJobs: "ജോലികൾ",
    navTechHistory: "പൂർത്തിയാക്കിയവ",
    navTechProfile: "എന്റെ പ്രൊഫൈൽ",
    assignedJobsTitle: "നിയോഗിച്ച ജോലികൾ",
    techSubtitle: "നിങ്ങളുടെ മെയിന്റനൻസ് വർക്ക് ഓർഡറുകൾ കൈകാര്യം ചെയ്യുക.",

    // Dashboard
    residentPortal: "FixLink റസിഡന്റ് പോർട്ടൽ",
    welcomeBack: "സ്വാഗതം",
    roomLocation: "മുറി / സ്ഥലം",
    userDashboardSubtitle: "സ്മാർട്ട് AI റിപ്പയർ കേന്ദ്രം",
    statActive: "സജീവമായവ",
    statPending: "സജീവ പരാതികൾ",
    statCompleted: "പരിഹരിച്ചവ",
    statResolved: "പരിഹരിച്ചവ",
    statTotal: "ആകെ പരാതികൾ",
    statPredictive: "AI മുന്നറിയിപ്പുകൾ",
    statRating: "റേറ്റിംഗ്",
    quickActions: "ദ്രുത പ്രവർത്തനങ്ങൾ",
    btnNewComplaint: "പുതിയ പ്രശ്നം റിപ്പോർട്ട് ചെയ്യുക",
    raiseNewComplaint: "പുതിയ പരാതി നൽകുക",
    raiseNewComplaintDesc: "ശബ്ദ റെക്കോർഡിംഗ്, ലൈവ് ക്യാമറ ഫോട്ടോ അല്ലെങ്കിൽ ടെക്സ്റ്റ് വിവരണം.",
    trackStatus: "സ്റ്റാറ്റസും റിപ്പോർട്ടുകളും",
    trackStatusDesc: "ടെക്നീഷ്യന്റെ പുരോഗതി, സർവീസ് സമയം പരിശോധിച്ച് ഫീഡ്‌ബാക്ക് നൽകുക.",
    aiRepairChatbot: "AI റിപ്പയർ ചാറ്റ്ബോട്ട്",
    aiRepairChatbotDesc: "ലളിതമായ അറ്റകുറ്റപ്പണികൾക്കുള്ള തത്സമയ AI മാർഗ്ഗനിർദ്ദേശങ്ങൾ.",
    recentComplaints: "സമീപകാല പരാതികൾ",
    viewAll: "എല്ലാം കാണുക",
    noComplaints: "പരാതികളൊന്നും ഇതുവരെ നൽകിയിട്ടില്ല.",
    noComplaintsDesc: "നിങ്ങളുടെ ആദ്യ മെയിന്റനൻസ് പരാതി രജിസ്റ്റർ ചെയ്യാൻ താഴെ ക്ലിക്ക് ചെയ്യുക.",

    // Raise Complaint
    intakeTitle: "AI പരാതി രജിസ്ട്രേഷൻ",
    intakeSubtitle: "ശബ്ദം, ടെക്സ്റ്റ് അല്ലെങ്കിൽ ഫോട്ടോ വഴി റിപ്പോർട്ട് ചെയ്യുക.",
    step1Category: "വിഭാഗം തിരഞ്ഞെടുക്കുക",
    step2Describe: "പ്രശ്നം വിവരിക്കുക",
    step3Location: "സർവീസ് സ്ഥലം",
    recordVoice: "ശബ്ദം റെക്കോർഡ് ചെയ്യുക",
    closeMic: "മൈക്ക് ഓഫ് ചെയ്യുക",
    takePhoto: "ഫോട്ടോ എടുക്കുക",
    closeCamera: "ക്യാമറ ഓഫ് ചെയ്യുക",
    defectPhotoAttached: "ഫോട്ടോ ചേർത്തു",
    defectPhotoReady: "AI പരിശോധനയ്ക്കും സാങ്കേതിക റഫറൻസിനും തയ്യാറാണ്.",
    btnRemove: "ഒഴിവാക്കുക",
    labelTitle: "തലക്കെട്ട്",
    placeholderTitle: "ഉദാ: ഫാൻ കറങ്ങുന്നില്ല",
    labelDescription: "വിവരണം",
    placeholderDescription: "പ്രശ്നത്തെക്കുറിച്ചുള്ള വിശദാംശങ്ങൾ നൽകുക...",
    askAiDiagnosis: "AI പരിഹാരവും വിശകലനവും ചോദിക്കുക",
    aiAnalyzing: "AI പരിശോധിക്കുന്നു...",
    selected: "തിരഞ്ഞെടുത്തു",
    labelLocation: "സ്ഥലം / റൂം നമ്പർ",
    placeholderLocation: "ഉദാ: ബ്ലോക്ക് ബി, റൂം 304",
    labelContact: "ഫോൺ നമ്പർ",
    placeholderContact: "ഉദാ: +91 98765 43210",
    btnDiagnose: "AI പരിശോധന",
    btnSubmit: "പരാതി സമർപ്പിക്കുക",
    submitting: "സമർപ്പിക്കുന്നു...",

    // Confirmation & Safety
    confirmTitle: "AI സ്ഥിരീകരണം",
    confirmQuestion: "നിങ്ങളുടെ പ്രശ്നത്തെക്കുറിച്ചുള്ള എന്റെ ധാരണ ശരിയാണോ?",
    btnYes: "അതെ, ശരിയാണ്",
    btnNo: "അല്ല, മാറ്റം വരുത്തുക",
    clarificationHelp: "AI-ക്ക് വ്യക്തമാക്കുക: പ്രശ്നം എന്താണ്?",
    clarificationPlaceholder: "വിശദാംശങ്ങൾ ഇവിടെ നൽകുക...",
    cancel: "റദ്ദാക്കുക",
    updating: "പുതുക്കുന്നു...",
    reanalyzeAi: "വീണ്ടും പരിശോധിക്കുക",
    safeTitle: "സുരക്ഷിതം (സ്വയം ചെയ്യാം)",
    unsafeTitle: "ടെക്നീഷ്യൻ ആവശ്യമാണ്",
    safeDiySolution: "AI പരിഹാരം: സ്വയം പരിഹരിക്കാം",
    hazardousAlert: "AI മുന്നറിയിപ്പ്: ടെക്നീഷ്യൻ ആവശ്യമാണ്",
    solutionGuide: "പരിഹാര മാർഗ്ഗനിർദ്ദേശം",
    viewFullGuide: "പൂർണ്ണ വിവരണം",
    launchLiveHelp: "തത്സമയ ക്യാമറ സഹായം",
    safetyCautionLabel: "സുരക്ഷാ മുന്നറിയിപ്പ്",
    safetyCautionText: "അപകടകരമായ ഭാഗങ്ങളിൽ സ്പർശിക്കരുത്. സാങ്കേതിക വിദഗ്ദ്ധൻ എത്തും.",
    btnViewDiy: "നിർദ്ദേശങ്ങൾ കാണുക",
    btnAutoDispatch: "ടെക്നീഷ്യനെ നിയോഗിക്കുക",

    // Technician
    techDashboardTitle: "ടെക്നീഷ്യൻ പാനൽ",
    availabilityLabel: "ലഭ്യത",
    statusAvailable: "ലഭ്യമാണ്",
    statusBusy: "ജോലിയിലാണ്",
    btnAccept: "സ്വീകരിക്കുക",
    btnReject: "നിരസിക്കുക",
    btnStartProgress: "പുരോഗതിയിൽ",
    btnCompleteProof: "പൂർത്തിയാക്കുക",
    noJobsAssigned: "ജോലികൾ ലഭ്യമല്ല.",

    // Categories
    cat_electrical: "വൈദ്യുതി",
    cat_plumbing: "പ്ലംബിംഗ്",
    cat_infrastructure: "അടിസ്ഥാന സൗകര്യങ്ങൾ",
    cat_cleaning: "ശുചീകരണം",
    cat_security: "സുരക്ഷ",
    cat_network: "നെറ്റ്‌വർക്ക് / ഇന്റർനെറ്റ്",
    cat_other: "മറ്റു കാര്യങ്ങൾ"
  },
  hi: {
    appTitle: "FixLink",
    tagline: "AI-संचालित बहुभाषी स्मार्ट रखरखाव और मरम्मत सहायता प्रणाली",
    badgeAi: "AI-संचालित",
    userRole: "उपयोगकर्ता",
    technicianRole: "तकनीशियन",
    logout: "लॉग आउट",

    // Navigation
    navDashboard: "डैशबोर्ड",
    navRaiseComplaint: "शिकायत दर्ज करें",
    navChatAssistant: "AI चैट",
    navVideoRepair: "लाइव वीडियो रिपेयर",
    navHistory: "शिकायत इतिहास",
    navProfile: "प्रोफ़ाइल",
    navTechJobs: "आवंटित कार्य",
    navTechHistory: "पूर्ण कार्य",
    navTechProfile: "मेरी प्रोफ़ाइल",
    assignedJobsTitle: "आवंटित कार्य",
    techSubtitle: "अपने रखरखाव कार्यों को प्रबंधित करें।",

    // Dashboard
    residentPortal: "FixLink निवासी पोर्टल",
    welcomeBack: "वापसी पर स्वागत है",
    roomLocation: "कमरा / स्थान",
    userDashboardSubtitle: "स्मार्ट AI रखरखाव एवं सहायता केंद्र",
    statActive: "सक्रिय कार्य",
    statPending: "सक्रिय शिकायतें",
    statCompleted: "सुलझाए गए",
    statResolved: "सुलझाए गए",
    statTotal: "कुल शिकायतें",
    statPredictive: "AI अलर्ट",
    statRating: "संतुष्टि दर",
    quickActions: "त्वरित कार्रवाई",
    btnNewComplaint: "नई समस्या दर्ज करें",
    raiseNewComplaint: "नई शिकायत दर्ज करें",
    raiseNewComplaintDesc: "वॉयस रिकॉर्डिंग, लाइव कैमरा फोटो या लिखित विवरण।",
    trackStatus: "स्थिति और रिपोर्ट ट्रैक करें",
    trackStatusDesc: "तकनीशियन की प्रगति, समय-सीमा जांचें और फीडबैक दें।",
    aiRepairChatbot: "AI मरम्मत चैटबॉट",
    aiRepairChatbotDesc: "उपकरणों के त्वरित समाधान और सलाह के लिए AI सहायता।",
    recentComplaints: "हाल की शिकायतें",
    viewAll: "सभी देखें",
    noComplaints: "अभी तक कोई शिकायत नहीं है।",
    noComplaintsDesc: "अपनी पहली शिकायत दर्ज करने के लिए नीचे क्लिक करें।",

    // Raise Complaint
    intakeTitle: "मल्टीमॉडल AI शिकायत पंजीकरण",
    intakeSubtitle: "आवाज, टेक्स्ट, फोटो या वीडियो द्वारा मशीन या उपकरण की मरम्मत दर्ज करें।",
    step1Category: "श्रेणी चुनें",
    step2Describe: "समस्या का विवरण दें",
    step3Location: "सेवा स्थान",
    recordVoice: "आवाज रिकॉर्ड करें",
    closeMic: "माइक बंद करें",
    takePhoto: "फोटो लें / अपलोड करें",
    closeCamera: "कैमरा बंद करें",
    defectPhotoAttached: "दोष फोटो संलग्न",
    defectPhotoReady: "AI विश्लेषण और तकनीशियन संदर्भ के लिए तैयार।",
    btnRemove: "हटाएं",
    labelTitle: "शिकायत का शीर्षक",
    placeholderTitle: "उदा: वॉशरूम का नल लीक हो रहा है",
    labelDescription: "विस्तृत विवरण",
    placeholderDescription: "समस्या का विस्तार से विवरण दें...",
    askAiDiagnosis: "AI से समाधान और निदान पूछें",
    aiAnalyzing: "AI समस्या का विश्लेषण कर रहा है...",
    selected: "चयनित",
    labelLocation: "स्थान / कमरा नंबर",
    placeholderLocation: "उदा: ब्लॉक बी, कमरा 304",
    labelContact: "फ़ोन नंबर",
    placeholderContact: "उदा: +91 98765 43210",
    btnDiagnose: "AI विश्लेषण",
    btnSubmit: "शिकायत जमा करें",
    submitting: "दर्ज किया जा रहा है...",

    // Confirmation & Safety
    confirmTitle: "AI समझ की पुष्टि",
    confirmQuestion: "क्या आपकी समस्या के बारे में मेरी समझ सही है?",
    btnYes: "हाँ, सही है",
    btnNo: "नहीं, स्पष्ट करें",
    clarificationHelp: "AI को समझाएं: समस्या में क्या अंतर है?",
    clarificationPlaceholder: "विवरण यहाँ लिखें...",
    cancel: "रद्द करें",
    updating: "अपडेट हो रहा है...",
    reanalyzeAi: "पुनः विश्लेषण करें",
    safeTitle: "सुरक्षित मरम्मत (स्वयं कर सकते हैं)",
    unsafeTitle: "खतरा - तकनीशियन की आवश्यकता है",
    safeDiySolution: "AI समाधान: सुरक्षित स्वयं-मरम्मत",
    hazardousAlert: "AI खतरा चेतावनी: तकनीशियन की आवश्यकता है",
    solutionGuide: "समाधान मार्गदर्शिका",
    viewFullGuide: "पूरी गाइड देखें",
    launchLiveHelp: "लाइव सहायता शुरू करें",
    safetyCautionLabel: "सुरक्षा सावधानी",
    safetyCautionText: "खतरनाक उपकरणों को न छुएं। तकनीशियन भेजा जाएगा।",
    btnViewDiy: "मार्गदर्शिका देखें",
    btnAutoDispatch: "तकनीशियन भेजें",

    // Technician
    techDashboardTitle: "तकनीशियन कंसोल",
    availabilityLabel: "उपलब्धता",
    statusAvailable: "उपलब्ध",
    statusBusy: "व्यस्त",
    btnAccept: "स्वीकार करें",
    btnReject: "अस्वीकार करें",
    btnStartProgress: "प्रगति पर है",
    btnCompleteProof: "पूर्ण करें",
    noJobsAssigned: "कोई नया काम नहीं है।",

    // Categories
    cat_electrical: "विद्युत",
    cat_plumbing: "नल और पाइप",
    cat_infrastructure: "बुनियादी ढांचा",
    cat_cleaning: "सफाई एवं स्वच्छता",
    cat_security: "सुरक्षा",
    cat_network: "इंटरनेट / वाई-फाई",
    cat_other: "अन्य रखरखाव"
  },
  te: {
    appTitle: "FixLink",
    tagline: "AI స్మార్ట్ నిర్వహణ వ్యవస్థ",
    badgeAi: "AI ఆధారిత",
    userRole: "వినియోగదారు",
    technicianRole: "టెక్నీషియన్",
    logout: "సైన్ అవుట్",

    // Navigation
    navDashboard: "డ్యాష్‌బోర్డ్",
    navRaiseComplaint: "ఫిర్యాదు చేయండి",
    navChatAssistant: "AI చాట్",
    navVideoRepair: "లైవ్ వీడియో రిపేర్",
    navHistory: "చరిత్ర",
    navProfile: "ప్రొఫైల్",
    navTechJobs: "కేటాయించిన పనులు",
    navTechHistory: "పూర్తయిన పనులు",
    navTechProfile: "నా ప్రొఫైల్",
    assignedJobsTitle: "కేటాయించిన పనులు",
    techSubtitle: "మీ నిర్వహణ పనులను నిర్వహించండి.",

    // Dashboard
    residentPortal: "FixLink రెసిడెంట్ పోర్టల్",
    welcomeBack: "స్వాగతం",
    roomLocation: "గది / స్థానం",
    userDashboardSubtitle: "స్మార్ట్ AI రిపేర్ కేంద్రం",
    statActive: "సక్రియ పనులు",
    statPending: "సక్రియ ఫిర్యాదులు",
    statCompleted: "పరిష్కరించబడినవి",
    statResolved: "పరిష్కరించబడినవి",
    statTotal: "మొత్తం ఫిర్యాదులు",
    statPredictive: "AI హెచ్చరికలు",
    statRating: "రేటింగ్",
    quickActions: "త్వరిత చర్యలు",
    btnNewComplaint: "సమస్యను నివేదించండి",
    raiseNewComplaint: "కొత్త ఫిర్యాదు చేయండి",
    raiseNewComplaintDesc: "వాయిస్ రికార్డింగ్, లైవ్ కెమెరా ఫోటో లేదా టెక్స్ట్ వివరణ.",
    trackStatus: "స్థితి & నివేదికలు",
    trackStatusDesc: "టెక్నీషియన్ పురోగతిని పరిశీలించి ఫీడ్‌బ్యాక్ ఇవ్వండి.",
    aiRepairChatbot: "AI మరమ్మతు చాట్‌బాట్",
    aiRepairChatbotDesc: "పరికరాల సమస్యలకు తక్షణ AI మార్గదర్శకత్వం.",
    recentComplaints: "ఇటీవలి ఫిర్యాదులు",
    viewAll: "అన్నీ చూడండి",
    noComplaints: "ఇంకా ఎలాంటి ఫిర్యాదులు లేవు.",
    noComplaintsDesc: "మీ మొదటి ఫిర్యాదు నమోదు చేయడానికి క్రింద క్లిక్ చేయండి.",

    // Raise Complaint
    intakeTitle: "AI సమస్యల నమోదు",
    intakeSubtitle: "వాయిస్, టెక్స్ట్ లేదా ఫోటో ద్వారా సమస్యలను నివేదించండి.",
    step1Category: "వర్గాన్ని ఎంచుకోండి",
    step2Describe: "సమస్యను వివరించండి",
    step3Location: "సేవా స్థానం",
    recordVoice: "వాయిస్ రికార్డ్ చేయండి",
    closeMic: "మైక్ మూసివేయండి",
    takePhoto: "ఫోటో తీయండి",
    closeCamera: "కెమెరా మూసివేయండి",
    defectPhotoAttached: "లోపం ఫోటో జోడించబడింది",
    defectPhotoReady: "AI విశ్లేషణకు సిద్ధంగా ఉంది.",
    btnRemove: "తొలగించండి",
    labelTitle: "సమస్య శీర్షిక",
    placeholderTitle: "ఉదా: కుళాయి లీక్ అవుతోంది",
    labelDescription: "వివరణ",
    placeholderDescription: "సమస్య గురించి వివరించండి...",
    askAiDiagnosis: "AI పరిష్కారం & విశ్లేషణ పొందండి",
    aiAnalyzing: "AI సమస్యను విశ్లేషిస్తోంది...",
    selected: "ఎంచుకోబడింది",
    labelLocation: "స్థానం / గది సంఖ్య",
    placeholderLocation: "ఉదా: బ్లాక్ బి, గది 304",
    labelContact: "సంప్రదింపు నంబర్",
    placeholderContact: "ఉదా: +91 98765 43210",
    btnDiagnose: "AI విశ్లేషణ",
    btnSubmit: "ఫిర్యాదు సమర్పించండి",
    submitting: "సమర్పిస్తోంది...",

    // Confirmation & Safety
    confirmTitle: "AI నిర్ధారణ",
    confirmQuestion: "మీ సమస్యపై నా అవగాహన సరైనదేనా?",
    btnYes: "అవును, సరైనది",
    btnNo: "కాదు, సరిచేయండి",
    clarificationHelp: "AIకి స్పష్టత ఇవ్వండి: సమస్య ఏమిటి?",
    clarificationPlaceholder: "వివరాలను ఇక్కడ నమోదు చేయండి...",
    cancel: "రద్దు చేయండి",
    updating: "నవీకరిస్తోంది...",
    reanalyzeAi: "మళ్ళీ విశ్లేషించండి",
    safeTitle: "సురక్షిత మరమ్మత్తు (మీరే చేయవచ్చు)",
    unsafeTitle: "ప్రమాదం - టెక్నీషియన్ అవసరం",
    safeDiySolution: "AI పరిష్కారం: సురక్షిత మరమ్మత్తు",
    hazardousAlert: "AI హెచ్చరిక: టెక్నీషియన్ అవసరం",
    solutionGuide: "పరిష్కార గైడ్",
    viewFullGuide: "పూర్తి గైడ్ చూడండి",
    launchLiveHelp: "లైవ్ సహాయం ప్రారంభించండి",
    safetyCautionLabel: "భద్రతా హెచ్చరిక",
    safetyCautionText: "ప్రమాదకర భాగాలను తాకవద్దు. టెక్నీషియన్ వస్తారు.",
    btnViewDiy: "రిపేర్ సూచనలు చూడండి",
    btnAutoDispatch: "టెక్నీషియన్‌ను పంపండి",

    // Technician
    techDashboardTitle: "టెక్నీషియన్ డ్యాష్‌బోర్డ్",
    availabilityLabel: "లభ్యత స్థితి",
    statusAvailable: "అందుబాటులో ఉన్నారు",
    statusBusy: "పనిలో ఉన్నారు",
    btnAccept: "అంగీకరించు",
    btnReject: "తిరస్కరించు",
    btnStartProgress: "ప్రగతిలో ఉంది",
    btnCompleteProof: "పూర్తి చేయండి",
    noJobsAssigned: "ప్రస్తుతం పనులేవీ లేవు.",

    // Categories
    cat_electrical: "విద్యుత్",
    cat_plumbing: "ప్లంబింగ్",
    cat_infrastructure: "మౌలిక సదుపాయాలు",
    cat_cleaning: "పరిశుభ్రత",
    cat_security: "భద్రత",
    cat_network: "నెట్‌వర్క్",
    cat_other: "ఇతర పనులు"
  },
  kn: {
    appTitle: "FixLink",
    tagline: "AI ಸ್ಮಾರ್ಟ್ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆ",
    badgeAi: "AI ಚಾಲಿತ",
    userRole: "ಬಳಕೆದಾರ",
    technicianRole: "ತಂತ್ರಜ್ಞ",
    logout: "ಸೈನ್ ಔಟ್",

    // Navigation
    navDashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    navRaiseComplaint: "ದೂರು ದಾಖಲಿಸಿ",
    navChatAssistant: "AI ಚಾಟ್",
    navVideoRepair: "ವೀಡಿಯೊ ರಿಪೇರಿ",
    navHistory: "ಇತಿಹಾಸ",
    navProfile: "ಪ್ರೊಫೈಲ್",
    navTechJobs: "ನಿಯೋಜಿತ ಕೆಲಸಗಳು",
    navTechHistory: "ಪೂರ್ಣಗೊಂಡ ಕೆಲಸಗಳು",
    navTechProfile: "ನನ್ನ ಪ್ರೊಫೈಲ್",
    assignedJobsTitle: "ನಿಯೋಜಿತ ಕೆಲಸಗಳು",
    techSubtitle: "ನಿಮ್ಮ ನಿರ್ವಹಣಾ ಕೆಲಸಗಳನ್ನು ನಿರ್ವಹಿಸಿ.",

    // Dashboard
    residentPortal: "FixLink ನಿವಾಸಿ ಪೋರ್ಟಲ್",
    welcomeBack: "ಸ್ವಾಗತ",
    roomLocation: "ಕೊಠಡಿ / ಸ್ಥಳ",
    userDashboardSubtitle: "ಸ್ಮಾರ್ಟ್ AI ದುರಸ್ತಿ ಕೇಂದ್ರ",
    statActive: "ಸಕ್ರಿಯ ಕೆಲಸಗಳು",
    statPending: "ಸಕ್ರಿಯ ದೂರುಗಳು",
    statCompleted: "ಪರಿಹರಿಸಲಾಗಿದೆ",
    statResolved: "ಪರಿಹರಿಸಲಾಗಿದೆ",
    statTotal: "ಒಟ್ಟು ದೂರುಗಳು",
    statPredictive: "AI ಎಚ್ಚರಿಕೆಗಳು",
    statRating: "ರೇಟಿಂಗ್",
    quickActions: "ತ್ವರಿತ ಕ್ರಿಯೆಗಳು",
    btnNewComplaint: "ಹೊಸ ದೂರು ದಾಖಲಿಸಿ",
    raiseNewComplaint: "ಹೊಸ ದೂರು ದಾಖಲಿಸಿ",
    raiseNewComplaintDesc: "ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್, ಲೈವ್ ಕ್ಯಾಮೆರಾ ಫೋಟೋ ಅಥವಾ ಪಠ್ಯ ವಿವರಣೆ.",
    trackStatus: "ಸ್ಥಿತಿ ಮತ್ತು ವರದಿಗಳು",
    trackStatusDesc: "ತಂತ್ರಜ್ಞರ ಪ್ರಗತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಪ್ರತಿಕ್ರಿಯೆ ನೀಡಿ.",
    aiRepairChatbot: "AI ರಿಪೇರಿ ಚಾಟ್‌ಬಾಟ್",
    aiRepairChatbotDesc: "ಉಪಕರಣಗಳ ರಿಪೇರಿಗೆ ತಕ್ಷಣದ AI ಮಾರ್ಗದರ್ಶನ.",
    recentComplaints: "ಇತ್ತೀಚಿನ ದೂರುಗಳು",
    viewAll: "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ",
    noComplaints: "ಇನ್ನೂ ಯಾವುದೇ ದೂರುಗಳಿಲ್ಲ.",
    noComplaintsDesc: "ನಿಮ್ಮ ಮೊದಲ ದೂರನ್ನು ದಾಖಲಿಸಲು ಕೆಳಗೆ ಕ್ಲಿಕ್ ಮಾಡಿ.",

    // Raise Complaint
    intakeTitle: "AI ದೂರು ದಾಖಲಾತಿ",
    intakeSubtitle: "ಧ್ವನಿ, ಪಠ್ಯ ಅಥವಾ ಫೋಟೋ ಮೂಲಕ ದೂರು ನೀಡಿ.",
    step1Category: "ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    step2Describe: "ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ",
    step3Location: "ಸೇವಾ ಸ್ಥಳ",
    recordVoice: "ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಮಾಡಿ",
    closeMic: "ಮೈಕ್ ಮುಚ್ಚಿ",
    takePhoto: "ಫೋಟೋ ತೆಗೆಯಿರಿ",
    closeCamera: "ಕ್ಯಾಮೆರಾ ಮುಚ್ಚಿ",
    defectPhotoAttached: "ದೋಷದ ಫೋಟೋ ಲಗತ್ತಿಸಲಾಗಿದೆ",
    defectPhotoReady: "AI ವಿಶ್ಲೇಷಣೆಗೆ ಸಿದ್ಧವಾಗಿದೆ.",
    btnRemove: "ತೆಗೆದುಹಾಕಿ",
    labelTitle: "ದೂರಿನ ಶೀರ್ಷಿಕೆ",
    placeholderTitle: "ಉದಾ: ನಲ್ಲಿ ನೀರು ಸೋರುತ್ತಿದೆ",
    labelDescription: "ಸಂಪೂರ್ಣ ವಿವರ",
    placeholderDescription: "ಸಮಸ್ಯೆಯನ್ನು ವಿವರವಾಗಿ ಬರೆಯಿರಿ...",
    askAiDiagnosis: "AI ಪರಿಹಾರ ಮತ್ತು ವಿಶ್ಲೇಷಣೆ ಪಡೆಯಿರಿ",
    aiAnalyzing: "AI ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...",
    selected: "ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ",
    labelLocation: "ಸ್ಥಳ / ಕೊಠಡಿ ಸಂಖ್ಯೆ",
    placeholderLocation: "ಉದಾ: ಬ್ಲಾಕ್ ಬಿ, ಕೊಠಡಿ 304",
    labelContact: "ಸಂಪರ್ಕ ಸಂಖ್ಯೆ",
    placeholderContact: "ಉದಾ: +91 98765 43210",
    btnDiagnose: "AI ವಿಶ್ಲೇಷಣೆ",
    btnSubmit: "ದೂರು ಸಲ್ಲಿಸಿ",
    submitting: "ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...",

    // Confirmation & Safety
    confirmTitle: "AI ದೃಢೀಕರಣ",
    confirmQuestion: "ನಿಮ್ಮ ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ನನ್ನ ತಿಳುವಳಿಕೆ ಸರಿಯಾಗಿದೆಯೇ?",
    btnYes: "ಹೌದು, ಸರಿ",
    btnNo: "ಇಲ್ಲ, ಸ್ಪಷ್ಟಪಡಿಸಿ",
    clarificationHelp: "AI ಗೆ ತಿಳಿಸಿ: ಸಮಸ್ಯೆ ಏನು?",
    clarificationPlaceholder: "ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ...",
    cancel: "ರದ್ದುಮಾಡಿ",
    updating: "ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ...",
    reanalyzeAi: "ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ",
    safeTitle: "ಸುರಕ್ಷಿತ (ಸ್ವತಃ ದುರಸ್ತಿ ಮಾಡಿ)",
    unsafeTitle: "ಅಪಾಯ - ತಂತ್ರಜ್ಞರ ಅಗತ್ಯವಿದೆ",
    safeDiySolution: "AI ಪರಿಹಾರ: ಸ್ವಯಂ ರಿಪೇರಿ ಸುರಕ್ಷಿತ",
    hazardousAlert: "AI ಎಚ್ಚರಿಕೆ: ತಂತ್ರಜ್ಞರ ಅಗತ್ಯವಿದೆ",
    solutionGuide: "ಪರಿಹಾರ ಮಾರ್ಗದರ್ಶಿ",
    viewFullGuide: "ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶಿ ವೀಕ್ಷಿಸಿ",
    launchLiveHelp: "ಲೈವ್ ಸಹಾಯ ಪ್ರಾರಂಭಿಸಿ",
    safetyCautionLabel: "ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ",
    safetyCautionText: "ಅಪಾಯಕಾರಿ ಸಾಧನಗಳನ್ನು ಮುಟ್ಟಬೇಡಿ. ತಂತ್ರಜ್ಞರನ್ನು ಕಳುಹಿಸಲಾಗುವುದು.",
    btnViewDiy: "ಮಾರ್ಗದರ್ಶಿ ವೀಕ್ಷಿಸಿ",
    btnAutoDispatch: "ತಂತ್ರಜ್ಞರನ್ನು ನಿಯೋಜಿಸಿ",

    // Technician
    techDashboardTitle: "ತಂತ್ರಜ್ಞರ ಕನ್ಸೋಲ್",
    availabilityLabel: "ಲಭ್ಯತೆ",
    statusAvailable: "ಲಭ್ಯವಿದೆ",
    statusBusy: "ಕಾರ್ಯನಿರತವಾಗಿದೆ",
    btnAccept: "ಸ್ವೀಕರಿಸಿ",
    btnReject: "ತಿರಸ್ಕರಿಸಿ",
    btnStartProgress: "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    btnCompleteProof: "ಪೂರ್ಣಗೊಳಿಸಿ",
    noJobsAssigned: "ಯಾವುದೇ ಕೆಲಸಗಳಿಲ್ಲ.",

    // Categories
    cat_electrical: "ವಿದ್ಯುತ್",
    cat_plumbing: "ಪ್ಲಂಬಿಂಗ್",
    cat_infrastructure: "ಮೂಲಸೌಕರ್ಯ",
    cat_cleaning: "ನೈರ್ಮಲ್ಯ",
    cat_security: "ಭದ್ರತೆ",
    cat_network: "ನೆಟ್‌ವರ್ಕ್",
    cat_other: "ಇತರ ನಿರ್ವಹಣೆ"
  }
};

export const STATUS_LABELS = {
  "Submitted": { en: "Submitted", ta: "சமர்ப்பிக்கப்பட்டது", hi: "दर्ज किया गया", te: "సమర్పించబడింది", ml: "സമർപ്പിച്ചു", kn: "ಸಲ್ಲಿಸಲಾಗಿದೆ" },
  "Assigned": { en: "Assigned", ta: "ஒதுக்கப்பட்டது", hi: "आवंटित", te: "కేటాయించబడింది", ml: "നിയോഗിച്ചു", kn: "ನಿಯೋಜಿಸಲಾಗಿದೆ" },
  "Accepted": { en: "Accepted", ta: "ஏற்கப்பட்டது", hi: "स्वीकार किया गया", te: "స్వీకరించబడింది", ml: "സ്വീകരിച്ചു", kn: "ಸ್ವೀಕರಿಸಲಾಗಿದೆ" },
  "In Progress": { en: "In Progress", ta: "வேலை நடக்கிறது", hi: "प्रगति पर है", te: "పురోగతిలో ఉంది", ml: "നടന്നുകൊണ്ടിരിക്കുന്നു", kn: "ಪ್ರಗತಿಯಲ್ಲಿದೆ" },
  "Completed": { en: "Completed", ta: "முடிக்கப்பட்டது", hi: "पूर्ण हुआ", te: "పూర్తయింది", ml: "പൂർത്തിയായി", kn: "ಪೂರ್ಣಗೊಂಡಿದೆ" },
  "Resolved": { en: "Resolved", ta: "தீர்க்கப்பட்டது", hi: "हल हुआ", te: "పరిష్కరించబడింది", ml: "പരിഹരിച്ചു", kn: "ಪರಿಹರಿಸಲಾಗಿದೆ" },
  "Rejected": { en: "Declined", ta: "நிராகரிக்கப்பட்டது", hi: "अस्वीकृत", te: "తిరస్కరించబడింది", ml: "നിരസിച്ചു", kn: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ" }
};

export const SEVERITY_LABELS = {
  "Low (Safe DIY)": { en: "Low (Safe DIY)", ta: "குறைந்த ஆபத்து (சுயமாக செய்யலாம்)", hi: "कम जोखिम (स्वयं-सुधार)", te: "తక్కువ ప్రమాదం (Safe DIY)", ml: "ലളിതമായ അറ്റകുറ്റപ്പണി (Safe DIY)", kn: "ಕಡಿಮೆ ಅಪಾಯ (Safe DIY)" },
  "High (Unsafe/Urgent)": { en: "High (Unsafe/Urgent)", ta: "அவசரம் (தொழில்நுட்ப வல்லுநர் தேவை)", hi: "उच्च प्राथमिकता (तकनीशियन आवश्यक)", te: "అత్యవసరం (నిపుణుడు అవసరం)", ml: "അടിയന്തിരം (വിദഗ്ദ്ധൻ ആവശ്യമാണ്)", kn: "ಅತ್ಯಾವಶ್ಯಕ (ತಜ್ಞರ ಅಗತ್ಯವಿದೆ)" },
  "Safe DIY": { en: "Safe DIY", ta: "சுயமாக செய்யலாம்", hi: "स्वयं-सुधार", te: "Safe DIY", ml: "ലളിതം", kn: "Safe DIY" },
  "Certified Tech Dispatched": { en: "Certified Tech Dispatched", ta: "தொழில்நுட்ப வல்லுநர் தேவை", hi: "तकनीशियन भेजा गया", te: "నిపుణుడు కేటాయించబడింది", ml: "ടെക്നീഷ്യൻ നിയോഗിച്ചു", kn: "ತಜ್ಞರು ನಿಯೋಜಿತರು" }
};

export const CATEGORY_LABELS = {
  electrical: { en: "ELECTRICAL", ta: "மின்சாரம்", hi: "बिजली", te: "విద్యుత్", ml: "വൈദ്യുതി", kn: "ವಿದ್ಯುತ್" },
  plumbing: { en: "PLUMBING", ta: "குழாய் & நீர்", hi: "प्लंबिंग", te: "ప్లంబింగ్", ml: "പ്ലംബിംഗ്", kn: "ಪ್ಲಂಬಿಂಗ್" },
  infrastructure: { en: "INFRASTRUCTURE", ta: "கட்டமைப்பு", hi: "इन्फ्रास्ट्रक्चर", te: "మౌలిక సదుపಾಯాలు", ml: "ഇൻഫ്രാസ്ട്രക്ചർ", kn: "ಮೂಲಸೌಕರ್ಯ" },
  network: { en: "NETWORK", ta: "இணையம்", hi: "नेटवर्क", te: "నెట్‌వర్క్", ml: "നെറ്റ്‌വർക്ക്", kn: "ನೆಟ್‌ವರ್ಕ್" },
  cleaning: { en: "SANITATION", ta: "சுகாதாரம்", hi: "स्वच्छता", te: "పరిశుభ್ರత", ml: "ശുചിത്വം", kn: "ನೈರ್ಮಲ್ಯ" },
  security: { en: "SECURITY", ta: "பாதுகாப்பு", hi: "सुरक्षा", te: "భద్రత", ml: "സുരക്ഷ", kn: "ಭದ್ರತೆ" },
  other: { en: "GENERAL", ta: "மற்றவை", hi: "सामान्य", te: "ఇతర", ml: "മറ്റുളളവ", kn: "ಇತರ" }
};

export function getLocalizedStatus(status, lang = 'en') {
  if (!status) return '';
  return STATUS_LABELS[status]?.[lang] || STATUS_LABELS[status]?.['en'] || status;
}

export function getLocalizedSeverity(severity, lang = 'en') {
  if (!severity) return '';
  return SEVERITY_LABELS[severity]?.[lang] || SEVERITY_LABELS[severity]?.['en'] || severity;
}

export function getLocalizedCategory(category, lang = 'en') {
  if (!category) return '';
  const catKey = category.toLowerCase().trim();
  return CATEGORY_LABELS[catKey]?.[lang] || CATEGORY_LABELS[catKey]?.['en'] || category.toUpperCase();
}

export function getLocalizedDiagnosis(item, lang = 'en') {
  if (!item) return '';
  const text = typeof item === 'string' ? item : (item.aiDiagnosis?.explanation || item.description || '');
  if (!text) return '';

  if (lang === 'en') {
    return text;
  }

  const textLower = text.toLowerCase();

  // Extract Fixture
  let fixture = 'சாதனம்';
  if (textLower.includes('window') || textLower.includes('ஜன்னல்')) fixture = 'ஜன்னல் (Window Frame)';
  else if (textLower.includes('door') || textLower.includes('கதவு')) fixture = 'அறை கதவு (Room Door)';
  else if (textLower.includes('fan') || textLower.includes('மின்விசிறி')) fixture = 'மின்விசிறி (Ceiling Fan)';
  else if (textLower.includes('light') || textLower.includes('bulb') || textLower.includes('விளக்கு')) fixture = 'மின் விளக்கு (Tube Light / Bulb)';
  else if (textLower.includes('switch') || textLower.includes('socket') || textLower.includes('சுவிட்ச்')) fixture = 'சுவிட்ச் போர்டு (Switch Board)';
  else if (textLower.includes('tap') || textLower.includes('faucet') || textLower.includes('குழாய்')) fixture = 'தண்ணீர் குழாய் (Water Tap)';
  else if (textLower.includes('pipe') || textLower.includes('பைப்') || textLower.includes('plumbing')) fixture = 'குழாய் அமைப்பு (Plumbing Pipe)';
  else if (textLower.includes('router') || textLower.includes('wifi') || textLower.includes('வைஃபை')) fixture = 'வைஃபை ரூட்டர் (Wi-Fi Router)';
  else if (textLower.includes('dustbin') || textLower.includes('garbage') || textLower.includes('குப்பை')) fixture = 'குப்பைத் தொட்டி (Garbage Dustbin)';
  else if (textLower.includes('camera') || textLower.includes('cctv') || textLower.includes('கேமரா')) fixture = 'பாதுகாப்பு கேமரா (CCTV Camera)';
  else if (textLower.includes('chair') || textLower.includes('table') || textLower.includes('desk') || textLower.includes('மேஜை')) fixture = 'மரச்சாமான்கள் (Furniture / Desk)';

  if (lang === 'ta') {
    if (textLower.includes('struck') || textLower.includes('stuck') || textLower.includes('jam') || textLower.includes('close or open panna')) {
      return `உங்கள் ${fixture}-ல் உராய்வு அல்லது தளர்ந்த திருகுகள் காரணமாக திறக்க/மூட முடியாத அடைப்பு ஏற்பட்டுள்ளது என AI கண்டறிந்துள்ளது.`;
    }
    if (textLower.includes('crack') || textLower.includes('விரிசல்') || textLower.includes('fissure')) {
      return `உங்கள் ${fixture}-ல் கட்டமைப்பு அழுத்தம் அல்லது மரப்பலகை விரிசல் காரணமாக மேற்பரப்பு விரிசல் மற்றும் பிளவு ஏற்பட்டுள்ளது என AI கண்டறிந்துள்ளது.`;
    }
    if (textLower.includes('leak') || textLower.includes('dripping') || textLower.includes('கசிவு') || textLower.includes('water')) {
      return `உங்கள் ${fixture}-ல் தளர்வான இணைப்பு அல்லது தேய்ந்த வாஷர் காரணமாக தொடர்ச்சியான தண்ணீர் கசிவு ஏற்பட்டுள்ளது என AI கண்டறிந்துள்ளது.`;
    }
    if (textLower.includes('suthala') || textLower.includes('motor') || textLower.includes('stalled')) {
      return `உங்கள் ${fixture}-ல் கெபாசிட்டர் பழுது அல்லது மோட்டார் லாக் காரணமாக சுழலாமல் நின்றுள்ளது என AI கண்டறிந்துள்ளது.`;
    }
    if (textLower.includes('spark') || textLower.includes('shock') || textLower.includes('smoke')) {
      return `உங்கள் ${fixture}-ல் தளர்வான வயரிங் காரணமாக மின்கசிவு மற்றும் தீப்பொறி அபாயம் ஏற்பட்டுள்ளது என AI கண்டறிந்துள்ளது.`;
    }
    if (textLower.includes('wifi') || textLower.includes('signal') || textLower.includes('dropout') || textLower.includes('cut')) {
      return `உங்கள் ${fixture}-ல் உள் இணைப்பு துண்டிப்பு அல்லது சிக்னல் இழப்பு ஏற்பட்டுள்ளது என AI கண்டறிந்துள்ளது.`;
    }
    if (textLower.includes('defect') || textLower.includes('damage') || textLower.includes('broken')) {
      return `உங்கள் ${fixture}-ல் பயன்பாட்டுத் தேய்மானம் அல்லது தளர்வான பொருத்துதல் காரணமாக அமைப்பு குறைபாடு ஏற்பட்டுள்ளது என AI கண்டறிந்துள்ளது.`;
    }
    return `உங்கள் ${fixture}-ல் பராமரிப்பு குறைபாடு ஏற்பட்டுள்ளது என AI கண்டறிந்துள்ளது.`;
  }

  if (lang === 'hi') {
    if (textLower.includes('leak') || textLower.includes('dripping') || textLower.includes('water')) {
      return `AI ने पाया कि आपके पानी के पाइप/नल में जोड़ ढीला होने के कारण लीकेज की समस्या है।`;
    }
    if (textLower.includes('struck') || textLower.includes('stuck') || textLower.includes('jam')) {
      return `AI ने पाया कि आपके खिड़की/दरवाजे में घर्षण या ढीले कब्जे के कारण जाम होने की समस्या है।`;
    }
    if (textLower.includes('crack')) {
      return `AI ने पाया कि सतह पर दबाव या दरार के कारण संरचनात्मक क्षति हुई है।`;
    }
    return `AI ने उपकरण में यांत्रिक या परिचालन संबंधी समस्या पाई है।`;
  }

  if (lang === 'ml') {
    if (textLower.includes('leak') || textLower.includes('dripping') || textLower.includes('water')) {
      return `പൈപ്പ് ജോയിന്റ് അയഞ്ഞതുമൂലം വെള്ളം ചോർച്ച ഉണ്ടായതായി AI കണ്ടെത്തി.`;
    }
    if (textLower.includes('struck') || textLower.includes('stuck') || textLower.includes('jam')) {
      return `വാതിൽ/ജനൽ ഘടനയിൽ തടസ്സം ഉണ്ടായതായി AI കണ്ടെത്തി.`;
    }
    return `ഉപകരണത്തിൽ അറ്റകുറ്റപ്പണി ആവശ്യമായ തകരാർ AI കണ്ടെത്തി.`;
  }

  if (lang === 'te') {
    if (textLower.includes('leak') || textLower.includes('water')) {
      return `పైపు కనెక్షన్ వదులుగా ఉండటం వల్ల నీటి లీకేజీ సమస్యను AI గుర్తించింది.`;
    }
    return `పరికరం లోపం ఉన్నట్లు AI విశ్లేషించింది.`;
  }

  if (lang === 'kn') {
    if (textLower.includes('leak') || textLower.includes('water')) {
      return `ಪೈಪ್ ಸಡಿಲಗೊಂಡಿರುವುದರಿಂದ ನೀರಿನ ಸೋರಿಕೆ ಉಂಟಾಗಿದೆ ಎಂದು AI ಪತ್ತೆಹಚ್ಚಿದೆ.`;
    }
    return `ಉಪಕರಣದಲ್ಲಿ ದೋಷವನ್ನು AI ಗುರುತಿಸಿದೆ.`;
  }

  return text;
}

export function speakText(text, lang = "en") {
  if (!("speechSynthesis" in window) || !text) return;

  window.speechSynthesis.cancel(); // Stop ongoing speech

  const utterance = new SpeechSynthesisUtterance(text);
  const langMap = {
    en: "en-US",
    ta: "ta-IN",
    hi: "hi-IN",
    te: "te-IN",
    ml: "ml-IN",
    kn: "kn-IN"
  };
  utterance.lang = langMap[lang] || "en-US";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

// ==========================================
// Comprehensive Multilingual DIY Repair Data
// ==========================================
export const DIY_GUIDES_DATA = {
  plumbing: {
    en: {
      title: "Minor Tap Leak & Aerator Cleaning",
      estimatedMinutes: 15,
      tools: ["Adjustable Spanner / Wrench", "Teflon Thread Seal Tape", "Old Toothbrush", "Cleaning Vinegar"],
      parts: ["Rubber Washer / O-ring (1/2 inch standard)"],
      precautions: [
        "Turn off the under-sink water stopcock valve first.",
        "Wrap wrench jaws with cloth to avoid scratching metallic tap finish."
      ],
      steps: [
        "Locate the isolation angle valve below the sink and rotate clockwise to shut water.",
        "Unscrew the spout aerator tip with the wrench and rinse out accumulated sand/grit.",
        "Soak the mesh filter cartridge in vinegar for 5 minutes to dissolve limescale.",
        "Wrap 3 turns of Teflon plumbers tape clockwise over the threaded nozzle.",
        "Replace worn rubber washer, re-tighten the aerator firmly, and restore water."
      ]
    },
    ta: {
      title: "தண்ணீர் குழாய் கசிவு & ஏரேட்டர் சுத்தம் செய்யும் முறை",
      estimatedMinutes: 15,
      tools: ["அட்ஜஸ்டபிள் ஸ்பேனர் / ரெஞ்ச்", "டெஃப்லான் த்ரெட் சீல் டேப்", "பழைய டூத்பிரஷ்", "வினிகர் திரவம்"],
      parts: ["ரப்பர் வாஷர் / O-ring (1/2 இன்ச் தர அளவு)"],
      precautions: [
        "முதலில் சின்க் அடியில் உள்ள பிரதான தண்ணீர் வால்வை மூடவும்.",
        "குழாயில் கீறல் விழாமல் இருக்க ஸ்பேனர் தாடையில் துணியை சுற்றவும்."
      ],
      steps: [
        "சின்க் அடியில் உள்ள ஆங்கிள் வால்வை கடிகார முள் திசையில் திருப்பி தண்ணீரை முழுமையாக நிறுத்தவும்.",
        "ஸ்பேனர் கொண்டு குழாய் முனையில் உள்ள ஏரேட்டரை கழற்றி, உள்ளே உள்ள மணல் மற்றும் துகள்களை நீரில் கழுவவும்.",
        "உப்புப் படிவங்களை கரைக்க ஃபில்டர் வலையை வினிகரில் 5 நிமிடங்கள் ஊற வைக்கவும்.",
        "குழாய் திரெட் பகுதியில் டெஃப்லான் டேப்பை கடிகார முள் திசையில் 3 முறை இறுக்கமாக சுற்றவும்.",
        "தேய்ந்த ரப்பர் வாஷரை புதியதாக மாற்றி, ஏரேட்டரை மீண்டும் இறுக்கி மாட்டி தண்ணீர் வால்வை திறக்கவும்."
      ]
    },
    hi: {
      title: "नल का रिसाव और एरेटर सफाई गाइड",
      estimatedMinutes: 15,
      tools: ["एडजस्टेबल रिंच", "टेफ्लॉन थ्रेड सील टेप", "टूथब्रश", "सफाई का सिरका"],
      parts: ["रबर वॉशर / ओ-रिंग (1/2 इंच)"],
      precautions: [
        "पहले सिंक के नीचे लगे मुख्य पानी के वाल्व को बंद करें।",
        "स्क्रैच से बचने के लिए रिंच पर कपड़ा लपेटें।"
      ],
      steps: [
        "सिंक के नीचे लगे एंगल वाल्व को क्लॉकवाइज घुमाकर पानी की सप्लाई बंद करें।",
        "रिंच की मदद से नल के मुंह पर लगे एरेटर को खोलें और जमी हुई गंदगी साफ करें।",
        "स्केल हटाने के लिए मेश फिल्टर को 5 मिनट सिरके में भिगोएँ।",
        "नल के चूड़ीदार हिस्से पर 3 बार टेफ्लॉन टेप लपेटें।",
        "नया रबर वॉशर लगाकर एरेटर को वापस कसें और पानी का वाल्व खोलें।"
      ]
    },
    te: {
      title: "నీటి కుళాయి లీకేజ్ & ఎరేటర్ క్లీనింగ్ గైడ్",
      estimatedMinutes: 15,
      tools: ["అడ్జస్టబుల్ రెంచ్", "టెఫ్లాన్ టేప్", "బ్రష్", "వెనిగర్"],
      parts: ["రబ్బర్ వాషర్ (1/2 ఇంచ్)"],
      precautions: [
        "ముందుగా సింక్ క్రింద ఉన్న నీటి వాల్వ్‌ను మూసివేయండి."
      ],
      steps: [
        "సింక్ క్రింద ఉన్న వాల్వ్‌ను తిప్పి నీటి సరఫరాను ఆపండి.",
        "రెంచ్‌తో ఎరేటర్ భాగాన్ని విప్పి ఇసుకను శుభ్రం చేయండి.",
        "ఫిల్టర్‌ను 5 నిమిషాలు వెనిగర్‌లో నానబెట్టండి.",
        "త్రెడ్ పై 3 రౌండ్లు టెఫ్లాన్ టేప్ చుట్టండి.",
        "కొత్త వాషర్ పెట్టి మళ్లీ బిగించి నీటి సరఫరాను ప్రారంభించండి."
      ]
    },
    ml: {
      title: "ടാപ്പ് ചോർച്ച & എയറേറ്റർ ക്ലീനിംഗ് ഗൈഡ്",
      estimatedMinutes: 15,
      tools: ["അഡ്ജസ്റ്റബിൾ റെഞ്ച്", "ടെഫ്ലോൺ ടേപ്പ്", "ബ്രഷ്", "വിനാഗിരി"],
      parts: ["റബ്ബർ വാഷർ (1/2 ഇഞ്ച്)"],
      precautions: [
        "ആദ്യം സിങ്കിനടിയിലെ വാൽവ് ഓഫ് ചെയ്യുക."
      ],
      steps: [
        "സിങ്കിനടിയിലെ ആംഗിൾ വാൽവ് തിരിച്ച് വെള്ളം നിർത്തുക.",
        "റെഞ്ച് ഉപയോഗിച്ച് എയറേറ്റർ അഴിച്ച് അഴുക്ക് കളയുക.",
        "ഫിൽറ്റർ 5 മിനിറ്റ് വിനാഗിരിയിൽ മുക്കിവെക്കുക.",
        "ത്രെഡിൽ 3 തവണ ടെഫ്ലോൺ ടേപ്പ് ചുറ്റുക.",
        "പുതിയ വാഷർ ഇട്ട് മുറുക്കി വെള്ളം തുറക്കുക."
      ]
    },
    kn: {
      title: "ನೀರಿನ ನಲ್ಲಿ ಸೋರಿಕೆ ಮತ್ತು ಏರೇಟರ್ ಸ್ವಚ್ಛಗೊಳಿಸುವ ಮಾರ್ಗದರ್ಶಿ",
      estimatedMinutes: 15,
      tools: ["ಅಡ್ಜಸ್ಟಬಲ್ ಸ್ಪ್ಯಾನರ್", "ಟೆಫ್ಲಾನ್ ಟೇಪ್", "ಬ್ರಷ್", "ವಿನೆಗರ್"],
      parts: ["ರಬ್ಬರ್ ವಾಷರ್ (1/2 ಇಂಚು)"],
      precautions: [
        "ಮೊದಲು ಸಿಂಕ್ ಕೆಳಗಿನ ಮುಖ್ಯ ವಾಲ್ವ್ ಮುಚ್ಚಿ."
      ],
      steps: [
        "ಸಿಂಕ್ ಕೆಳಗಿನ ವಾಲ್ವ್ ತಿರುಗಿಸಿ ನೀರನ್ನು ನಿಲ್ಲಿಸಿ.",
        "ಸ್ಪ್ಯಾನರ್‌ನಿಂದ ಏರೇಟರ್ ಬಿಚ್ಚಿ ಕಲ್ಮಶ ತೊಳೆಯಿರಿ.",
        "ಫಿಲ್ಟರ್ ಅನ್ನು 5 ನಿಮಿಷ ವಿನೆಗರ್‌ನಲ್ಲಿ ನೆನೆಸಿ.",
        "ಥ್ರೆಡ್ ಮೇಲೆ 3 ಸುತ್ತು ಟೆಫ್ಲಾನ್ ಟೇಪ್ ಸುತ್ತಿ.",
        "ಹೊಸ ವಾಷರ್ ಹಾಕಿ ಬಿಗಿಗೊಳಿಸಿ ನೀರು ಬಿಡಿ."
      ]
    }
  },

  infrastructure: {
    en: {
      title: "Door / Window Surface Crack Patching & Hinge Alignment",
      estimatedMinutes: 10,
      tools: ["Phillips Screwdriver", "Wood Filler / Epoxy Putty", "Sandpaper (120 Grit)", "Lubricant Oil / Spray"],
      parts: ["Wood Screws / Surface Sealant"],
      precautions: [
        "Keep oil from dripping onto floor tiles to prevent slipping.",
        "Wipe away excess putty immediately before it hardens."
      ],
      steps: [
        "Clean the cracked surface seam or hinge area with a dry microfiber cloth.",
        "For surface cracks: Apply wood filler or epoxy repair putty evenly along the crack and smooth flat.",
        "Allow the repair compound to set for 15 minutes, then lightly sand flush with the panel.",
        "Apply 2 drops of lubricant oil into hinge knuckle pin joints.",
        "Tighten loose hinge anchor screws clockwise with the Phillips screwdriver and test smooth closing."
      ]
    },
    ta: {
      title: "கதவு / ஜன்னல் மேற்பரப்பு விரிசல் சீரமைப்பு & கீல் பொருத்துதல்",
      estimatedMinutes: 10,
      tools: ["பிலிப்ஸ் திருப்புளி (Screwdriver)", "மர பசை / எபாக்ஸி புட்டி", "தேய்ப்பு காகிதம் (Sandpaper)", "லூப்ரிகண்ட் ஆயில் ஸ்ப்ரே"],
      parts: ["மரத் திருகுகள் / மேற்பரப்பு சீலண்ட்"],
      precautions: [
        "தரை வழவழப்பாக மாறாமல் இருக்க ஆயில் கீழே சிந்தாமல் துணி விரிக்கவும்.",
        "புட்டி காய்வதற்கு முன் அதிகப்படியான பசையை துடைத்துவிடவும்."
      ],
      steps: [
        "கதவு அல்லது ஜன்னல் விரிசல் மற்றும் கீல் பகுதியை உலர்ந்த துணியால் துடைத்து சுத்தப்படுத்தவும்.",
        "மேற்பரப்பு விரிசல்களுக்கு: மர பசை அல்லது எபாக்ஸி புட்டியை விரிசலின் மேல் சமமாக பூசி பரப்பவும்.",
        "புட்டி 15 நிமிடங்கள் காய்ந்ததும், தேய்ப்பு காகிதம் கொண்டு மேற்பரப்பை சமமாக தேய்க்கவும்.",
        "கீல் இணைப்புகளில் 2 சொட்டுகள் லூப்ரிகண்ட் ஆயில் விடவும்.",
        "தளர்ந்த திருகுகளை ஸ்க்ரூடிரைவர் கொண்டு இறுக்கி, கதவை/ஜன்னலை திறந்து மூடி சோதிக்கவும்."
      ]
    },
    hi: {
      title: "दरवाजा / खिड़की दरार मरम्मत और कब्ज़ा अलाइनमेंट",
      estimatedMinutes: 10,
      tools: ["फिलिप्स पेचकश", "वुड फिलर / एपॉक्सी पुट्टी", "रेगमाल (सैंडपेपर)", "लुब्रिकेंट स्प्रे"],
      parts: ["लकड़ी के पेंच"],
      precautions: [
        "फिसलन से बचने के लिए फर्श पर तेल न गिरने दें।",
        "पुट्टी सूखने से पहले अतिरिक्त पेस्ट पोंछ लें।"
      ],
      steps: [
        "दरार या कब्जे वाले हिस्से को सूखे कपड़े से साफ करें।",
        "दरारों पर वुड फिलर या पुट्टी समान रूप से लगाएं।",
        "15 मिनट सूखने के बाद रेगमाल से सतह को चिकना करें।",
        "कब्जों में 2 बूंद लुब्रिकेंट तेल डालें।",
        "पेचकश से ढीले पेंच कसें और दरवाजे को आसानी से चलाकर देखें।"
      ]
    },
    te: {
      title: "తలుపు / కిటికీ పగుళ్ల మరమ్మతు & కీలు అమరిక",
      estimatedMinutes: 10,
      tools: ["స్క్రూడ్రైవర్", "వుడ్ ఫిల్లర్ / పుట్టీ", "శాండ్‌పేపర్", "లూబ్రికెంట్ ఆయిల్"],
      parts: ["స్క్రూలు"],
      precautions: [
        "నూనె నేలపై పడకుండా జాగ్రత్త వహించండి."
      ],
      steps: [
        "పగులు ఉన్న ప్రాంతాన్ని పొడి గుడ్డతో శుభ్రం చేయండి.",
        "పగుళ్లపై పుట్టీని సమానంగా పూయండి.",
        "15 నిమిషాల తర్వాత శాండ్‌పేపర్‌తో రుద్దండి.",
        "కీళ్లలో నూనె వేసి స్క్రూలను బిగించండి.",
        "తలుపును తెరిచి మూసి పరీక్షించండి."
      ]
    },
    ml: {
      title: "വാതിൽ / ജനൽ വിള്ളൽ പരിഹാരവും قبض ക്രമീകരണവും",
      estimatedMinutes: 10,
      tools: ["സ്ക്രൂഡ്രൈവർ", "വുഡ് ഫില്ലർ / പുട്ടി", "സാൻഡ്പേപ്പർ", "ലൂബ്രിക്കന്റ് ഓയിൽ"],
      parts: ["സ്ക്രൂകൾ"],
      precautions: [
        "എണ്ണ തറയിൽ വീഴാതെ ശ്രദ്ധിക്കുക."
      ],
      steps: [
        "വിള്ളലുള്ള ഭാഗം ഉണങ്ങിയ തുണികൊണ്ട് വൃത്തിയാക്കുക.",
        "വുഡ് ഫില്ലർ വിള്ളലുകളിൽ തേച്ചുപിടിപ്പിക്കുക.",
        "15 മിനിറ്റിനു ശേഷം സാൻഡ്പേപ്പർ കൊണ്ട് മിനുസപ്പെടുത്തുക.",
        "قبضകളിൽ ലൂബ്രിക്കന്റ് ഒഴിച്ച് സ്ക്രൂകൾ മുറുക്കുക.",
        "വാതിൽ തുറന്ന് സുഗമമായി പ്രവർത്തിക്കുന്നുണ്ടെന്ന് ഉറപ്പാക്കുക."
      ]
    },
    kn: {
      title: "ಬಾಗಿಲು / ಕಿಟಕಿ ಬಿರುಕು ದುರಸ್ತಿ ಮತ್ತು ಕೀಲು ಜೋಡಣೆ",
      estimatedMinutes: 10,
      tools: ["ಸ್ಕ್ರೂಡ್ರೈವರ್", "ವುಡ್ ಫಿಲ್ಲರ್", "ಸ್ಯಾಂಡ್‌ಪೇಪರ್", "ಲ್ಯೂಬ್ರಿಕೆಂಟ್ ಆಯಿಲ್"],
      parts: ["ಸ್ಕ್ರೂಗಳು"],
      precautions: [
        "ಎಣ್ಣೆ ನೆಲದ ಮೇಲೆ ಬೀಳದಂತೆ ಎಚ್ಚರವಹಿಸಿ."
      ],
      steps: [
        "ಬಿರುಕು ಇರುವ ಜಾಗವನ್ನು ಒಣ ಬಟ್ಟೆಯಿಂದ ಸ್ವಚ್ಛಗೊಳಿಸಿ.",
        "ವುಡ್ ಫಿಲ್ಲರ್ ಅನ್ನು ಸಮವಾಗಿ ಹಚ್ಚಿ.",
        "15 ನಿಮಿಷಗಳ ನಂತರ ಸ್ಯಾಂಡ್‌ಪೇಪರ್‌ನಿಂದ ಉಜ್ಜಿ ನಯಗೊಳಿಸಿ.",
        "ಕೀಲುಗಳಿಗೆ ಎಣ್ಣೆ ಹಾಕಿ ಸ್ಕ್ರೂಗಳನ್ನು ಬಿಗಿಗೊಳಿಸಿ.",
        "ಬಾಗಿಲನ್ನು ತೆರೆದು ಮುಚ್ಚಿ ಸುಲಭವಾಗಿ ಚಲಿಸುವುದನ್ನು ಪರೀಕ್ಷಿಸಿ."
      ]
    }
  },

  electrical: {
    en: {
      title: "Loose Switch Plate or Bulb Replacement",
      estimatedMinutes: 10,
      tools: ["Insulated Flathead Screwdriver", "Safety Rubber Gloves", "Voltage Tester Pen"],
      parts: ["Replacement LED Bulb or Switch Faceplate"],
      precautions: [
        "Shut off the room circuit breaker before touching any socket fixture.",
        "Confirm zero voltage using the tester pen before working.",
        "Never perform repairs with wet hands or bare feet."
      ],
      steps: [
        "Turn OFF the wall switch and the corresponding circuit breaker in the distribution box.",
        "Test socket terminals with the voltage tester to ensure current is dead.",
        "Use the insulated screwdriver to loosen the mounting screws counter-clockwise.",
        "Clean internal dust with a dry cloth and check that wire leads are seated tightly in the terminal screws.",
        "Align faceplate flush to wall, tighten screws until snug, and restore main power."
      ]
    },
    ta: {
      title: "தளர்வான சுவிட்ச் போர்டு சீரமைப்பு & பல்பு மாற்று வழிகாட்டி",
      estimatedMinutes: 10,
      tools: ["இன்சுலேட்டட் திருப்புளி (Screwdriver)", "பாதுகாப்பு ரப்பர் கையுறைகள்", "வோல்டேஜ் டெஸ்டர் பேனா"],
      parts: ["மாற்று எல்.இ.டி பல்பு அல்லது சுவிட்ச் பிளேட்"],
      precautions: [
        "சுவிட்ச் போர்டை தொடுவதற்கு முன் மெயின் MCB பிரேக்கரை அணைக்கவும்.",
        "டெஸ்டர் பேனா மூலம் மின்சாரம் இல்லை என்பதை உறுதி செய்யவும்.",
        "ஈரக் கைகளுடனோ அல்லது வெறும் கால்களுடனோ பழுதுபார்க்க வேண்டாம்."
      ],
      steps: [
        "சுவிட்ச் மற்றும் பிரதான விநியோகப் பெட்டியில் உள்ள MCB பிரேக்கரை OFF செய்யவும்.",
        "டெஸ்டர் மூலம் சாக்கெட்டில் மின்சாரம் முற்றிலுமாக நின்றுவிட்டதா என பரிசோதிக்கவும்.",
        "இன்சுலேட்டட் ஸ்க்ரூடிரைவர் கொண்டு சுவிட்ச் பிளேட் திருகுகளை கழற்றவும்.",
        "உள் தூசியை உலர்ந்த துணியால் துடைத்து, வயர் இணைப்புகளை உறுதியாக இறுக்கவும்.",
        "சுவிட்ச் போர்டை சுவரோடு சமமாக பொருத்தி, திருகுகளை இறுக்கி மெயின் பவரை ஆன் செய்யவும்."
      ]
    },
    hi: {
      title: "ढीला स्विच बोर्ड या बल्ब बदलने की गाइड",
      estimatedMinutes: 10,
      tools: ["इंसुलेटेड पेचकश", "रबर के दस्ताने", "वोल्टेज टेस्टर"],
      parts: ["एलईडी बल्ब / स्विच प्लेट"],
      precautions: [
        "काम शुरू करने से पहले मुख्य MCB ब्रेकर को बंद करें।",
        "टेस्टर से जांचें कि करंट पूरी तरह बंद है।"
      ],
      steps: [
        "दीवार के स्विच और डिस्ट्रीब्यूशन बॉक्स के MCB ब्रेकर को बंद करें।",
        "टेस्टर से जांचें कि सॉकेट में कोई करंट नहीं आ रहा है।",
        "पेचकश से स्विच प्लेट के पेंच खोलें।",
        "तारों के कनेक्शन को अच्छी तरह कसें और धूल साफ करें।",
        "प्लेट को वापस दीवार पर कसें और मेन पावर चालू करें।"
      ]
    },
    te: {
      title: "స్విచ్ బోర్డ్ & బల్బ్ మార్పిడి గైడ్",
      estimatedMinutes: 10,
      tools: ["ఇన్సులేటెడ్ స్క్రూడ్రైవర్", "రబ్బర్ గ్లౌజులు", "టెస్టర్"],
      parts: ["LED బల్బ్ / స్విచ్ ప్లేట్"],
      precautions: [
        "ముందుగా మెయిన్ MCB స్విచ్ ఆఫ్ చేయండి."
      ],
      steps: [
        "MCB బ్రేకర్ ఆఫ్ చేసి విద్యుత్ సరఫరా ఆపండి.",
        "టెస్టర్‌తో విద్యుత్ లేదని నిర్ధారించుకోండి.",
        "స్క్రూడ్రైవర్‌తో ప్లేట్ స్క్రూలను విప్పండి.",
        "వైర్ల కనెక్షన్లను గట్టిగా బిగించండి.",
        "ప్లేట్‌ను గోడకు బిగించి విద్యుత్ సరఫరాను పునరుద్ధరించండి."
      ]
    },
    ml: {
      title: "സ്വിച്ച് ബോർഡ് ക്രമീകരണവും ബൾബ് മാറ്റലും",
      estimatedMinutes: 10,
      tools: ["ഇൻസുലേറ്റഡ് സ്ക്രൂഡ്രൈവർ", "റബ്ബർ ഗ്ലൗസ്", "വോൾട്ടേജ് ടെസ്റ്റർ"],
      parts: ["LED ബൾബ് / സ്വിച്ച് പ്ലേറ്റ്"],
      precautions: [
        "ആദ്യം മെയിൻ MCB സ്വിച്ച് ഓഫ് ചെയ്യുക."
      ],
      steps: [
        "മെയിൻ MCB ഓഫ് ചെയ്ത് കറണ്ട് നിർത്തുക.",
        "ടെസ്റ്റർ ഉപയോഗിച്ച് കറണ്ട് ഇല്ലെന്ന് ഉറപ്പാക്കുക.",
        "സ്ക്രൂഡ്രൈവർ ഉപയോഗിച്ച് സ്വിച്ച് ബോർഡ് തുറക്കുക.",
        "വയറുകളുടെ കണക്ഷനുകൾ മുറുക്കുക.",
        "ബോർഡ് തിരികെ ഘടിപ്പിച്ച് മെയിൻ പവർ ഓൺ ചെയ്യുക."
      ]
    },
    kn: {
      title: "ಸ್ವಿಚ್ ಬೋರ್ಡ್ ಮತ್ತು ಬಲ್ಬ್ ಬದಲಾವಣೆ ಮಾರ್ಗದರ್ಶಿ",
      estimatedMinutes: 10,
      tools: ["ಇನ್ಸುಲೇಟೆಡ್ ಸ್ಕ್ರೂಡ್ರೈವರ್", "ರಬ್ಬರ್ ಗ್ಲೌವ್ಸ್", "ಟೆಸ್ಟರ್"],
      parts: ["LED ಬಲ್ಬ್ / ಸ್ವಿಚ್ ಪ್ಲೇಟ್"],
      precautions: [
        "ಮೊದಲು ಮುಖ್ಯ MCB ಬ್ರೇಕರ್ ಆಫ್ ಮಾಡಿ."
      ],
      steps: [
        "MCB ಆಫ್ ಮಾಡಿ ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಳಿಸಿ.",
        "ಟೆಸ್ಟರ್‌ನಿಂದ ವಿದ್ಯುತ್ ಇಲ್ಲದಿರುವುದನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
        "ಸ್ಕ್ರೂಡ್ರೈವರ್‌ನಿಂದ ಪ್ಲೇಟ್ ತೆರೆಯಿರಿ.",
        "ವೈರ್ ಕನೆಕ್ಷನ್‌ಗಳನ್ನು ಬಿಗಿಗೊಳಿಸಿ.",
        "ಪ್ಲೇಟ್ ಜೋಡಿಸಿ ಮುಖ್ಯ ವಿದ್ಯುತ್ ಆನ್ ಮಾಡಿ."
      ]
    }
  },

  fan: {
    en: {
      title: "Ceiling Fan Blade Cleaning & Regulator Check",
      estimatedMinutes: 10,
      tools: ["Step Stool / Chair", "Microfiber Duster Cloth", "Mild Soap Solution"],
      parts: ["None"],
      precautions: [
        "Ensure wall switch is completely OFF before touching fan blades.",
        "Do not bend or twist aluminum blade brackets."
      ],
      steps: [
        "Switch OFF the fan switch and regulator dial completely.",
        "Climb step stool safely and slide an old pillowcase over each blade to collect dust.",
        "Wipe both blade surfaces with a damp cloth and mild soap solution.",
        "Check that blade mounting screws are snug and secure.",
        "Switch ON power and test smooth, wobble-free rotation at all speeds."
      ]
    },
    ta: {
      title: "மின்விசிறி (Ceiling Fan) சுத்தம் & ரெகுலேட்டர் பரிசோதனை",
      estimatedMinutes: 10,
      tools: ["சிறிய ஸ்டூல் / நாற்காலி", "மைக்ரோஃபைபர் துணி", "லேசான சோப்பு நீர்"],
      parts: ["தேவை இல்லை"],
      precautions: [
        "மின்விசிறி இறக்கைகளை தொடுவதற்கு முன் சுவிட்சை முழுமையாக அணைக்கவும்.",
        "இறக்கைகளை வளைக்கவோ அழுத்தவோ கூடாது."
      ],
      steps: [
        "மின்விசிறி சுவிட்ச் மற்றும் ரெகுலேட்டரை முழுமையாக OFF செய்யவும்.",
        "ஸ்டூலில் ஏறி தூசிகள் கீழே விழாமல் இருக்க துணியால் இறக்கைகளை துடைக்கவும்.",
        "லேசான ஈரத்துணியால் இறக்கைகளின் இருபுறமும் உள்ள தூசியை சுத்தம் செய்யவும்.",
        "இறக்கைகளின் திருகுகள் தளர்வின்றி இறுக்கமாக உள்ளதா என பார்க்கவும்.",
        "சுவிட்சை ஆன் செய்து விசிறி சீராக சுழல்கிறதா என சோதிக்கவும்."
      ]
    },
    hi: {
      title: "सीलिंग फैन सफाई और रेगुलेटर जांच",
      estimatedMinutes: 10,
      tools: ["स्टूल / कुर्सी", "माइक्रोफाइबर कपड़ा", "हल्का साबुन पानी"],
      parts: ["कोई नहीं"],
      precautions: [
        "पंखे को छूने से पहले स्विच पूरी तरह बंद करें।",
        "पंखे की पंखुड़ियों को मोड़ें नहीं।"
      ],
      steps: [
        "पंखे का स्विच और रेगुलेटर बंद करें।",
        "स्टूल पर चढ़कर कपड़े से पंखुड़ियों की धूल साफ करें।",
        "हल्के गीले कपड़े से दोनों तरफ अच्छी तरह पोंछें।",
        "पंखुड़ियों के पेंच ढीले न हों यह सुनिश्चित करें।",
        "स्विच ऑन करके सभी स्पीड पर पंखे की जांच करें।"
      ]
    },
    te: {
      title: "సీలింగ్ ఫ్యాన్ క్లీనింగ్ & రెగ్యులేటర్ తనిఖీ",
      estimatedMinutes: 10,
      tools: ["స్టూల్", "గుడ్డ", "సబ్బు నీరు"],
      parts: ["ఏమీ లేదు"],
      precautions: ["ఫ్యాన్ స్విచ్ ఆఫ్ చేసి పని చేయండి."],
      steps: [
        "ఫ్యాన్ స్విచ్ మరియు రెగ్యులేటర్ ఆఫ్ చేయండి.",
        "రెక్కలపై ఉన్న దుమ్మును గుడ్డతో శుభ్రం చేయండి.",
        "స్క్రూలు బిగుతుగా ఉన్నాయో లేదో చూసుకోండి.",
        "స్విచ్ ఆన్ చేసి ఫ్యాన్ వేగాన్ని పరీక్షించండి."
      ]
    },
    ml: {
      title: "ഫാൻ ക്ലീനിംഗും റെഗുലേറ്റർ പരിശോധനയും",
      estimatedMinutes: 10,
      tools: ["സ്റ്റൂൾ", "തുണി", "സോപ്പ് വെള്ളം"],
      parts: ["ഇല്ല"],
      precautions: ["ഫാൻ സ്വിച്ച് ഓഫ് ചെയ്ത ശേഷം മാത്രം തൊടുക."],
      steps: [
        "ഫാൻ സ്വിച്ച് ഓഫ് ചെയ്യുക.",
        "തുണികൊണ്ട് ലീഫിലെ പൊടി തുടച്ചുമാറ്റുക.",
        "സ്ക്രൂകൾ മുറുക്കി ഫാൻ ഓൺ ചെയ്ത് പരിശോധിക്കുക."
      ]
    },
    kn: {
      title: "ಸೀಲಿಂಗ್ ಫ್ಯಾನ್ ಸ್ವಚ್ಛತೆ ಮತ್ತು ನಿಯಂತ್ರಕ ತಪಾಸಣೆ",
      estimatedMinutes: 10,
      tools: ["ಸ್ಟೂಲ್", "ಬಟ್ಟೆ", "ಸಾಬೂನು ನೀರು"],
      parts: ["ಯಾವುದೂ ಇಲ್ಲ"],
      precautions: ["ಫ್ಯಾನ್ ಸ್ವಿಚ್ ಆಫ್ ಮಾಡಿ ಸ್ವಚ್ಛಗೊಳಿಸಿ."],
      steps: [
        "ಫ್ಯಾನ್ ಸ್ವಿಚ್ ಆಫ್ ಮಾಡಿ.",
        "ಬಟ್ಟೆಯಿಂದ ಧೂಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ.",
        "ಸ್ಕ್ರೂಗಳನ್ನು ಬಿಗಿಗೊಳಿಸಿ ಫ್ಯಾನ್ ಆನ್ ಮಾಡಿ ಪರೀಕ್ಷಿಸಿ."
      ]
    }
  },

  ac: {
    en: {
      title: "Air Conditioner (AC) Air Filter Cleaning & Power Check",
      estimatedMinutes: 12,
      tools: ["Dry Cloth", "Soft Brush", "Luke-warm Water"],
      parts: ["None"],
      precautions: ["Turn off AC main isolator switch before opening front cover."],
      steps: [
        "Power down the AC unit and unplug or flip wall breaker switch.",
        "Gently lift the front intake grille panel until it clicks into position.",
        "Slide out the dual mesh air filters and wash under running warm water.",
        "Allow filters to dry completely in shade before re-installing.",
        "Re-insert filters into guide rails, close front panel, and test cooling."
      ]
    },
    ta: {
      title: "ஏர் கண்டிஷனர் (AC) ஏர் ஃபில்டர் சுத்தம் & மின் பரிசோதனை",
      estimatedMinutes: 12,
      tools: ["உலர்ந்த துணி", "மென்மையான பிரஷ்", "வெதுவெதுப்பான நீர்"],
      parts: ["தேவை இல்லை"],
      precautions: ["முன் கவரை திறக்கும் முன் AC மெயின் சுவிட்சை OFF செய்யவும்."],
      steps: [
        "AC யூனிட்டின் சுவிட்ச் மற்றும் பிரதான பவரை OFF செய்யவும்.",
        "முன்பக்க கிரில் பேனலை மெதுவாக மேல்நோக்கி தூக்கி லாக் செய்யவும்.",
        "இரு ஃபில்டர் வலைகளையும் வெளியே எடுத்து தண்ணீரில் நன்றாக கழுவவும்.",
        "ஃபில்டரை நிழலில் உலர வைத்து பின் மீண்டும் பொருத்தவும்.",
        "முன்பக்க பேனலை மூடி AC-யை ஆன் செய்து குளிரூட்டலை சோதிக்கவும்."
      ]
    },
    hi: {
      title: "एयर कंडीशनर (AC) एयर फिल्टर सफाई गाइड",
      estimatedMinutes: 12,
      tools: ["सूखा कपड़ा", "मुलायम ब्रश", "गुनगुना पानी"],
      parts: ["कोई नहीं"],
      precautions: ["कवर खोलने से पहले AC का मेन स्विच बंद करें।"],
      steps: [
        "AC को बंद करें और मेन पावर स्विच बंद करें।",
        "सामने का पैनल धीरे से ऊपर उठाएं।",
        "दोनों एयर फिल्टर निकालकर पानी में धोएं।",
        "फिल्टर को सुखाकर वापस स्लॉट में लगाएं।",
        "पैनल बंद करके AC चलाकर कूलिंग चेक करें।"
      ]
    },
    te: {
      title: "ఎయిర్ కండీషనర్ (AC) ఫిల్టర్ క్లీనింగ్",
      estimatedMinutes: 12,
      tools: ["పొడి గుడ్డ", "బ్రష్", "నీరు"],
      parts: ["ఏమీ లేదు"],
      precautions: ["AC మెయిన్ స్విచ్ ఆఫ్ చేయండి."],
      steps: [
        "AC పవర్ ఆఫ్ చేయండి.",
        "ముందు ప్యానెల్ తెరిచి ఫిల్టర్లను తీయండి.",
        "నీటితో శుభ్రం చేసి ఆరబెట్టి తిరిగి అమర్చండి.",
        "AC ఆన్ చేసి కూలింగ్ తనిಖీ చేయండి."
      ]
    },
    ml: {
      title: "എസി (AC) എയർ ഫിൽറ്റർ ക്ലീനിംഗ്",
      estimatedMinutes: 12,
      tools: ["തുണി", "ബ്രഷ്", "വെള്ളം"],
      parts: ["ഇല്ല"],
      precautions: ["മെയിൻ സ്വിച്ച് ഓഫ് ചെയ്യുക."],
      steps: [
        "എസി ഓഫ് ചെയ്ത് പവർ നിർത്തുക.",
        "ഫ്രണ്ട് പാനൽ തുറന്ന് ഫിൽറ്റർ എടുക്കുക.",
        "വെള്ളത്തിൽ കഴുകി ഉണക്കി തിരികെ വെക്കുക.",
        "എസി ഓൺ ചെയ്ത് പരിശോധിക്കുക."
      ]
    },
    kn: {
      title: "ಏರ್ ಕಂಡಿಷನರ್ (AC) ಫಿಲ್ಟರ್ ಸ್ವಚ್ಛತೆ",
      estimatedMinutes: 12,
      tools: ["ಬಟ್ಟೆ", "ಬ್ರಷ್", "ನೀರು"],
      parts: ["ಯಾವುದೂ ಇಲ್ಲ"],
      precautions: ["ಮುಖ್ಯ ಸ್ವಿಚ್ ಆಫ್ ಮಾಡಿ."],
      steps: [
        "AC ಪವರ್ ಆಫ್ ಮಾಡಿ.",
        "ಮುಂಭಾಗದ ಪ್ಯಾನೆಲ್ ತೆರೆದು ಫಿಲ್ಟರ್ ತೆಗೆಯಿರಿ.",
        "ನೀರಿನಲ್ಲಿ ತೊಳೆದು ಒಣಗಿಸಿ ಮರುಜೋಡಿಸಿ.",
        "AC ಆನ್ ಮಾಡಿ ಕೂಲಿಂಗ್ ಪರೀಕ್ಷಿಸಿ."
      ]
    }
  },

  network: {
    en: {
      title: "Wi-Fi Router Reset & Patch Cable Reseating",
      estimatedMinutes: 5,
      tools: ["None required (Finger-operated)"],
      parts: ["Cat6 RJ45 Patch Cord (Optional if damaged)"],
      precautions: [
        "Do NOT press the needle factory-reset button unless advised by IT."
      ],
      steps: [
        "Unplug the black power adapter cord from the rear of the router.",
        "Inspect the Ethernet cable connector clip; ensure it clicks firmly into the WAN port.",
        "Wait 30 full seconds for internal capacitors to discharge.",
        "Plug power adapter back in and wait 90 seconds for internet LED to glow solid green.",
        "Reconnect your device and test speed on campus intranet."
      ]
    },
    ta: {
      title: "வைஃபை ரூட்டர் ரீசெட் & கேபிள் மறுபொருத்துதல்",
      estimatedMinutes: 5,
      tools: ["கருவிகள் தேவையில்லை"],
      parts: ["ஈத்தர்நெட் கேபிள் (தேவைப்பட்டால்)"],
      precautions: [
        "ஐடி அறிவுறுத்தல் இன்றி பின்னால் உள்ள Factory Reset பட்டனை அழுத்த வேண்டாம்."
      ],
      steps: [
        "ரூட்டரின் பின்புறத்தில் உள்ள பவர் அடாப்டர் ஒயரை கழற்றவும்.",
        "ஈத்தர்நெட் கேபிளை கழற்றி மீண்டும் WAN போர்ட்டில் 'கிளிக்' சத்தம் வரும் வரை பொருத்தவும்.",
        "30 வினாடிகள் காத்திருக்கவும்.",
        "பவர் அடாப்டரை மீண்டும் இணைத்து Internet LED பச்சை நிறத்தில் எரியும் வரை 90 வினாடிகள் காத்திருக்கவும்.",
        "உங்கள் மொபைல் அல்லது லேப்டாப்பில் வைஃபை இணைத்து இணைய வேகத்தை சோதிக்கவும்."
      ]
    },
    hi: {
      title: "वाई-फाई राउटर रीसेट और केबल जांच",
      estimatedMinutes: 5,
      tools: ["कोई उपकरण आवश्यक नहीं"],
      parts: ["ईथरनेट केबल"],
      precautions: ["फैक्ट्री रीसेट बटन न दबाएं।"],
      steps: [
        "राउटर का पावर प्लग निकालें।",
        "LAN/WAN केबल को ठीक से लगाएं।",
        "30 सेकंड प्रतीक्षा करें।",
        "पावर वापस लगाएं और हरी लाइट जलने तक 90 सेकंड प्रतीक्षा करें।",
        "इंटरनेट कनेक्ट करके स्पीड चेक करें।"
      ]
    },
    te: {
      title: "వై-ఫై రౌటర్ రీసెట్ మరియు కేబుల్ తనిఖీ",
      estimatedMinutes: 5,
      tools: ["అవసరం లేదు"],
      parts: ["కేబుల్"],
      precautions: ["రీసెట్ బటన్ నొక్కవద్దు."],
      steps: [
        "రౌటర్ పవర్ కేబుల్ తొలగించండి.",
        "30 సెకన్లు ఆగి తిరిగి ప్లగ్ చేయండి.",
        "ఇంటర్నెట్ లైట్లు వెలిగే వరకు వేచి ఉండండి.",
        "నెట్ స్పీడ్ చెక్ చేయండి."
      ]
    },
    ml: {
      title: "വൈഫൈ റൂട്ടർ റീസെറ്റും കേബിൾ പരിശോധനയും",
      estimatedMinutes: 5,
      tools: ["ആവശ്യമില്ല"],
      parts: ["കേബിൾ"],
      precautions: ["ഫാക്ടറി റീസെറ്റ് ബട്ടൺ അമർത്തരുത്."],
      steps: [
        "റൂട്ടറിന്റെ പവർ അഴിക്കുക.",
        "30 സെക്കൻഡ് കഴിഞ്ഞ് വീണ്ടും പ്ലഗ് ചെയ്യുക.",
        "ഇന്റർനെറ്റ് ലൈറ്റ് തെളിയുമ്പോൾ കണക്ട് ചെയ്യുക."
      ]
    },
    kn: {
      title: "ವೈ-ಫೈ ರೂಟರ್ ಮರುಹೊಂದಿಸುವಿಕೆ",
      estimatedMinutes: 5,
      tools: ["ಬೇಕಾಗಿಲ್ಲ"],
      parts: ["ಕೇಬಲ್"],
      precautions: ["ರೀಸೆಟ್ ಬಟನ್ ಒತ್ತಬೇಡಿ."],
      steps: [
        "ರೂಟರ್ ಪವರ್ ಆಫ್ ಮಾಡಿ.",
        "30 ಸೆಕೆಂಡುಗಳ ನಂತರ ಆನ್ ಮಾಡಿ.",
        "ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಪರೀಕ್ಷಿಸಿ."
      ]
    }
  },

  cleaning: {
    en: {
      title: "Corridor Surface Spill & Dustbin Cleaning",
      estimatedMinutes: 12,
      tools: ["Microfiber Mop", "Rubber Cleaning Gloves", "Safety Wet-Floor Sign"],
      parts: ["Neutral Disinfectant Cleaner"],
      precautions: [
        "Always erect the wet-floor cautionary sign prior to mopping."
      ],
      steps: [
        "Put on protective rubber gloves and dilute 30ml disinfectant into a mop bucket.",
        "Place the wet-floor caution triangle visibly at the corridor entrance.",
        "Mop the spill inward towards the center to avoid spreading contamination.",
        "Perform a final rinse mop with clean warm water and let dry naturally for 5 minutes."
      ]
    },
    ta: {
      title: "தரைக்கசிவு சுத்தம் & குப்பைத்தொட்டி பராமரிப்பு",
      estimatedMinutes: 12,
      tools: ["மைக்ரோஃபைபர் மாப்", "ரப்பர் கையுறைகள்", "ஈரத்தரை எச்சரிக்கை பலகை"],
      parts: ["கிருமிநாசினி திரவம்"],
      precautions: [
        "துடைக்கும் முன் வழுக்கும் தரை எச்சரிக்கை பலகையை வைக்கவும்."
      ],
      steps: [
        "ரப்பர் கையுறைகளை அணிந்து மாப் பக்கெட்டில் கிருமிநாசினியை கலக்கவும்.",
        "எச்சரிக்கை பலகையை நுழைவாயிலில் வைக்கவும்.",
        "மாப் கொண்டு அழுக்கு பரவாமல் உள்நோக்கி துடைக்கவும்.",
        "சுத்தமான நீரால் மீண்டும் துடைத்து 5 நிமிடங்கள் உலர விடவும்."
      ]
    },
    hi: {
      title: "फर्श की सफाई और डस्टबिन रखरखाव",
      estimatedMinutes: 12,
      tools: ["माइक्रोफाइबर पोछा", "रबर दस्ताने", "गीला फर्श साइन"],
      parts: ["कीटाणुनाशक"],
      precautions: ["सफाई से पहले गीला फर्श बोर्ड लगाएं।"],
      steps: [
        "दस्ताने पहनकर पानी में कीटाणुनाशक मिलाएं।",
        "गीला फर्श का बोर्ड लगाएं।",
        "पोछे से फर्श को अच्छी तरह साफ करें।",
        "साफ पानी से पोंछकर 5 मिनट सूखने दें।"
      ]
    },
    te: {
      title: "ఫ్లోర్ క్లీనింగ్ & డస్ట్‌బిన్ నిర్వహణ",
      estimatedMinutes: 12,
      tools: ["మాప్", "గ్లౌజులు"],
      parts: ["క్లీనర్"],
      precautions: ["జాగ్రత్త బోర్డు పెట్టండి."],
      steps: [
        "గ్లౌజులు ధరించి క్లీనర్‌తో మాపింగ్ చేయండి.",
        "5 నిమిషాలు ఆరనివ్వండి."
      ]
    },
    ml: {
      title: "ഫ്ലോർ ക്ലീനിംഗും മാലിന്യ നിർമാർജനവും",
      estimatedMinutes: 12,
      tools: ["മോപ്പ്", "ഗ്ലൗസ്"],
      parts: ["ക്ലീനർ"],
      precautions: ["മുന്നറിയിപ്പ് ബോർഡ് വെക്കുക."],
      steps: [
        "ഗ്ലൗസ് ധരിച്ച് വൃത്തിയാക്കുക.",
        "ഉണങ്ങാൻ അനുവദിക്കുക."
      ]
    },
    kn: {
      title: "ನೆಲ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
      estimatedMinutes: 12,
      tools: ["ಮಾಪ್", "ಗ್ಲೌವ್ಸ್"],
      parts: ["ಕ್ಲೀನರ್"],
      precautions: ["ಎಚ್ಚರಿಕೆ ಫಲಕ ಇರಿಸಿ."],
      steps: [
        "ಗ್ಲೌವ್ಸ್ ಧರಿಸಿ ಸ್ವಚ್ಛಗೊಳಿಸಿ.",
        "5 ನಿಮಿಷ ಒಣಗಲು ಬಿಡಿ."
      ]
    }
  },

  other: {
    en: {
      title: "General Minor Fastener Tightening & Inspection",
      estimatedMinutes: 10,
      tools: ["Multi-bit Screwdriver", "Pliers"],
      parts: ["Lock Washers / Screws"],
      precautions: ["Do not overtighten screws into plastic or cast iron."],
      steps: [
        "Inspect loose component and check for stripped threads.",
        "Align mating surfaces and tighten bolts in a cross-pattern.",
        "Test mechanical stability by applying light manual pressure."
      ]
    },
    ta: {
      title: "பொதுவான தளர்ந்த திருகுகள் சீரமைப்பு & பராமரிப்பு",
      estimatedMinutes: 10,
      tools: ["மல்டி-பிட் ஸ்க்ரூடிரைவர்", "பிளேயர் (Pliers)"],
      parts: ["வாஷர்கள் / திருகுகள்"],
      precautions: ["பிளாஸ்டிக் பாகங்களில் திருகுகளை அளவுக்கு அதிகமாக இறுக்க வேண்டாம்."],
      steps: [
        "தளர்ந்த பாகங்களை பரிசோதித்து திருகு இழைகளை சரிபார்க்கவும்.",
        "பொருத்துதல் பகுதிகளை சமமாக வைத்து திருகுகளை இறுக்கவும்.",
        "கையால் மெதுவாக அழுத்தி உறுதித்தன்மையை சோதிக்கவும்."
      ]
    },
    hi: {
      title: "सामान्य फास्टनर और पेंच कसने की गाइड",
      estimatedMinutes: 10,
      tools: ["पेचकश", "प्लायर्स"],
      parts: ["वॉशर / पेंच"],
      precautions: ["प्लास्टिक के हिस्सों पर ज्यादा जोर न लगाएं।"],
      steps: [
        "ढीले हिस्से की जांच करें।",
        "पेंचों को ठीक से कसें।",
        "हाथ से दबाकर मजबूती चेक करें।"
      ]
    },
    te: {
      title: "సాధారణ స్క్రూల బిగింపు మరియు తనిఖీ",
      estimatedMinutes: 10,
      tools: ["స్క్రూడ్రైవర్"],
      parts: ["స్క్రూలు"],
      precautions: ["ఎక్కువగా బిగించవద్దు."],
      steps: [
        "వదులుగా ఉన్న స్క్రూలను తనిఖీ చేయండి.",
        "స్క్రూడ్రైవర్‌తో బిగించి స్థిరత్వాన్ని పరీక్షించండి."
      ]
    },
    ml: {
      title: "സാധാരണ സ്ക്രൂ മുറുക്കലും പരിശോധനയും",
      estimatedMinutes: 10,
      tools: ["സ്ക്രൂഡ്രൈവർ"],
      parts: ["സ്ക്രൂകൾ"],
      precautions: ["അമിതമായി മുറുക്കരുത്."],
      steps: [
        "അയഞ്ഞ ഭാഗങ്ങൾ പരിശോധിക്കുക.",
        "സ്ക്രൂകൾ മുറുക്കി ഉറപ്പ് വരുത്തുക."
      ]
    },
    kn: {
      title: "ಸಾಮಾನ್ಯ ಸ್ಕ್ರೂ ಬಿಗಿಗೊಳಿಸುವಿಕೆ",
      estimatedMinutes: 10,
      tools: ["ಸ್ಕ್ರೂಡ್ರೈವರ್"],
      parts: ["ಸ್ಕ್ರೂಗಳು"],
      precautions: ["ಹೆಚ್ಚು ಬಿಗಿಗೊಳಿಸಬೇಡಿ."],
      steps: [
        "ಸಡಿಲವಾದ ಭಾಗಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ.",
        "ಸ್ಕ್ರೂಗಳನ್ನು ಬಿಗಿಗೊಳಿಸಿ ಸ್ಥಿರತೆ ನೋಡಿ."
      ]
    }
  },

  keyboard: {
    en: {
      title: "Keyboard Keycap / Cable / Unresponsive Key Troubleshooting",
      estimatedMinutes: 5,
      tools: ["Keycap Puller / Tweezers", "Compressed Air Can / Soft Brush", "Cotton Swab & Isopropyl Alcohol"],
      parts: ["Replacement Keycap or USB Cable (If damaged)"],
      precautions: [
        "Unplug the keyboard from computer / USB port before cleaning or removing keycaps.",
        "Do not pour liquid cleaner directly onto the keyboard PCB board."
      ],
      steps: [
        "Unplug the USB connector or turn off wireless power switch.",
        "Gently pull up the stuck or broken keycap vertically using tweezers or keycap puller.",
        "Clear accumulated dust, debris, or food particles beneath the membrane/switch with compressed air.",
        "Inspect the mechanical stem or rubber dome for damage; re-seat the keycap firmly until it clicks.",
        "Plug into an alternate USB 3.0 port on the CPU to verify key recognition in Device Manager."
      ]
    },
    ta: {
      title: "விசைப்பலகை (Keyboard) கேபிள் மற்றும் விசை சரிசெய்தல் வழிகாட்டி",
      estimatedMinutes: 5,
      tools: ["ட்வீசர் (Tweezers)", "மென்மையான பிரஷ்", "ஆல்கஹால் துடைப்பான்"],
      parts: ["மாற்று விசை அல்லது USB கேபிள்"],
      precautions: [
        "கீபோர்டை கணினியிலிருந்து கழற்றிய பின்பே சுத்தம் செய்யவும்.",
        "நேரடியாக திரவத்தை கீபோர்டின் மேல் ஊற்றாதீர்கள்."
      ],
      steps: [
        "USB வயரை கணினியிலிருந்து கழற்றவும் அல்லது வயர்லெஸ் சுவிட்சை ஆஃப் செய்யவும்.",
        "சிக்கியுள்ள விசையை (Keycap) ட்வீசர் கொண்டு கவனமாக மேல்நோக்கி இழுத்து கழற்றவும்.",
        "விசைக்கு அடியில் உள்ள தூசிகள் மற்றும் அழுக்குகளை மென்மையான பிரஷ் மூலம் சுத்தம் செய்யவும்.",
        "விசையை அதன் இடத்தில் வைத்து 'க்ளிக்' சத்தம் வரும் வரை அழுத்தி பொருத்தவும்.",
        "USB கேபிளை மீண்டும் கணினியில் பொருத்தி அனைத்து விசைகளும் வேலை செய்கிறதா என சோதிக்கவும்."
      ]
    },
    hi: {
      title: "कीबोर्ड कीज और केबल समस्या समाधान गाइड",
      estimatedMinutes: 5,
      tools: ["चिमटी / ट्वीज़र", "सॉफ्ट ब्रश", "कॉटन"],
      parts: ["यूएसबी केबल"],
      precautions: [
        "सफाई से पहले कीबोर्ड को कंप्यूटर से अनप्लग करें।"
      ],
      steps: [
        "कीबोर्ड का यूएसबी प्लग कंप्यूटर से निकालें।",
        "अटकी हुई की को चिमटी से धीरे से ऊपर खींचें।",
        "अंदर की धूल ब्रश से साफ करें।",
        "की को वापस दबाकर लॉक करें।",
        "कंप्यूटर में जोड़कर टाइपिंग चेक करें।"
      ]
    },
    te: {
      title: "కీబోర్డ్ కీల మరమ్మతు & క్లీనింగ్ గైడ్",
      estimatedMinutes: 5,
      tools: ["ట్వీజర్", "బ్రష్"],
      parts: ["కేబుల్"],
      precautions: ["ముందుగా USB కేబుల్ తొలగించండి."],
      steps: [
        "కీబోర్డ్ USB కనెక్షన్ తొలగించండి.",
        "సమస్య ఉన్న కీని నెమ్మదిగా పైకి తీయండి.",
        "దుమ్మును బ్రష్‌తో శుభ్రం చేయండి.",
        "కీని తిరిగి అమర్చి బిగించండి.",
        "సిస్టమ్‌కు కనెక్ట్ చేసి పరీక్షించండి."
      ]
    },
    ml: {
      title: "കീബോർഡ് കീകൾ വൃത്തിയാക്കലും പരിഹാരവും",
      estimatedMinutes: 5,
      tools: ["ട്വീസർ", "ബ്രഷ്"],
      parts: ["കേബിൾ"],
      precautions: ["ആദ്യം യുഎസ്ബി അഴിക്കുക."],
      steps: [
        "കീബോർഡ് കമ്പ്യൂട്ടറിൽ നിന്ന് അഴിക്കുക.",
        "തടസ്സപ്പെട്ട കീ പതുക്കെ ഊരിയെടുക്കുക.",
        "അടിയിലെ പൊടി ബ്രഷ് കൊണ്ട് കളയുക.",
        "കീ തിരികെ വെച്ച് അമർത്തുക.",
        "കമ്പ്യൂട്ടറിൽ ഘടിപ്പിച്ച് പരിശോധിക്കുക."
      ]
    },
    kn: {
      title: "ಕೀಬೋರ್ಡ್ ಕೀಲಿಗಳ ದುರಸ್ತಿ ಮಾರ್ಗದರ್ಶಿ",
      estimatedMinutes: 5,
      tools: ["ಟ್ವೀಜರ್", "ಬ್ರಷ್"],
      parts: ["ಕೇಬಲ್"],
      precautions: ["ಮೊದಲು ಯುಎಸ್‌ಬಿ ಕೇಬಲ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಳಿಸಿ."],
      steps: [
        "ಕೀಬೋರ್ಡ್ ಯುಎಸ್‌ಬಿ ತೆಗೆಯಿರಿ.",
        "ಕೀಲಿಯನ್ನು ನಿಧಾನವಾಗಿ ಮೇಲಕ್ಕೆತ್ತಿ.",
        "ಒಳಗಿನ ಧೂಳು ಸ್ವಚ್ಛಗೊಳಿಸಿ.",
        "ಕೀಲಿಯನ್ನು ಮರುಜೋಡಿಸಿ.",
        "ಕಂಪ್ಯೂಟರ್‌ಗೆ ಸಂಪರ್ಕಿಸಿ ಪರೀಕ್ಷಿಸಿ."
      ]
    }
  },

  mouse: {
    en: {
      title: "Optical Mouse Sensor & Click Switch Troubleshooting",
      estimatedMinutes: 5,
      tools: ["Cotton Swab", "Rubbing Alcohol"],
      parts: ["AA/AAA Battery (if wireless)"],
      precautions: ["Never look directly into the infrared/optical sensor LED."],
      steps: [
        "Unplug the mouse USB or turn off wireless battery toggle.",
        "Dip cotton swab lightly in alcohol and clean the bottom optical lens sensor cavity.",
        "Blow gently to dry lens; test left and right click mechanical tension.",
        "For wireless models, replace old battery with a fresh cell.",
        "Re-plug into USB port and test cursor movement on a clean mousepad."
      ]
    },
    ta: {
      title: "மவுஸ் சென்சார் மற்றும் கிளிக் பட்டன் சரிசெய்தல்",
      estimatedMinutes: 5,
      tools: ["பஞ்சு குச்சி (Cotton Swab)", "ஆல்கஹால்"],
      parts: ["பேட்டரி (வயர்லெஸ் மவுஸ் எனில்)"],
      precautions: ["சென்சார் லென்ஸ் ஒளியை நேராக கண்களால் பார்க்காதீர்கள்."],
      steps: [
        "மவுஸ் USB-ஐ கணினியிலிருந்து கழற்றவும்.",
        "அடியில் உள்ள ஆப்டிகல் சென்சார் லென்ஸை பஞ்சு குச்சியால் மெதுவாக துடைக்கவும்.",
        "வயர்லெஸ் மவுஸ் எனில் புதிய பேட்டரியை போடவும்.",
        "மவுஸ் பேடின் மேல் வைத்து கர்சர் சீராக நகர்கிறதா என சோதிக்கவும்."
      ]
    },
    hi: {
      title: "माउस सेंसर और बटन समस्या समाधान",
      estimatedMinutes: 5,
      tools: ["कॉटन बड"],
      parts: ["बैटरी"],
      precautions: ["सेंसर लाइट को सीधे न देखें।"],
      steps: [
        "माउस अनप्लग करें।",
        "नीचे के लेंस को कॉटन से साफ करें।",
        "वायरलेस है तो नई बैटरी लगाएं।",
        "कंप्यूटर में जोड़कर कर्सर चेक करें।"
      ]
    },
    te: {
      title: "మౌస్ సెన్సార్ క్లీనింగ్ గైడ్",
      estimatedMinutes: 5,
      tools: ["కాటన్"],
      parts: ["బ్యాటరీ"],
      precautions: ["సెన్సార్ లైట్ చూడవద్దు."],
      steps: [
        "మౌస్ అన్‌ప్లగ్ చేయండి.",
        "లెన్స్ శుభ్రం చేయండి.",
        "సిస్టమ్‌కు కనెక్ట్ చేసి చూడండి."
      ]
    },
    ml: {
      title: "മൗസ് സെൻസർ ക്ലീനിംഗ്",
      estimatedMinutes: 5,
      tools: ["കോട്ടൺ"],
      parts: ["ബാറ്ററി"],
      precautions: ["സെൻസർ ലൈറ്റിലേക്ക് നേരിട്ട് നോക്കരുത്."],
      steps: [
        "മൗസ് അഴിക്കുക.",
        "ലെൻസ് വൃത്തിയാക്കുക.",
        "വീണ്ടും ഘടിപ്പിച്ച് പരിശോധിക്കുക."
      ]
    },
    kn: {
      title: "ಮೌಸ್ ಸೆನ್ಸರ್ ಸ್ವಚ್ಛತೆ",
      estimatedMinutes: 5,
      tools: ["ಹತ್ತಿ"],
      parts: ["ಬ್ಯಾಟರಿ"],
      precautions: ["ಸೆನ್ಸರ್ ಬೆಳಕನ್ನು ನೇರವಾಗಿ ನೋಡಬೇಡಿ."],
      steps: [
        "ಮೌಸ್ ತೆಗೆಯಿರಿ.",
        "ಲೆನ್ಸ್ ಸ್ವಚ್ಛಗೊಳಿಸಿ.",
        "ಮರುಸಂಪರ್ಕಿಸಿ ಪರಿಶೀಲಿಸಿ."
      ]
    }
  }
};

export function getLocalizedDiyGuide(guide, lang = 'en') {
  if (!guide) return null;

  const isTa = lang === 'ta';
  const isHi = lang === 'hi';
  const hasTamil = isTa && /[\u0B80-\u0BFF]/.test((guide.title || '') + (guide.steps || []).join(''));
  const hasHindi = isHi && /[\u0900-\u097F]/.test((guide.title || '') + (guide.steps || []).join(''));

  // 1. If guide is dynamically generated with its own title and steps, and matches requested language script
  if (guide.title && Array.isArray(guide.steps) && guide.steps.length > 0 && !guide.isStaticTemplate) {
    if ((!isTa && !isHi) || (isTa && hasTamil) || (isHi && hasHindi)) {
      return {
        ...guide,
        title: guide.title,
        estimatedMinutes: guide.estimatedMinutes || 15,
        difficulty: guide.difficulty || (isTa ? 'எளிது' : 'Easy / Beginner'),
        tools: guide.tools || guide.requiredTools || [],
        parts: guide.parts || guide.spareParts || [],
        precautions: guide.precautions || guide.safetyInstructions || guide.safetyNotes || [],
        steps: guide.steps || guide.recommendedSolution || [],
        whenToCallTechnician: guide.whenToCallTechnician || (isTa ? 'பிரச்சனை தொடர்ந்தால் தொழில்நுட்ப வல்லுநரை அழைக்கவும்.' : 'If physical damage, fluid flooding, or burning odor persists, escalate to a certified technician.')
      };
    }
  }

  // 2. Localization fallback if language script was missing or staticKey provided
  const rawKey = (guide.category || guide.staticKey || guide.key || 'other').toLowerCase();
  const matchedKey = DIY_GUIDES_DATA[rawKey] ? rawKey :
                     (rawKey.includes('plumb') || rawKey.includes('leak') || rawKey.includes('tap') ? 'plumbing' :
                      rawKey.includes('elect') || rawKey.includes('switch') || rawKey.includes('light') ? 'electrical' :
                      rawKey.includes('fan') ? 'fan' :
                      rawKey.includes('ac') ? 'ac' :
                      rawKey.includes('door') || rawKey.includes('infra') ? 'infrastructure' :
                      rawKey.includes('clean') ? 'cleaning' :
                      rawKey.includes('net') || rawKey.includes('wifi') ? 'network' : 'other');

  if (DIY_GUIDES_DATA[matchedKey]) {
    const categoryGuides = DIY_GUIDES_DATA[matchedKey];
    const localized = categoryGuides[lang] || categoryGuides.en || categoryGuides;
    return {
      ...guide,
      key: matchedKey,
      title: localized.title || guide.title,
      estimatedMinutes: localized.estimatedMinutes || guide.estimatedMinutes || 10,
      difficulty: localized.difficulty || guide.difficulty || (isTa ? 'எளிது' : 'Easy / Beginner'),
      tools: localized.tools || guide.tools || [],
      parts: localized.parts || guide.parts || [],
      precautions: localized.precautions || guide.precautions || [],
      steps: localized.steps || guide.steps || [],
      whenToCallTechnician: localized.whenToCallTechnician || (isTa ? 'பிரச்சனை தொடர்ந்தால் தொழில்நுட்ப வல்லுநரை அழைக்கவும்.' : 'Contact technician if issue persists.')
    };
  }

  // 3. Final Fallback
  return guide;
}


