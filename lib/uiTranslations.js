import { TRANSLATIONS } from './translations.js';

function flattenMessages(source, out = {}) {
  Object.entries(source || {}).forEach(([key, value]) => {
    if (typeof value === 'string') out[key] = value;
    else flattenMessages(value, out);
  });
  return out;
}

const baseEn = flattenMessages(TRANSLATIONS.en);
const baseLookups = Object.fromEntries(
  Object.entries(TRANSLATIONS).map(([lang, messages]) => {
    const flat = flattenMessages(messages);
    return [
      lang,
      Object.fromEntries(
        Object.entries(baseEn)
          .filter(([, english]) => english)
          .map(([key, english]) => [english, flat[key] || english])
      ),
    ];
  })
);

const COMMON = {
  hi: {
    'Loading MedManage cockpit...': 'MedManage कॉकपिट लोड हो रहा है...',
    'Good morning': 'सुप्रभात',
    'Good afternoon': 'नमस्कार',
    'Good evening': 'शुभ संध्या',
    'Care Plan': 'देखभाल योजना',
    'Dose flow': 'डोज़ प्रवाह',
    'Refill runway': 'रीफिल तैयारी',
    'Safety scan': 'सुरक्षा जांच',
    'Morning, lunch, night, and SOS actions are staged for fast handoff.': 'सुबह, दोपहर, रात और SOS काम तुरंत उपयोग के लिए रखे गए हैं।',
    'Low inventory and shopping reminders are visible before doses run out.': 'दवा खत्म होने से पहले कम स्टॉक और खरीदारी रिमाइंडर दिखते हैं।',
    'AI checks surface interactions, food warnings, and missed-dose advice.': 'AI इंटरैक्शन, भोजन चेतावनी और छूटी डोज़ सलाह दिखाता है।',
    'Set up first dose': 'पहली डोज़ सेट करें',
    'Next dose': 'अगली डोज़',
    'Add Rx': 'दवा जोड़ें',
    'Pill Scan': 'पिल स्कैन',
    'Drug Check': 'दवा जांच',
    'Doctor PDF': 'डॉक्टर PDF',
    'Caregiver ping': 'केयरगिवर सूचना',
    'Doctor visit': 'डॉक्टर विज़िट',
    'Weekly reward': 'साप्ताहिक इनाम',
    'Ready': 'तैयार',
    'Soon': 'जल्द',
    'Active': 'सक्रिय',
    'My Medicines': 'मेरी दवाइयां',
    'Search medicines...': 'दवाइयां खोजें...',
    'No medicines yet': 'अभी कोई दवा नहीं',
    'Add your first medicine to start tracking.': 'ट्रैकिंग शुरू करने के लिए पहली दवा जोड़ें।',
    'Check Drug Interactions': 'दवा इंटरैक्शन जांचें',
    'Pills remaining:': 'बची गोलियां:',
    'Skip': 'छोड़ें',
    'Medicine Details': 'दवा विवरण',
    'Medicine Name *': 'दवा का नाम *',
    'Start typing (e.g. Metformin)': 'लिखना शुरू करें (जैसे Metformin)',
    'Dosage': 'खुराक',
    'Unit': 'यूनिट',
    'Category': 'श्रेणी',
    'Schedule': 'शेड्यूल',
    'Frequency': 'आवृत्ति',
    'Daily': 'दैनिक',
    'Every other day': 'एक दिन छोड़कर',
    'Weekly': 'साप्ताहिक',
    'Every X hours': 'हर X घंटे',
    'As needed': 'ज़रूरत अनुसार',
    'Times': 'समय',
    '+ Add time': '+ समय जोड़ें',
    'Start Date': 'शुरू तारीख',
    'End Date (optional)': 'समाप्ति तारीख (वैकल्पिक)',
    'Refill Tracking (optional)': 'रीफिल ट्रैकिंग (वैकल्पिक)',
    'Current Pill Count': 'मौजूदा गोली संख्या',
    "We'll alert you when less than 7 pills remain": '7 से कम गोलियां बचने पर हम सूचना देंगे',
    'Notes (optional)': 'नोट्स (वैकल्पिक)',
    'Saving...': 'सेव हो रहा है...',
    'Save': 'सेव करें',
    'Identify': 'पहचानें',
    'Health Insights': 'स्वास्थ्य इनसाइट्स',
    'Your 30-day health picture': 'आपकी 30 दिन की स्वास्थ्य तस्वीर',
    'Overall Adherence': 'कुल पालन',
    'Great job!': 'बहुत अच्छा!',
    'Keep improving': 'सुधार जारी रखें',
    'Needs attention': 'ध्यान चाहिए',
    '30-Day Adherence Map': '30 दिन पालन मानचित्र',
    'All taken': 'सब ली गई',
    'Partial': 'आंशिक',
    'By Medicine': 'दवा के अनुसार',
    'Food & Drink Warnings': 'भोजन और पेय चेतावनी',
    'Select a medicine to check food interactions': 'भोजन इंटरैक्शन जांचने के लिए दवा चुनें',
    'Checking food interactions...': 'भोजन इंटरैक्शन जांच रहे हैं...',
    'No major food interactions found.': 'कोई बड़ा भोजन इंटरैक्शन नहीं मिला।',
    'Health Journal': 'स्वास्थ्य जर्नल',
    'Track how you feel each day': 'हर दिन अपनी सेहत दर्ज करें',
    '+ Log Today': '+ आज दर्ज करें',
    'Recent Mood Trend': 'हाल का मूड ट्रेंड',
    'No journal entries yet': 'अभी कोई जर्नल एंट्री नहीं',
    '+ Log First Entry': '+ पहली एंट्री दर्ज करें',
    'How do you feel today?': 'आज आप कैसा महसूस कर रहे हैं?',
    'Vitals (optional)': 'वाइटल्स (वैकल्पिक)',
    'Symptoms (comma-separated)': 'लक्षण (कॉमा से अलग)',
    'Journal Notes': 'जर्नल नोट्स',
    'Reminders': 'रिमाइंडर',
    'Create and manage medication reminders': 'दवा रिमाइंडर बनाएं और संभालें',
    'New Reminder': 'नया रिमाइंडर',
    'Medicine Name': 'दवा का नाम',
    'Date & Time': 'तारीख और समय',
    'Add Reminder': 'रिमाइंडर जोड़ें',
    'Your Reminders': 'आपके रिमाइंडर',
    'No reminders yet. Add one above.': 'अभी कोई रिमाइंडर नहीं। ऊपर एक जोड़ें।',
    'Medication Reminder': 'दवा रिमाइंडर',
    'Snooze': 'स्नूज़',
    'Emergency SOS': 'आपातकालीन SOS',
    'Hold the button for 3 seconds to send an alert': 'अलर्ट भेजने के लिए बटन 3 सेकंड दबाए रखें',
    'Emergency Contacts': 'आपातकालीन संपर्क',
    'Add Contact': 'संपर्क जोड़ें',
    'Cancel': 'रद्द करें',
    'Name (e.g. Mom)': 'नाम (जैसे Mom)',
    'Mobile number (10 digits)': 'मोबाइल नंबर (10 अंक)',
    'Location ready': 'लोकेशन तैयार',
    'Location unavailable — enable GPS for best results': 'लोकेशन उपलब्ध नहीं — बेहतर परिणाम के लिए GPS चालू करें',
    'What happens when SOS triggers:': 'SOS चालू होने पर क्या होता है:',
    'Your live GPS location is captured': 'आपकी लाइव GPS लोकेशन ली जाती है',
    'SMS includes Google Maps link to your exact location': 'SMS में आपकी सटीक लोकेशन का Google Maps लिंक होता है',
    'Event is logged in your SOS history': 'घटना SOS इतिहास में सेव होती है',
    'Your Health, Simplified.': 'आपका स्वास्थ्य, आसान।',
    'Welcome to MedManage': 'MedManage में स्वागत है',
    'Track Every Medicine': 'हर दवा ट्रैक करें',
    'Never Miss a Dose': 'कोई डोज़ न छूटे',
    'AI That Protects You': 'AI जो आपकी सुरक्षा करे',
    'Your Health at a Glance': 'आपका स्वास्थ्य एक नज़र में',
    'Journal, Reports & SOS': 'जर्नल, रिपोर्ट और SOS',
    'Try Demo - No Sign Up': 'डेमो आज़माएं - साइन अप नहीं',
    'Free forever · No credit card · Works offline': 'हमेशा मुफ्त · कोई कार्ड नहीं · ऑफलाइन चलता है',
  },
  bn: {
    'My Medicines': 'আমার ওষুধ', 'Search medicines...': 'ওষুধ খুঁজুন...', 'No medicines yet': 'এখনও ওষুধ নেই', 'Add your first medicine to start tracking.': 'ট্র্যাকিং শুরু করতে প্রথম ওষুধ যোগ করুন।', 'Check Drug Interactions': 'ওষুধের প্রতিক্রিয়া দেখুন', 'Pills remaining:': 'বাকি ট্যাবলেট:', 'Skip': 'এড়িয়ে যান', 'Medicine Details': 'ওষুধের বিবরণ', 'Medicine Name *': 'ওষুধের নাম *', 'Dosage': 'ডোজ', 'Unit': 'ইউনিট', 'Category': 'বিভাগ', 'Schedule': 'সময়সূচী', 'Frequency': 'ঘনত্ব', 'Daily': 'প্রতিদিন', 'Every other day': 'এক দিন পর পর', 'Weekly': 'সাপ্তাহিক', 'Every X hours': 'প্রতি X ঘণ্টা', 'As needed': 'প্রয়োজনে', 'Times': 'সময়', 'Start Date': 'শুরুর তারিখ', 'End Date (optional)': 'শেষ তারিখ (ঐচ্ছিক)', 'Notes (optional)': 'নোট (ঐচ্ছিক)', 'Health Insights': 'স্বাস্থ্য ইনসাইটস', 'Overall Adherence': 'মোট অনুসরণ', 'Health Journal': 'স্বাস্থ্য জার্নাল', 'Reminders': 'রিমাইন্ডার', 'New Reminder': 'নতুন রিমাইন্ডার', 'Emergency SOS': 'জরুরি SOS', 'Emergency Contacts': 'জরুরি যোগাযোগ', 'Add Contact': 'যোগাযোগ যোগ করুন', 'Cancel': 'বাতিল', 'Your Health, Simplified.': 'আপনার স্বাস্থ্য, সহজ।', 'Welcome to MedManage': 'MedManage-এ স্বাগতম', 'Track Every Medicine': 'প্রতিটি ওষুধ ট্র্যাক করুন', 'Never Miss a Dose': 'কোনও ডোজ মিস নয়', 'AI That Protects You': 'AI আপনার সুরক্ষায়', 'Your Health at a Glance': 'স্বাস্থ্য এক নজরে', 'Journal, Reports & SOS': 'জার্নাল, রিপোর্ট ও SOS',
  },
  te: {
    'My Medicines': 'నా మందులు', 'Search medicines...': 'మందులు వెతకండి...', 'No medicines yet': 'ఇంకా మందులు లేవు', 'Add your first medicine to start tracking.': 'ట్రాకింగ్ మొదలుపెట్టడానికి మొదటి మందు జోడించండి.', 'Check Drug Interactions': 'మందుల పరస్పర చర్యలు తనిఖీ చేయండి', 'Pills remaining:': 'మిగిలిన గుళికలు:', 'Skip': 'వదిలేయండి', 'Medicine Details': 'మందు వివరాలు', 'Medicine Name *': 'మందు పేరు *', 'Dosage': 'మోతాదు', 'Unit': 'యూనిట్', 'Category': 'వర్గం', 'Schedule': 'షెడ్యూల్', 'Frequency': 'తరచుదనం', 'Daily': 'రోజూ', 'Every other day': 'రోజు విడిచి రోజు', 'Weekly': 'వారానికి', 'Every X hours': 'ప్రతి X గంటలకు', 'As needed': 'అవసరమైతే', 'Times': 'సమయాలు', 'Start Date': 'ప్రారంభ తేదీ', 'End Date (optional)': 'ముగింపు తేదీ (ఐచ్ఛికం)', 'Notes (optional)': 'గమనికలు (ఐచ్ఛికం)', 'Health Insights': 'ఆరోగ్య అంతర్దృష్టులు', 'Overall Adherence': 'మొత్తం పాటింపు', 'Health Journal': 'ఆరోగ్య జర్నల్', 'Reminders': 'రిమైండర్లు', 'New Reminder': 'కొత్త రిమైండర్', 'Emergency SOS': 'అత్యవసర SOS', 'Emergency Contacts': 'అత్యవసర సంప్రదింపులు', 'Add Contact': 'సంప్రదింపు జోడించండి', 'Cancel': 'రద్దు', 'Your Health, Simplified.': 'మీ ఆరోగ్యం, సులభం.', 'Welcome to MedManage': 'MedManage కు స్వాగతం', 'Track Every Medicine': 'ప్రతి మందును ట్రాక్ చేయండి', 'Never Miss a Dose': 'డోస్ ఎప్పుడూ మిస్ కాదు', 'AI That Protects You': 'మీ రక్షణకు AI', 'Your Health at a Glance': 'మీ ఆరోగ్యం ఒక చూపులో', 'Journal, Reports & SOS': 'జర్నల్, రిపోర్టులు & SOS',
  },
  mr: {
    'My Medicines': 'माझी औषधे', 'Search medicines...': 'औषधे शोधा...', 'No medicines yet': 'अजून औषधे नाहीत', 'Add your first medicine to start tracking.': 'ट्रॅकिंग सुरू करण्यासाठी पहिले औषध जोडा.', 'Check Drug Interactions': 'औषध परस्परसंवाद तपासा', 'Pills remaining:': 'उरलेल्या गोळ्या:', 'Skip': 'वगळा', 'Medicine Details': 'औषध तपशील', 'Medicine Name *': 'औषधाचे नाव *', 'Dosage': 'डोस', 'Unit': 'युनिट', 'Category': 'वर्ग', 'Schedule': 'वेळापत्रक', 'Frequency': 'वारंवारता', 'Daily': 'दररोज', 'Every other day': 'एक दिवसाआड', 'Weekly': 'साप्ताहिक', 'Every X hours': 'प्रत्येक X तासांनी', 'As needed': 'गरजेनुसार', 'Times': 'वेळा', 'Start Date': 'सुरू तारीख', 'End Date (optional)': 'शेवटची तारीख (ऐच्छिक)', 'Notes (optional)': 'नोट्स (ऐच्छिक)', 'Health Insights': 'आरोग्य इनसाइट्स', 'Overall Adherence': 'एकूण पालन', 'Health Journal': 'आरोग्य जर्नल', 'Reminders': 'रिमाइंडर्स', 'New Reminder': 'नवीन रिमाइंडर', 'Emergency SOS': 'आपत्कालीन SOS', 'Emergency Contacts': 'आपत्कालीन संपर्क', 'Add Contact': 'संपर्क जोडा', 'Cancel': 'रद्द', 'Your Health, Simplified.': 'तुमचे आरोग्य, सोपे.', 'Welcome to MedManage': 'MedManage मध्ये स्वागत', 'Track Every Medicine': 'प्रत्येक औषध ट्रॅक करा', 'Never Miss a Dose': 'डोस कधीही चुकवू नका', 'AI That Protects You': 'तुमचे संरक्षण करणारे AI', 'Your Health at a Glance': 'आरोग्य एका नजरेत', 'Journal, Reports & SOS': 'जर्नल, रिपोर्ट्स आणि SOS',
  },
  ta: {
    'My Medicines': 'என் மருந்துகள்', 'Search medicines...': 'மருந்துகளைத் தேடுங்கள்...', 'No medicines yet': 'இன்னும் மருந்துகள் இல்லை', 'Add your first medicine to start tracking.': 'கண்காணிக்க முதல் மருந்தைச் சேர்க்கவும்.', 'Check Drug Interactions': 'மருந்து தொடர்புகளைச் சரிபார்க்கவும்', 'Pills remaining:': 'மீதமுள்ள மாத்திரைகள்:', 'Skip': 'தவிர்', 'Medicine Details': 'மருந்து விவரங்கள்', 'Medicine Name *': 'மருந்து பெயர் *', 'Dosage': 'அளவு', 'Unit': 'அலகு', 'Category': 'வகை', 'Schedule': 'அட்டவணை', 'Frequency': 'அடிக்கடி', 'Daily': 'தினமும்', 'Every other day': 'ஒரு நாள் விட்டு ஒரு நாள்', 'Weekly': 'வாரந்தோறும்', 'Every X hours': 'ஒவ்வொரு X மணிக்கும்', 'As needed': 'தேவையானபோது', 'Times': 'நேரங்கள்', 'Start Date': 'தொடக்க தேதி', 'End Date (optional)': 'முடிவு தேதி (விருப்பம்)', 'Notes (optional)': 'குறிப்புகள் (விருப்பம்)', 'Health Insights': 'ஆரோக்கிய நுண்ணறிவு', 'Overall Adherence': 'மொத்த பின்பற்றல்', 'Health Journal': 'ஆரோக்கிய இதழ்', 'Reminders': 'நினைவூட்டல்கள்', 'New Reminder': 'புதிய நினைவூட்டல்', 'Emergency SOS': 'அவசர SOS', 'Emergency Contacts': 'அவசர தொடர்புகள்', 'Add Contact': 'தொடர்பு சேர்', 'Cancel': 'ரத்து', 'Your Health, Simplified.': 'உங்கள் ஆரோக்கியம், எளிதாக.', 'Welcome to MedManage': 'MedManage வரவேற்கிறது', 'Track Every Medicine': 'ஒவ்வொரு மருந்தையும் கண்காணிக்கவும்', 'Never Miss a Dose': 'ஒரு டோஸும் தவறாது', 'AI That Protects You': 'உங்களை பாதுகாக்கும் AI', 'Your Health at a Glance': 'ஆரோக்கியம் ஒரு பார்வையில்', 'Journal, Reports & SOS': 'இதழ், அறிக்கைகள் & SOS',
  },
  gu: {
    'My Medicines': 'મારી દવાઓ', 'Search medicines...': 'દવાઓ શોધો...', 'No medicines yet': 'હજુ દવાઓ નથી', 'Add your first medicine to start tracking.': 'ટ્રેકિંગ શરૂ કરવા પ્રથમ દવા ઉમેરો.', 'Check Drug Interactions': 'દવા ક્રિયાપ્રતિક્રિયા તપાસો', 'Pills remaining:': 'બાકી ગોળીઓ:', 'Skip': 'છોડો', 'Medicine Details': 'દવા વિગતો', 'Medicine Name *': 'દવાનું નામ *', 'Dosage': 'ડોઝ', 'Unit': 'યુનિટ', 'Category': 'વર્ગ', 'Schedule': 'શેડ્યૂલ', 'Frequency': 'વારંવારતા', 'Daily': 'દૈનિક', 'Every other day': 'એક દિવસ છોડીને', 'Weekly': 'સાપ્તાહિક', 'Every X hours': 'દર X કલાકે', 'As needed': 'જરૂર મુજબ', 'Times': 'સમય', 'Start Date': 'શરૂ તારીખ', 'End Date (optional)': 'અંત તારીખ (વૈકલ્પિક)', 'Notes (optional)': 'નોંધો (વૈકલ્પિક)', 'Health Insights': 'આરોગ્ય આંતરદૃષ્ટિ', 'Overall Adherence': 'કુલ પાલન', 'Health Journal': 'આરોગ્ય જર્નલ', 'Reminders': 'રિમાઇન્ડર્સ', 'New Reminder': 'નવું રિમાઇન્ડર', 'Emergency SOS': 'ઇમરજન્સી SOS', 'Emergency Contacts': 'ઇમરજન્સી સંપર્કો', 'Add Contact': 'સંપર્ક ઉમેરો', 'Cancel': 'રદ', 'Your Health, Simplified.': 'તમારું આરોગ્ય, સરળ.', 'Welcome to MedManage': 'MedManage માં સ્વાગત', 'Track Every Medicine': 'દરેક દવા ટ્રેક કરો', 'Never Miss a Dose': 'ડોઝ ક્યારેય ચૂકશો નહીં', 'AI That Protects You': 'તમારી રક્ષા કરતું AI', 'Your Health at a Glance': 'આરોગ્ય એક નજરે', 'Journal, Reports & SOS': 'જર્નલ, રિપોર્ટ્સ અને SOS',
  },
  ur: {
    'My Medicines': 'میری ادویات', 'Search medicines...': 'ادویات تلاش کریں...', 'No medicines yet': 'ابھی کوئی دوا نہیں', 'Add your first medicine to start tracking.': 'ٹریکنگ شروع کرنے کے لیے پہلی دوا شامل کریں۔', 'Check Drug Interactions': 'ادویات کے تعاملات چیک کریں', 'Pills remaining:': 'باقی گولیاں:', 'Skip': 'چھوڑیں', 'Medicine Details': 'دوا کی تفصیل', 'Medicine Name *': 'دوا کا نام *', 'Dosage': 'خوراک', 'Unit': 'یونٹ', 'Category': 'قسم', 'Schedule': 'شیڈول', 'Frequency': 'تعدد', 'Daily': 'روزانہ', 'Every other day': 'ایک دن چھوڑ کر', 'Weekly': 'ہفتہ وار', 'Every X hours': 'ہر X گھنٹے', 'As needed': 'ضرورت پر', 'Times': 'اوقات', 'Start Date': 'شروع تاریخ', 'End Date (optional)': 'اختتامی تاریخ (اختیاری)', 'Notes (optional)': 'نوٹس (اختیاری)', 'Health Insights': 'صحت کی بصیرت', 'Overall Adherence': 'کل پابندی', 'Health Journal': 'صحت جرنل', 'Reminders': 'یاددہانیاں', 'New Reminder': 'نئی یاددہانی', 'Emergency SOS': 'ایمرجنسی SOS', 'Emergency Contacts': 'ایمرجنسی رابطے', 'Add Contact': 'رابطہ شامل کریں', 'Cancel': 'منسوخ', 'Your Health, Simplified.': 'آپ کی صحت، آسان۔', 'Welcome to MedManage': 'MedManage میں خوش آمدید', 'Track Every Medicine': 'ہر دوا ٹریک کریں', 'Never Miss a Dose': 'کوئی خوراک نہ چھوٹے', 'AI That Protects You': 'آپ کی حفاظت کرنے والی AI', 'Your Health at a Glance': 'صحت ایک نظر میں', 'Journal, Reports & SOS': 'جرنل، رپورٹس اور SOS',
  },
  kn: {
    'My Medicines': 'ನನ್ನ ಔಷಧಿಗಳು', 'Search medicines...': 'ಔಷಧಿಗಳನ್ನು ಹುಡುಕಿ...', 'No medicines yet': 'ಇನ್ನೂ ಔಷಧಿಗಳಿಲ್ಲ', 'Add your first medicine to start tracking.': 'ಟ್ರ್ಯಾಕಿಂಗ್ ಪ್ರಾರಂಭಿಸಲು ಮೊದಲ ಔಷಧಿ ಸೇರಿಸಿ.', 'Check Drug Interactions': 'ಔಷಧ ಸಂವಹನಗಳನ್ನು ಪರಿಶೀಲಿಸಿ', 'Pills remaining:': 'ಉಳಿದ ಗುಳಿಗೆಗಳು:', 'Skip': 'ಬಿಟ್ಟುಬಿಡಿ', 'Medicine Details': 'ಔಷಧಿ ವಿವರಗಳು', 'Medicine Name *': 'ಔಷಧಿ ಹೆಸರು *', 'Dosage': 'ಡೋಸ್', 'Unit': 'ಯುನಿಟ್', 'Category': 'ವರ್ಗ', 'Schedule': 'ವೇಳಾಪಟ್ಟಿ', 'Frequency': 'ಆವರ್ತಿ', 'Daily': 'ಪ್ರತಿದಿನ', 'Every other day': 'ಒಂದು ದಿನ ಬಿಟ್ಟು', 'Weekly': 'ವಾರಕ್ಕೊಮ್ಮೆ', 'Every X hours': 'ಪ್ರತಿ X ಗಂಟೆಗೆ', 'As needed': 'ಅಗತ್ಯವಿದ್ದಾಗ', 'Times': 'ಸಮಯಗಳು', 'Start Date': 'ಪ್ರಾರಂಭ ದಿನಾಂಕ', 'End Date (optional)': 'ಅಂತ್ಯ ದಿನಾಂಕ (ಐಚ್ಛಿಕ)', 'Notes (optional)': 'ಟಿಪ್ಪಣಿಗಳು (ಐಚ್ಛಿಕ)', 'Health Insights': 'ಆರೋಗ್ಯ ಒಳನೋಟಗಳು', 'Overall Adherence': 'ಒಟ್ಟು ಪಾಲನೆ', 'Health Journal': 'ಆರೋಗ್ಯ ಜರ್ನಲ್', 'Reminders': 'ಜ್ಞಾಪನೆಗಳು', 'New Reminder': 'ಹೊಸ ಜ್ಞಾಪನೆ', 'Emergency SOS': 'ತುರ್ತು SOS', 'Emergency Contacts': 'ತುರ್ತು ಸಂಪರ್ಕಗಳು', 'Add Contact': 'ಸಂಪರ್ಕ ಸೇರಿಸಿ', 'Cancel': 'ರದ್ದು', 'Your Health, Simplified.': 'ನಿಮ್ಮ ಆರೋಗ್ಯ, ಸರಳ.', 'Welcome to MedManage': 'MedManage ಗೆ ಸ್ವಾಗತ', 'Track Every Medicine': 'ಪ್ರತಿ ಔಷಧಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ', 'Never Miss a Dose': 'ಡೋಸ್ ತಪ್ಪಿಸಿಕೊಳ್ಳಬೇಡಿ', 'AI That Protects You': 'ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸುವ AI', 'Your Health at a Glance': 'ಆರೋಗ್ಯ ಒಂದು ನೋಟದಲ್ಲಿ', 'Journal, Reports & SOS': 'ಜರ್ನಲ್, ವರದಿಗಳು ಮತ್ತು SOS',
  },
  or: {
    'My Medicines': 'ମୋ ଔଷଧ', 'Search medicines...': 'ଔଷଧ ଖୋଜନ୍ତୁ...', 'No medicines yet': 'ଏଯାଏ ଔଷଧ ନାହିଁ', 'Add your first medicine to start tracking.': 'ଟ୍ରାକିଂ ଆରମ୍ଭ ପାଇଁ ପ୍ରଥମ ଔଷଧ ଯୋଗ କରନ୍ତୁ।', 'Check Drug Interactions': 'ଔଷଧ ପ୍ରତିକ୍ରିୟା ଯାଞ୍ଚ କରନ୍ତୁ', 'Pills remaining:': 'ବାକି ଗୋଳି:', 'Skip': 'ଛାଡନ୍ତୁ', 'Medicine Details': 'ଔଷଧ ବିବରଣୀ', 'Medicine Name *': 'ଔଷଧ ନାମ *', 'Dosage': 'ଡୋଜ୍', 'Unit': 'ୟୁନିଟ୍', 'Category': 'ବର୍ଗ', 'Schedule': 'ସୂଚୀ', 'Frequency': 'ଆବୃତ୍ତି', 'Daily': 'ଦୈନିକ', 'Every other day': 'ଦିନେ ଛାଡି ଦିନେ', 'Weekly': 'ସାପ୍ତାହିକ', 'Every X hours': 'ପ୍ରତି X ଘଣ୍ଟାରେ', 'As needed': 'ଆବଶ୍ୟକତାନୁସାରେ', 'Times': 'ସମୟ', 'Start Date': 'ଆରମ୍ଭ ତାରିଖ', 'End Date (optional)': 'ଶେଷ ତାରିଖ (ଇଚ୍ଛାଧୀନ)', 'Notes (optional)': 'ନୋଟ୍ (ଇଚ୍ଛାଧୀନ)', 'Health Insights': 'ସ୍ୱାସ୍ଥ୍ୟ ଇନସାଇଟ୍ସ', 'Overall Adherence': 'ମୋଟ ପାଳନ', 'Health Journal': 'ସ୍ୱାସ୍ଥ୍ୟ ଜର୍ଣ୍ଣାଲ୍', 'Reminders': 'ରିମାଇଣ୍ଡର', 'New Reminder': 'ନୂଆ ରିମାଇଣ୍ଡର', 'Emergency SOS': 'ଜରୁରୀ SOS', 'Emergency Contacts': 'ଜରୁରୀ ସମ୍ପର୍କ', 'Add Contact': 'ସମ୍ପର୍କ ଯୋଗ କରନ୍ତୁ', 'Cancel': 'ବାତିଲ୍', 'Your Health, Simplified.': 'ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ, ସହଜ।', 'Welcome to MedManage': 'MedManage କୁ ସ୍ୱାଗତ', 'Track Every Medicine': 'ପ୍ରତ୍ୟେକ ଔଷଧ ଟ୍ରାକ୍ କରନ୍ତୁ', 'Never Miss a Dose': 'ଡୋଜ୍ କେବେ ଛାଡିବେ ନାହିଁ', 'AI That Protects You': 'ଆପଣଙ୍କୁ ସୁରକ୍ଷା କରୁଥିବା AI', 'Your Health at a Glance': 'ସ୍ୱାସ୍ଥ୍ୟ ଏକ ନଜରରେ', 'Journal, Reports & SOS': 'ଜର୍ଣ୍ଣାଲ୍, ରିପୋର୍ଟ ଏବଂ SOS',
  },
  ml: {
    'My Medicines': 'എന്റെ മരുന്നുകൾ', 'Search medicines...': 'മരുന്നുകൾ തിരയുക...', 'No medicines yet': 'ഇനിയും മരുന്നുകളില്ല', 'Add your first medicine to start tracking.': 'ട്രാക്കിംഗ് തുടങ്ങാൻ ആദ്യ മരുന്ന് ചേർക്കുക.', 'Check Drug Interactions': 'മരുന്ന് ഇടപെടലുകൾ പരിശോധിക്കുക', 'Pills remaining:': 'ശേഷിക്കുന്ന ഗുളികകൾ:', 'Skip': 'ഒഴിവാക്കുക', 'Medicine Details': 'മരുന്ന് വിവരങ്ങൾ', 'Medicine Name *': 'മരുന്നിന്റെ പേര് *', 'Dosage': 'ഡോസ്', 'Unit': 'യൂണിറ്റ്', 'Category': 'വിഭാഗം', 'Schedule': 'ക്രമം', 'Frequency': 'ആവർത്തനം', 'Daily': 'ദിവസവും', 'Every other day': 'ഒരുദിവസം വിട്ട്', 'Weekly': 'ആഴ്ചതോറും', 'Every X hours': 'ഓരോ X മണിക്കൂറിലും', 'As needed': 'ആവശ്യത്തിന്', 'Times': 'സമയങ്ങൾ', 'Start Date': 'ആരംഭ തീയതി', 'End Date (optional)': 'അവസാന തീയതി (ഐച്ഛികം)', 'Notes (optional)': 'കുറിപ്പുകൾ (ഐച്ഛികം)', 'Health Insights': 'ആരോഗ്യ ഇൻസൈറ്റുകൾ', 'Overall Adherence': 'മൊത്തം പാലനം', 'Health Journal': 'ആരോഗ്യ ജേണൽ', 'Reminders': 'റിമൈൻഡറുകൾ', 'New Reminder': 'പുതിയ റിമൈൻഡർ', 'Emergency SOS': 'അടിയന്തര SOS', 'Emergency Contacts': 'അടിയന്തര കോൺടാക്റ്റുകൾ', 'Add Contact': 'കോൺടാക്റ്റ് ചേർക്കുക', 'Cancel': 'റദ്ദാക്കുക', 'Your Health, Simplified.': 'നിങ്ങളുടെ ആരോഗ്യം, ലളിതം.', 'Welcome to MedManage': 'MedManage ലേക്ക് സ്വാഗതം', 'Track Every Medicine': 'ഓരോ മരുന്നും ട്രാക്ക് ചെയ്യുക', 'Never Miss a Dose': 'ഡോസ് നഷ്ടപ്പെടുത്തരുത്', 'AI That Protects You': 'നിങ്ങളെ സംരക്ഷിക്കുന്ന AI', 'Your Health at a Glance': 'ആരോഗ്യം ഒറ്റനോട്ടത്തിൽ', 'Journal, Reports & SOS': 'ജേണൽ, റിപ്പോർട്ടുകൾ & SOS',
  },
  pa: {
    'My Medicines': 'ਮੇਰੀਆਂ ਦਵਾਈਆਂ', 'Search medicines...': 'ਦਵਾਈਆਂ ਖੋਜੋ...', 'No medicines yet': 'ਹਾਲੇ ਕੋਈ ਦਵਾਈ ਨਹੀਂ', 'Add your first medicine to start tracking.': 'ਟ੍ਰੈਕਿੰਗ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਪਹਿਲੀ ਦਵਾਈ ਸ਼ਾਮਲ ਕਰੋ।', 'Check Drug Interactions': 'ਦਵਾਈ ਇੰਟਰਐਕਸ਼ਨ ਚੈੱਕ ਕਰੋ', 'Pills remaining:': 'ਬਾਕੀ ਗੋਲੀਆਂ:', 'Skip': 'ਛੱਡੋ', 'Medicine Details': 'ਦਵਾਈ ਵੇਰਵੇ', 'Medicine Name *': 'ਦਵਾਈ ਦਾ ਨਾਮ *', 'Dosage': 'ਖੁਰਾਕ', 'Unit': 'ਯੂਨਿਟ', 'Category': 'ਸ਼੍ਰੇਣੀ', 'Schedule': 'ਸ਼ਡਿਊਲ', 'Frequency': 'ਆਵਰਤੀ', 'Daily': 'ਰੋਜ਼ਾਨਾ', 'Every other day': 'ਇੱਕ ਦਿਨ ਛੱਡ ਕੇ', 'Weekly': 'ਹਫ਼ਤਾਵਾਰੀ', 'Every X hours': 'ਹਰ X ਘੰਟੇ', 'As needed': 'ਲੋੜ ਅਨੁਸਾਰ', 'Times': 'ਸਮੇਂ', 'Start Date': 'ਸ਼ੁਰੂ ਮਿਤੀ', 'End Date (optional)': 'ਅੰਤ ਮਿਤੀ (ਵਿਕਲਪਿਕ)', 'Notes (optional)': 'ਨੋਟਸ (ਵਿਕਲਪਿਕ)', 'Health Insights': 'ਸਿਹਤ ਇਨਸਾਈਟਸ', 'Overall Adherence': 'ਕੁੱਲ ਪਾਲਣਾ', 'Health Journal': 'ਸਿਹਤ ਜਰਨਲ', 'Reminders': 'ਰਿਮਾਈਂਡਰ', 'New Reminder': 'ਨਵਾਂ ਰਿਮਾਈਂਡਰ', 'Emergency SOS': 'ਐਮਰਜੈਂਸੀ SOS', 'Emergency Contacts': 'ਐਮਰਜੈਂਸੀ ਸੰਪਰਕ', 'Add Contact': 'ਸੰਪਰਕ ਸ਼ਾਮਲ ਕਰੋ', 'Cancel': 'ਰੱਦ', 'Your Health, Simplified.': 'ਤੁਹਾਡੀ ਸਿਹਤ, ਆਸਾਨ।', 'Welcome to MedManage': 'MedManage ਵਿੱਚ ਸੁਆਗਤ', 'Track Every Medicine': 'ਹਰ ਦਵਾਈ ਟ੍ਰੈਕ ਕਰੋ', 'Never Miss a Dose': 'ਕਦੇ ਡੋਜ਼ ਨਾ ਛੱਡੋ', 'AI That Protects You': 'ਤੁਹਾਡੀ ਰੱਖਿਆ ਕਰਨ ਵਾਲਾ AI', 'Your Health at a Glance': 'ਸਿਹਤ ਇੱਕ ਨਜ਼ਰ ਵਿੱਚ', 'Journal, Reports & SOS': 'ਜਰਨਲ, ਰਿਪੋਰਟਾਂ ਅਤੇ SOS',
  },
};

const FALLBACK_COPY_LANGS = ['bn', 'te', 'mr', 'ta', 'gu', 'ur', 'kn', 'or', 'ml', 'pa'];
FALLBACK_COPY_LANGS.forEach((lang) => {
  COMMON[lang] = {
    ...COMMON[lang],
    'Loading MedManage cockpit...': COMMON[lang]['Loading MedManage cockpit...'] || COMMON[lang].Dashboard || 'MedManage...',
    'Add Medicine': baseLookups[lang]?.['Add Medicine'] || COMMON[lang]['Add Medicine'] || COMMON[lang]['Add Contact'] || 'Add Medicine',
    'Taken': baseLookups[lang]?.Taken || 'Taken',
    'Skipped': baseLookups[lang]?.Skipped || 'Skipped',
    'Missed': baseLookups[lang]?.Missed || 'Missed',
    'Pending': baseLookups[lang]?.Pending || 'Pending',
    'Settings': baseLookups[lang]?.Settings || 'Settings',
    'Language': baseLookups[lang]?.Language || 'Language',
    'Try Demo - No Sign Up': COMMON[lang]['Try Demo - No Sign Up'] || 'Try Demo - No Sign Up',
    'Free forever · No credit card · Works offline': COMMON[lang]['Free forever · No credit card · Works offline'] || 'Free forever · No credit card · Works offline',
  };
});

const PATTERNS = {
  hi: [
    [/^(\d+) tracked$/, '$1 ट्रैक हो रही हैं'],
    [/^Only (\d+) pills left — refill soon$/, 'सिर्फ $1 गोलियां बचीं — जल्द रीफिल करें'],
    [/^AI analyzes your (\d+) medicines for conflicts$/, 'AI आपकी $1 दवाओं में टकराव जांचता है'],
    [/^Taken: (\d+)$/, 'ले ली: $1'],
    [/^Skipped: (\d+)$/, 'छोड़ी: $1'],
    [/^Missed: (\d+)$/, 'छूटी: $1'],
    [/^(\d+) Day Streak$/, '$1 दिन की स्ट्रीक'],
  ],
};

export function translateUiText(value, langCode) {
  if (!value || langCode === 'en') return value;
  const text = String(value);
  const trimmed = text.trim().replace(/\s+/g, ' ');
  if (!trimmed) return value;

  const dictionary = { ...(baseLookups[langCode] || {}), ...(COMMON[langCode] || {}) };
  let translated = dictionary[trimmed];

  if (!translated) {
    const patterns = PATTERNS[langCode] || [];
    const matched = patterns.find(([pattern]) => pattern.test(trimmed));
    if (matched) translated = trimmed.replace(matched[0], matched[1]);
  }

  if (!translated || translated === trimmed) return value;
  const leading = text.match(/^\s*/)?.[0] || '';
  const trailing = text.match(/\s*$/)?.[0] || '';
  return `${leading}${translated}${trailing}`;
}
