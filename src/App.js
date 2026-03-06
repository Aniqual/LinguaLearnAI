import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

// ─── CURRICULUM ───────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: "hi", name: "हिन्दी",   english: "Hindi",     script: "devanagari" },
  { code: "ta", name: "தமிழ்",    english: "Tamil",     script: "tamil"      },
  { code: "te", name: "తెలుగు",   english: "Telugu",    script: "telugu"     },
  { code: "kn", name: "ಕನ್ನಡ",    english: "Kannada",   script: "kannada"    },
  { code: "ml", name: "മലയാളം",   english: "Malayalam", script: "malayalam"  },
  { code: "bn", name: "বাংলা",    english: "Bengali",   script: "bengali"    },
  { code: "mr", name: "मराठी",    english: "Marathi",   script: "devanagari" },
  { code: "gu", name: "ગુજરાતી",  english: "Gujarati",  script: "gujarati"   },
  { code: "pa", name: "ਪੰਜਾਬੀ",   english: "Punjabi",   script: "gurmukhi"   },
  { code: "en", name: "English",  english: "English",   script: "latin"      },
];

const CURRICULUM = {
  6:  { label:"Class 6",  subjects:{ science:{ label:"Science", chapters:["Food: Where Does It Come From?","Components of Food","Fibre to Fabric","Sorting Materials into Groups","Separation of Substances","Changes Around Us","Getting to Know Plants","Body Movements","The Living Organisms and Their Surroundings","Motion and Measurement of Distances","Light, Shadows and Reflections","Electricity and Circuits","Fun with Magnets","Water","Air Around Us","Garbage In, Garbage Out"] }}},
  7:  { label:"Class 7",  subjects:{ science:{ label:"Science", chapters:["Nutrition in Plants","Nutrition in Animals","Fibre to Fabric","Heat","Acids, Bases and Salts","Physical and Chemical Changes","Weather, Climate and Adaptations of Animals to Climate","Winds, Storms and Cyclones","Soil","Respiration in Organisms","Transportation in Animals and Plants","Reproduction in Plants","Motion and Time","Electric Current and its Effects","Light","Water: A Precious Resource","Forests: Our Lifeline","Wastewater Story"] }}},
  8:  { label:"Class 8",  subjects:{ science:{ label:"Science", chapters:["Crop Production and Management","Microorganisms: Friend and Foe","Synthetic Fibres and Plastics","Materials: Metals and Non-Metals","Coal and Petroleum","Combustion and Flame","Conservation of Plants and Animals","Cell — Structure and Functions","Reproduction in Animals","Reaching the Age of Adolescence","Force and Pressure","Friction","Sound","Chemical Effects of Electric Current","Some Natural Phenomena","Light","Stars and the Solar System","Pollution of Air and Water"] }}},
  9:  { label:"Class 9",  subjects:{ physics:{ label:"Physics", chapters:["Motion","Force and Laws of Motion","Gravitation","Work and Energy","Sound"] }, chemistry:{ label:"Chemistry", chapters:["Matter in Our Surroundings","Is Matter Around Us Pure?","Atoms and Molecules","Structure of the Atom"] }, biology:{ label:"Biology", chapters:["The Fundamental Unit of Life","Tissues","Diversity in Living Organisms","Why Do We Fall Ill?","Natural Resources","Improvement in Food Resources"] }}},
  10: { label:"Class 10", subjects:{ physics:{ label:"Physics", chapters:["Light — Reflection and Refraction","Human Eye and Colourful World","Electricity","Magnetic Effects of Electric Current","Sources of Energy"] }, chemistry:{ label:"Chemistry", chapters:["Chemical Reactions and Equations","Acids, Bases and Salts","Metals and Non-metals","Carbon and its Compounds","Periodic Classification of Elements"] }, biology:{ label:"Biology", chapters:["Life Processes","Control and Coordination","How do Organisms Reproduce?","Heredity and Evolution","Our Environment","Management of Natural Resources"] }}},
};

const SUBJECT_COLORS = {
  science:   { bg:"#e8f5e2", accent:"#2d7a1f", light:"#f0fae8" },
  physics:   { bg:"#e3eeff", accent:"#1a4fba", light:"#eef3ff" },
  chemistry: { bg:"#fff3e0", accent:"#c45c00", light:"#fff8f0" },
  biology:   { bg:"#fce4ec", accent:"#b0003a", light:"#fff0f4" },
};
const SUBJECT_ICONS = { science:"🔬", physics:"⚡", chemistry:"⚗️", biology:"🧬" };

// ─── BADGES ───────────────────────────────────────────────────────────────────
const BADGES = [
  { id:"first_lesson",  icon:"🌱", label:"First Lesson",   desc:"Started your first chapter"       },
  { id:"quiz_pass",     icon:"✅", label:"Quiz Passed",    desc:"Scored 75%+ on a quiz"            },
  { id:"perfect_quiz",  icon:"🏆", label:"Perfect Score",  desc:"Got 100% on a quiz"               },
  { id:"streak_3",      icon:"🔥", label:"3-Day Streak",   desc:"Studied 3 days in a row"          },
  { id:"streak_7",      icon:"⚡", label:"Week Warrior",   desc:"Studied 7 days in a row"          },
  { id:"chapters_5",    icon:"📚", label:"Bookworm",       desc:"Studied 5 different chapters"     },
  { id:"points_100",    icon:"⭐", label:"Century!",       desc:"Earned 100 points"                },
  { id:"points_500",    icon:"💎", label:"Diamond",        desc:"Earned 500 points"                },
  { id:"memory_active", icon:"🧠", label:"Sharp Mind",     desc:"Conversation memory activated"    },
];

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const SK = "vigyanGuru_v2";
function loadStorage() { try { return JSON.parse(localStorage.getItem(SK) || "{}"); } catch { return {}; } }
function saveStorage(d) { try { localStorage.setItem(SK, JSON.stringify(d)); } catch {} }

// ─── UI TRANSLATIONS ──────────────────────────────────────────────────────────
const UI_TEXT = {
  hi: { chooseLanguage:"अपनी भाषा चुनें", chooseClass:"अपनी कक्षा चुनें", chooseChapter:"विषय और अध्याय चुनें", chooseChapterSub:"विषय और अध्याय चुनें", chooseClassSub:"NCERT पाठ्यक्रम", startLearning:"पढ़ना शुरू करें", changeLanguage:"← भाषा बदलें", changeClass:"← कक्षा बदलें", allChapters:"सभी अध्याय", inputPlaceholder:"अपना सवाल यहाँ लिखें...", quizButton:"📝 Quiz", homeButton:"← Home", step1:"भाषा", step2:"कक्षा", step3:"अध्याय", quickTips:"Quick Tips", streakLabel:"Streak", pointsLabel:"Points", chaptersLabel:"Chapters", badgesTitle:"आपके Badges", progressTitle:"Progress", memoryLabel:"Memory ON" },
  ta: { chooseLanguage:"உங்கள் மொழியை தேர்வு செய்யுங்கள்", chooseClass:"உங்கள் வகுப்பை தேர்வு செய்யுங்கள்", chooseChapter:"பாடம் தேர்வு செய்யுங்கள்", chooseChapterSub:"பாடம் மற்றும் அத்தியாயம்", chooseClassSub:"NCERT பாடத்திட்டம்", startLearning:"படிக்க தொடங்கு", changeLanguage:"← மொழி மாற்று", changeClass:"← வகுப்பு மாற்று", allChapters:"அனைத்து அத்தியாயங்கள்", inputPlaceholder:"உங்கள் கேள்வியை இங்கே கேளுங்கள்...", quizButton:"📝 வினாடி வினா", homeButton:"← முகப்பு", step1:"மொழி", step2:"வகுப்பு", step3:"அத்தியாயம்", quickTips:"Quick Tips", streakLabel:"Streak", pointsLabel:"மதிப்பெண்", chaptersLabel:"அத்தியாயங்கள்", badgesTitle:"உங்கள் Badges", progressTitle:"முன்னேற்றம்", memoryLabel:"Memory ON" },
  te: { chooseLanguage:"మీ భాషను ఎంచుకోండి", chooseClass:"మీ తరగతిని ఎంచుకోండి", chooseChapter:"విషయం ఎంచుకోండి", chooseChapterSub:"విషయం మరియు అధ్యాయం", chooseClassSub:"NCERT పాఠ్యప్రణాళిక", startLearning:"చదవడం ప్రారంభించు", changeLanguage:"← భాష మార్చు", changeClass:"← తరగతి మార్చు", allChapters:"అన్ని అధ్యాయాలు", inputPlaceholder:"మీ ప్రశ్నను ఇక్కడ అడగండి...", quizButton:"📝 క్విజ్", homeButton:"← హోమ్", step1:"భాష", step2:"తరగతి", step3:"అధ్యాయం", quickTips:"Quick Tips", streakLabel:"Streak", pointsLabel:"పాయింట్లు", chaptersLabel:"అధ్యాయాలు", badgesTitle:"మీ Badges", progressTitle:"పురోగతి", memoryLabel:"Memory ON" },
  kn: { chooseLanguage:"ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ", chooseClass:"ನಿಮ್ಮ ತರಗತಿಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ", chooseChapter:"ವಿಷಯ ಆಯ್ಕೆ ಮಾಡಿ", chooseChapterSub:"ವಿಷಯ ಮತ್ತು ಅಧ್ಯಾಯ", chooseClassSub:"NCERT ಪಠ್ಯಕ್ರಮ", startLearning:"ಓದಲು ಪ್ರಾರಂಭಿಸಿ", changeLanguage:"← ಭಾಷೆ ಬದಲಾಯಿಸಿ", changeClass:"← ತರಗತಿ ಬದಲಾಯಿಸಿ", allChapters:"ಎಲ್ಲಾ ಅಧ್ಯಾಯಗಳು", inputPlaceholder:"ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಕೇಳಿ...", quizButton:"📝 ರಸಪ್ರಶ್ನೆ", homeButton:"← ಮನೆ", step1:"ಭಾಷೆ", step2:"ತರಗತಿ", step3:"ಅಧ್ಯಾಯ", quickTips:"Quick Tips", streakLabel:"Streak", pointsLabel:"ಅಂಕಗಳು", chaptersLabel:"ಅಧ್ಯಾಯಗಳು", badgesTitle:"ನಿಮ್ಮ Badges", progressTitle:"ಪ್ರಗತಿ", memoryLabel:"Memory ON" },
  ml: { chooseLanguage:"നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക", chooseClass:"നിങ്ങളുടെ ക്ലാസ് തിരഞ്ഞെടുക്കുക", chooseChapter:"വിഷയം തിരഞ്ഞെടുക്കുക", chooseChapterSub:"വിഷയവും അധ്യായവും", chooseClassSub:"NCERT പാഠ്യപദ്ധതി", startLearning:"പഠനം ആരംഭിക്കുക", changeLanguage:"← ഭാഷ മാറ്റുക", changeClass:"← ക്ലാസ് മാറ്റുക", allChapters:"എല്ലാ അധ്യായങ്ങളും", inputPlaceholder:"നിങ്ങളുടെ ചോദ്യം ഇവിടെ ചോദിക്കുക...", quizButton:"📝 ക്വിസ്", homeButton:"← ഹോം", step1:"ഭാഷ", step2:"ക്ലാസ്", step3:"അധ്യായം", quickTips:"Quick Tips", streakLabel:"Streak", pointsLabel:"പോയിന്റുകൾ", chaptersLabel:"അധ്യായങ്ങൾ", badgesTitle:"നിങ്ങളുടെ Badges", progressTitle:"പുരോഗതി", memoryLabel:"Memory ON" },
  bn: { chooseLanguage:"আপনার ভাষা বেছে নিন", chooseClass:"আপনার শ্রেণী বেছে নিন", chooseChapter:"বিষয় বেছে নিন", chooseChapterSub:"বিষয় ও অধ্যায়", chooseClassSub:"NCERT পাঠ্যক্রম", startLearning:"পড়া শুরু করুন", changeLanguage:"← ভাষা পরিবর্তন", changeClass:"← শ্রেণী পরিবর্তন", allChapters:"সব অধ্যায়", inputPlaceholder:"আপনার প্রশ্ন এখানে লিখুন...", quizButton:"📝 কুইজ", homeButton:"← হোম", step1:"ভাষা", step2:"শ্রেণী", step3:"অধ্যায়", quickTips:"Quick Tips", streakLabel:"Streak", pointsLabel:"পয়েন্ট", chaptersLabel:"অধ্যায়", badgesTitle:"আপনার Badges", progressTitle:"অগ্রগতি", memoryLabel:"Memory ON" },
  mr: { chooseLanguage:"आपली भाषा निवडा", chooseClass:"आपला वर्ग निवडा", chooseChapter:"विषय निवडा", chooseChapterSub:"विषय आणि प्रकरण", chooseClassSub:"NCERT अभ्यासक्रम", startLearning:"शिकणे सुरू करा", changeLanguage:"← भाषा बदला", changeClass:"← वर्ग बदला", allChapters:"सर्व प्रकरणे", inputPlaceholder:"आपला प्रश्न येथे विचारा...", quizButton:"📝 प्रश्नमंजुषा", homeButton:"← मुख्यपृष्ठ", step1:"भाषा", step2:"वर्ग", step3:"प्रकरण", quickTips:"Quick Tips", streakLabel:"Streak", pointsLabel:"गुण", chaptersLabel:"प्रकरणे", badgesTitle:"तुमचे Badges", progressTitle:"प्रगती", memoryLabel:"Memory ON" },
  gu: { chooseLanguage:"તમારી ભાષા પસંદ કરો", chooseClass:"તમારો વર્ગ પસંદ કરો", chooseChapter:"વિષય પસંદ કરો", chooseChapterSub:"વિષય અને પ્રકરણ", chooseClassSub:"NCERT અભ્યાસક્રમ", startLearning:"ભણવાનું શરૂ કરો", changeLanguage:"← ભાષા બદલો", changeClass:"← વર્ગ બદલો", allChapters:"બધા પ્રકરણો", inputPlaceholder:"તમારો પ્રશ્ન અહીં પૂછો...", quizButton:"📝 ક્વિઝ", homeButton:"← હોમ", step1:"ભાષા", step2:"વર્ગ", step3:"પ્રકરણ", quickTips:"Quick Tips", streakLabel:"Streak", pointsLabel:"પોઈન્ટ", chaptersLabel:"પ્રકરણો", badgesTitle:"તમારા Badges", progressTitle:"પ્રગતિ", memoryLabel:"Memory ON" },
  pa: { chooseLanguage:"ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ", chooseClass:"ਆਪਣੀ ਕਲਾਸ ਚੁਣੋ", chooseChapter:"ਵਿਸ਼ਾ ਚੁਣੋ", chooseChapterSub:"ਵਿਸ਼ਾ ਅਤੇ ਅਧਿਆਏ", chooseClassSub:"NCERT ਪਾਠਕ੍ਰਮ", startLearning:"ਪੜ੍ਹਨਾ ਸ਼ੁਰੂ ਕਰੋ", changeLanguage:"← ਭਾਸ਼ਾ ਬਦਲੋ", changeClass:"← ਕਲਾਸ ਬਦਲੋ", allChapters:"ਸਾਰੇ ਅਧਿਆਏ", inputPlaceholder:"ਆਪਣਾ ਸਵਾਲ ਇੱਥੇ ਪੁੱਛੋ...", quizButton:"📝 ਕੁਇਜ਼", homeButton:"← ਹੋਮ", step1:"ਭਾਸ਼ਾ", step2:"ਕਲਾਸ", step3:"ਅਧਿਆਏ", quickTips:"Quick Tips", streakLabel:"Streak", pointsLabel:"ਅੰਕ", chaptersLabel:"ਅਧਿਆਏ", badgesTitle:"ਤੁਹਾਡੇ Badges", progressTitle:"ਪ੍ਰਗਤੀ", memoryLabel:"Memory ON" },
  en: { chooseLanguage:"Choose Your Language", chooseClass:"Choose Your Class", chooseChapter:"Choose Subject & Chapter", chooseChapterSub:"Select a subject and chapter to begin", chooseClassSub:"NCERT curriculum", startLearning:"Start Learning", changeLanguage:"← Change Language", changeClass:"← Change Class", allChapters:"All Chapters", inputPlaceholder:"Ask your question here...", quizButton:"📝 Quiz", homeButton:"← Home", step1:"Language", step2:"Class", step3:"Chapter", quickTips:"Quick Tips", streakLabel:"Streak", pointsLabel:"Points", chaptersLabel:"Chapters", badgesTitle:"Your Badges", progressTitle:"Progress", memoryLabel:"Memory ON" },
};

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
function buildSystemPrompt(lang, classNum, subject, chapter, memory) {
  const L = lang.english, isEn = lang.code === "en";
  return `CRITICAL INSTRUCTION: You must respond ONLY in ${L}${isEn ? "" : ` (${lang.name})`}. Every single word must be in ${L}. Writing even one sentence in English is a complete failure of your task.

You are LinguaLearnAI, an expert Indian school science tutor deeply familiar with NCERT textbooks.

LANGUAGE (HIGHEST PRIORITY):
- EVERY SINGLE SENTENCE must be in ${L}.
- ${isEn ? "Respond in clear simple English." : `This is a ${L}-medium school. The student does not understand English. Do NOT write in English.`}
- Scientific terms: write in ${L} first, then English in brackets.

CURRICULUM: Class ${classNum} NCERT | Subject: ${subject} | Chapter: "${chapter}"
- Stay STRICTLY within this chapter's NCERT syllabus. Do not go beyond.
- Use NCERT's own definitions and examples.

TEACHING STYLE:
- Use Indian daily-life examples: dal-chawal, roti on tawa, monsoon, auto-rickshaw, cricket, neem tree.
- Be warm, encouraging, patient like a beloved school teacher.
- After each explanation, ask ONE follow-up question or give a small activity.
- Mention how topics appear in board exams (1-mark, 3-mark, 5-mark answers).

QUIZ MODE — when asked for a quiz, respond with ONLY this exact JSON and nothing else:
{"quiz":[{"q":"question text","options":["A) option1","B) option2","C) option3","D) option4"],"answer":"A","explanation":"brief explanation in ${L}"}]}
Generate exactly 4 questions from "${chapter}" NCERT Class ${classNum}.

${memory ? `CONVERSATION MEMORY:\n${memory}\n` : ""}
FINAL REMINDER: Your ENTIRE response must be in ${L}. Zero English sentences allowed.`;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fontFor = s => ({ devanagari:"'Noto Sans Devanagari',sans-serif", tamil:"'Noto Sans Tamil',sans-serif", telugu:"'Noto Sans Telugu',sans-serif", kannada:"'Noto Sans Kannada',sans-serif", malayalam:"'Noto Sans Malayalam',sans-serif", bengali:"'Noto Sans Bengali',sans-serif", gujarati:"'Noto Sans Gujarati',sans-serif", gurmukhi:"'Noto Sans Gurmukhi',sans-serif" }[s] || "'Poppins',sans-serif");
const langIcon = c => ({ hi:"🇮🇳", mr:"🇮🇳", ta:"🌴", te:"🌾", kn:"🏔️", ml:"🌿", bn:"🐯", gu:"🦁", pa:"🌻" }[c] || "📚");

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ notif }) {
  if (!notif) return null;
  return (
    <div style={{ position:"fixed", top:16, right:16, zIndex:9999, background:"#1a1a1a", color:"#fff", padding:"10px 18px", borderRadius:12, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:8, boxShadow:"0 8px 24px rgba(0,0,0,0.25)", animation:"vgSlideIn 0.3s ease", fontFamily:"'Poppins',sans-serif", maxWidth:300 }}>
      <span style={{ fontSize:18 }}>{notif.emoji}</span><span>{notif.msg}</span>
    </div>
  );
}

// ─── BADGE SPLASH ─────────────────────────────────────────────────────────────
function BadgeSplash({ badge, onClose }) {
  if (!badge) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:10000, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:20, padding:"32px 40px", textAlign:"center", animation:"vgPop 0.4s cubic-bezier(0.34,1.56,0.64,1)", boxShadow:"0 20px 60px rgba(0,0,0,0.3)", maxWidth:300 }}>
        <div style={{ fontSize:60, marginBottom:10 }}>{badge.icon}</div>
        <div style={{ fontSize:11, color:"#ff6b2b", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Badge Unlocked!</div>
        <div style={{ fontSize:20, fontWeight:800, color:"#1a1a1a", marginBottom:6 }}>{badge.label}</div>
        <div style={{ fontSize:13, color:"#888", lineHeight:1.5 }}>{badge.desc}</div>
        <button onClick={onClose} style={{ marginTop:18, padding:"9px 24px", background:"#ff6b2b", border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Awesome! 🎉</button>
      </div>
    </div>
  );
}

// ─── INTERACTIVE QUIZ ─────────────────────────────────────────────────────────
function InteractiveQuiz({ quizData, accentColor, lang, onComplete }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);
  const font = fontFor(lang?.script);
  const q = quizData[current];
  const total = quizData.length;

  const handleSelect = (opt) => {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    const correct = opt[0] === q.answer;
    if (correct) setScore(s => s + 1);
    setAnswers(a => [...a, { correct, selected: opt, correctOpt: q.options.find(o => o[0] === q.answer) }]);
  };

  const handleNext = () => {
    if (current < total - 1) { setCurrent(c => c + 1); setSelected(null); setRevealed(false); }
    else { setFinished(true); onComplete(score + (selected?.[0] === q.answer ? 1 : 0), total); }
  };

  if (finished) {
    const finalScore = answers.filter(a => a.correct).length;
    const pct = Math.round((finalScore / total) * 100);
    const progColor = pct >= 75 ? "#2d7a1f" : pct >= 50 ? "#c45c00" : "#b0003a";
    return (
      <div style={{ background:"#fff", borderRadius:16, padding:22, border:`2px solid ${accentColor}33`, maxWidth:500, width:"100%" }}>
        <div style={{ textAlign:"center", marginBottom:18 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>{pct===100?"🏆":pct>=75?"🌟":pct>=50?"👍":"📚"}</div>
          <div style={{ fontSize:28, fontWeight:800, color:accentColor }}>{finalScore}/{total}</div>
          <div style={{ fontSize:13, color:"#888", marginTop:2 }}>{pct}% correct</div>
          <div style={{ marginTop:12, height:10, background:"#f0f0f0", borderRadius:5, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:progColor, borderRadius:5, transition:"width 1.2s ease" }} />
          </div>
          <div style={{ marginTop:8, fontSize:12, color:progColor, fontWeight:600 }}>
            {pct===100 ? "Perfect! You're a champion! 🎊" : pct>=75 ? "Great job! Review the ones you missed." : "Keep practicing — you'll get it! 💪"}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {quizData.map((ques, i) => (
            <div key={i} style={{ background:answers[i]?.correct?"#e8f5e2":"#fce4ec", borderRadius:10, padding:"10px 12px", display:"flex", alignItems:"flex-start", gap:10, border:`1px solid ${answers[i]?.correct?"#2d7a1f33":"#b0003a33"}` }}>
              <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{answers[i]?.correct?"✅":"❌"}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, color:"#333", lineHeight:1.5, fontFamily:font, fontWeight:600 }}>{ques.q}</div>
                {!answers[i]?.correct && <div style={{ fontSize:11, color:"#2d7a1f", marginTop:3 }}>✓ {answers[i]?.correctOpt}</div>}
                <div style={{ fontSize:11, color:"#888", marginTop:3, fontFamily:font }}>💡 {ques.explanation}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background:"#fff", borderRadius:16, padding:20, border:`2px solid ${accentColor}33`, maxWidth:500, width:"100%" }}>
      <div style={{ marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <span style={{ fontSize:11, color:"#aaa", fontWeight:600 }}>Question {current+1} of {total}</span>
          <div style={{ display:"flex", gap:4 }}>
            {quizData.map((_,i) => <div key={i} style={{ width:24, height:6, borderRadius:3, background:i<current?accentColor:i===current?accentColor+"66":"#e8e8e8", transition:"all 0.3s" }} />)}
          </div>
        </div>
        <div style={{ height:4, background:"#f0f0f0", borderRadius:2, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${((current+1)/total)*100}%`, background:accentColor, borderRadius:2, transition:"width 0.4s ease" }} />
        </div>
      </div>
      <div style={{ fontSize:14, fontWeight:600, color:"#1a1a1a", lineHeight:1.65, marginBottom:16, fontFamily:font, background:"#fafafa", padding:"12px 14px", borderRadius:10, border:"1px solid #f0f0f0" }}>{q.q}</div>
      <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
        {q.options.map((opt, i) => {
          const isCorrect = opt[0] === q.answer, isSelected = selected === opt;
          let bg="#f8f8f8", border="#e8e8e8", color="#333";
          if (revealed) { if (isCorrect) { bg="#e8f5e2"; border="#2d7a1f"; color="#1a5c10"; } else if (isSelected) { bg="#fce4ec"; border="#b0003a"; color="#8c0030"; } else { color="#bbb"; } }
          else if (isSelected) { bg=accentColor+"15"; border=accentColor; color=accentColor; }
          return (
            <button key={i} onClick={() => handleSelect(opt)} style={{ padding:"11px 14px", background:bg, border:`2px solid ${border}`, borderRadius:10, cursor:revealed?"default":"pointer", textAlign:"left", color, fontSize:13, fontFamily:font, lineHeight:1.5, transition:"all 0.2s", display:"flex", alignItems:"center", gap:10 }}
              onMouseEnter={e => { if (!revealed && selected!==opt) e.currentTarget.style.borderColor=accentColor; }}
              onMouseLeave={e => { if (!revealed && selected!==opt) e.currentTarget.style.borderColor="#e8e8e8"; }}
            >
              <span style={{ width:24, height:24, borderRadius:6, background:revealed&&isCorrect?"#2d7a1f":revealed&&isSelected?"#b0003a":"#e8e8e8", color:revealed&&(isCorrect||isSelected)?"#fff":"#999", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0, transition:"all 0.2s" }}>{opt[0]}</span>
              <span style={{ flex:1 }}>{opt.slice(3)}</span>
              {revealed && isCorrect && <span style={{ fontWeight:700 }}>✓</span>}
              {revealed && isSelected && !isCorrect && <span style={{ fontWeight:700 }}>✗</span>}
            </button>
          );
        })}
      </div>
      {revealed && <div style={{ background:"#fffbf0", border:"1px solid #ffe0a0", borderRadius:10, padding:"10px 13px", fontSize:12, color:"#7a5800", marginBottom:12, lineHeight:1.6, fontFamily:font }}>💡 {q.explanation}</div>}
      {revealed && <button onClick={handleNext} style={{ width:"100%", padding:"12px", background:accentColor, border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{current<total-1?"Next Question →":"See Results 🏆"}</button>}
    </div>
  );
}

// ─── STATS BAR ────────────────────────────────────────────────────────────────
function StatsBar({ stats, accentColor, t }) {
  return (
    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
      {[{icon:"🔥",value:stats.streak,label:t("streakLabel")},{icon:"⭐",value:stats.points,label:t("pointsLabel")},{icon:"📖",value:stats.chaptersStudied,label:t("chaptersLabel")}].map((s,i) => (
        <div key={i} style={{ background:"#fff", border:"1px solid #f0e8d8", borderRadius:10, padding:"4px 10px", display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ fontSize:14 }}>{s.icon}</span>
          <div>
            <div style={{ fontWeight:800, color:accentColor, fontSize:14, lineHeight:1 }}>{s.value}</div>
            <div style={{ color:"#bbb", fontSize:8 }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── BADGES PANEL ─────────────────────────────────────────────────────────────
function BadgesPanel({ earnedBadges, accentColor, t }) {
  return (
    <div style={{ padding:"8px 12px", borderTop:"1px solid #f0ebe4" }}>
      <div style={{ fontSize:9, color:"#bbb", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>{t("badgesTitle")}</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
        {BADGES.map(b => {
          const earned = earnedBadges.includes(b.id);
          return <div key={b.id} title={earned?b.desc:"???"} style={{ width:30, height:30, borderRadius:8, background:earned?accentColor+"22":"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, opacity:earned?1:0.3, border:earned?`1px solid ${accentColor}44`:"1px solid transparent", transition:"all 0.2s", cursor:"default" }}>{earned?b.icon:"🔒"}</div>;
        })}
      </div>
    </div>
  );
}

// ─── TYPING INDICATOR ─────────────────────────────────────────────────────────
function TypingIndicator({ accentColor }) {
  return (
    <div style={{ display:"flex", gap:5, padding:"4px 0", alignItems:"center" }}>
      {[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:accentColor, animation:"vgBounce 1.2s ease-in-out infinite", animationDelay:`${i*0.18}s` }} />)}
    </div>
  );
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────
function MessageBubble({ msg, lang, accentColor, onQuizComplete }) {
  const isUser = msg.role === "user";
  const font = fontFor(lang?.script);
  if (!isUser && msg.quizData) {
    return (
      <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:16, animation:"vgFadeUp 0.3s ease forwards" }}>
        <div style={{ width:34, height:34, borderRadius:10, background:accentColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🧑‍🏫</div>
        <InteractiveQuiz quizData={msg.quizData} accentColor={accentColor} lang={lang} onComplete={onQuizComplete} />
      </div>
    );
  }
  return (
    <div style={{ display:"flex", justifyContent:isUser?"flex-end":"flex-start", alignItems:"flex-end", gap:10, animation:"vgFadeUp 0.3s ease forwards", marginBottom:16 }}>
      {!isUser && <div style={{ width:34, height:34, borderRadius:10, background:accentColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, boxShadow:`0 2px 8px ${accentColor}44` }}>🧑‍🏫</div>}
      <div style={{ maxWidth:"72%", background:isUser?accentColor:"#fff", color:isUser?"#fff":"#1a1a1a", borderRadius:isUser?"18px 18px 4px 18px":"18px 18px 18px 4px", padding:"13px 17px", fontSize:14, lineHeight:1.8, boxShadow:isUser?`0 2px 12px ${accentColor}44`:"0 2px 8px rgba(0,0,0,0.07)", fontFamily:font }}>
        <ReactMarkdown components={{
          p:({children})=><p style={{margin:"0 0 8px 0",fontFamily:font}}>{children}</p>,
          strong:({children})=><strong style={{color:isUser?"#fff":accentColor}}>{children}</strong>,
          ul:({children})=><ul style={{paddingLeft:18,margin:"4px 0"}}>{children}</ul>,
          ol:({children})=><ol style={{paddingLeft:18,margin:"4px 0"}}>{children}</ol>,
          li:({children})=><li style={{marginBottom:4,fontFamily:font}}>{children}</li>,
          h1:({children})=><h1 style={{fontSize:16,fontWeight:700,margin:"8px 0 4px",color:isUser?"#fff":accentColor}}>{children}</h1>,
          h2:({children})=><h2 style={{fontSize:15,fontWeight:700,margin:"8px 0 4px",color:isUser?"#fff":accentColor}}>{children}</h2>,
          h3:({children})=><h3 style={{fontSize:14,fontWeight:700,margin:"6px 0 3px"}}>{children}</h3>,
        }}>{msg.content}</ReactMarkdown>
      </div>
      {isUser && <div style={{ width:34, height:34, borderRadius:10, background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>👦</div>}
    </div>
  );
}

// ─── CHAPTER ITEM ─────────────────────────────────────────────────────────────
function ChapterItem({ chapter, index, selected, onClick, accentColor, visited, score }) {
  return (
    <button onClick={onClick} style={{ width:"100%", textAlign:"left", padding:"9px 12px", background:selected?accentColor:"transparent", border:"none", borderRadius:8, cursor:"pointer", color:selected?"#fff":"#444", fontSize:12, lineHeight:1.4, display:"flex", alignItems:"flex-start", gap:8, transition:"all 0.15s", fontFamily:"inherit" }}
      onMouseEnter={e=>{ if(!selected) e.currentTarget.style.background="#f5f5f5"; }}
      onMouseLeave={e=>{ if(!selected) e.currentTarget.style.background="transparent"; }}
    >
      <span style={{ minWidth:20, height:20, background:selected?"rgba(255,255,255,0.25)":visited?accentColor+"22":"#eee", borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:selected?"#fff":visited?accentColor:"#999", fontWeight:700, flexShrink:0, marginTop:1 }}>{visited?"✓":index+1}</span>
      <span style={{ flex:1 }}>{chapter}</span>
      {score!==undefined && <span style={{ fontSize:9, background:selected?"rgba(255,255,255,0.2)":accentColor+"22", color:selected?"#fff":accentColor, padding:"1px 5px", borderRadius:5, fontWeight:700, flexShrink:0 }}>{score}%</span>}
    </button>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function VigyanTutor() {
  const [screen, setScreen] = useState("setup");
  const [step, setStep] = useState(1);
  const [selectedLang, setSelectedLang] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [memory, setMemory] = useState("");
  const [msgCount, setMsgCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [badgeSplash, setBadgeSplash] = useState(null);
  const [stats, setStats] = useState(() => {
    const s = loadStorage();
    return s.stats || { streak:0, points:0, chaptersStudied:0, lastStudyDate:null, quizScores:{}, visitedChapters:[], badges:[] };
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const t = key => { const c = selectedLang?.code||"en"; return (UI_TEXT[c]||UI_TEXT.en)[key]||UI_TEXT.en[key]||key; };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, isLoading]);
  useEffect(() => { const s = loadStorage(); saveStorage({...s, stats}); }, [stats]);

  const showToast = useCallback((msg, emoji="🎉") => {
    setToast({msg, emoji}); setTimeout(()=>setToast(null), 3000);
  }, []);

  const unlockBadge = useCallback((id) => {
    setStats(prev => {
      if (prev.badges.includes(id)) return prev;
      const badge = BADGES.find(b => b.id === id);
      if (badge) setTimeout(() => setBadgeSplash(badge), 400);
      return {...prev, badges:[...prev.badges, id]};
    });
  }, []);

  const awardPoints = useCallback((pts, reason) => {
    setStats(prev => {
      const today = new Date().toDateString();
      const isNewDay = prev.lastStudyDate !== today;
      const newStreak = isNewDay ? prev.streak+1 : prev.streak;
      const newPoints = prev.points + pts;
      if (newStreak >= 3) setTimeout(()=>unlockBadge("streak_3"), 200);
      if (newStreak >= 7) setTimeout(()=>unlockBadge("streak_7"), 200);
      if (newPoints >= 100) setTimeout(()=>unlockBadge("points_100"), 200);
      if (newPoints >= 500) setTimeout(()=>unlockBadge("points_500"), 200);
      return {...prev, points:newPoints, streak:newStreak, lastStudyDate:today};
    });
    showToast(`+${pts} pts — ${reason}`, "⭐");
  }, [showToast, unlockBadge]);

  const markVisited = useCallback((chapter) => {
    setStats(prev => {
      if (prev.visitedChapters.includes(chapter)) return prev;
      const list = [...prev.visitedChapters, chapter];
      setTimeout(()=>{ showToast("New chapter! +10 pts", "📖"); unlockBadge("first_lesson"); }, 400);
      if (list.length >= 5) setTimeout(()=>unlockBadge("chapters_5"), 600);
      return {...prev, visitedChapters:list, chaptersStudied:list.length, points:prev.points+10};
    });
  }, [showToast, unlockBadge]);

  const accentColor = selectedSubject ? SUBJECT_COLORS[selectedSubject]?.accent||"#ff6b2b" : "#ff6b2b";
  const colors = selectedSubject ? SUBJECT_COLORS[selectedSubject] : {bg:"#fff3e0", accent:"#ff6b2b", light:"#fff8f0"};
  const subjectData = selectedClass && selectedSubject ? CURRICULUM[selectedClass]?.subjects[selectedSubject] : null;
  const availableSubjects = selectedClass ? Object.entries(CURRICULUM[selectedClass]?.subjects||{}) : [];
  const chapterList = subjectData?.chapters || [];

  const callClaude = useCallback(async (msgs) => {
    const res = await fetch("http://localhost:3001/api/chat", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        system: buildSystemPrompt(selectedLang, selectedClass, selectedSubject, selectedChapter, memory),
        messages: msgs.map(m=>({role:m.role, content:m.content})),
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || "...";
  }, [selectedLang, selectedClass, selectedSubject, selectedChapter, memory]);

  const summarize = useCallback(async (msgs) => {
    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          system:"Summarize this tutoring conversation in under 100 words. Include topics covered, concepts explained, student mistakes, and what was understood well. Write in English only.",
          messages:[{role:"user", content:msgs.map(m=>`${m.role}: ${m.content}`).join("\n")}],
        }),
      });
      const d = await res.json();
      return d.content?.[0]?.text || "";
    } catch { return ""; }
  }, []);

  const processResponse = text => {
    try {
      const m = text.match(/\{[\s\S]*"quiz"[\s\S]*\}/);
      if (m) { const p = JSON.parse(m[0]); if (p.quiz && Array.isArray(p.quiz)) return {role:"assistant", content:"", quizData:p.quiz}; }
    } catch {}
    return {role:"assistant", content:text};
  };

  const startSession = async () => {
    setScreen("chat"); setMessages([]); setMemory(""); setMsgCount(0); setIsLoading(true);
    markVisited(selectedChapter);
    try {
      const r = await callClaude([{role:"user", content:`Please introduce yourself and start teaching Chapter: "${selectedChapter}". Begin with a warm greeting and a brief overview of what we will learn today.`}]);
      setMessages([processResponse(r)]); setMsgCount(1);
    } catch { setMessages([{role:"assistant", content:"Connection error. Please try again."}]); }
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const txt = input.trim(); setInput("");
    const clean = messages.filter(m => !m.quizData);
    const newMsgs = [...clean, {role:"user", content:txt}];
    setMessages(prev => [...prev, {role:"user", content:txt}]);
    setIsLoading(true);
    awardPoints(2, "Question asked!");
    try {
      const r = await callClaude(newMsgs);
      const proc = processResponse(r);
      setMessages(prev => [...prev, proc]);
      const nc = msgCount + 2; setMsgCount(nc);
      if (nc > 0 && nc % 10 === 0) {
        const sum = await summarize([...newMsgs, {role:"assistant", content:r}]);
        if (sum) { setMemory(sum); unlockBadge("memory_active"); showToast("Memory updated — I remember our chat! 🧠", "🧠"); }
      }
    } catch { setMessages(prev => [...prev, {role:"assistant", content:"Sorry, something went wrong."}]); }
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const triggerQuiz = async () => {
    const qMsg = `Please give me exactly 4 MCQ questions on "${selectedChapter}" for Class ${selectedClass} ${selectedSubject}. Respond ONLY with the JSON format. No other text.`;
    const clean = messages.filter(m => !m.quizData);
    setMessages(prev => [...prev, {role:"user", content:"📝 Quiz time!"}]);
    setIsLoading(true);
    try {
      const r = await callClaude([...clean, {role:"user", content:qMsg}]);
      setMessages(prev => [...prev, processResponse(r)]);
    } catch {}
    setIsLoading(false);
  };

  const handleQuizComplete = useCallback((score, total=4) => {
    const pct = Math.round((score/total)*100);
    awardPoints(score*15, `Quiz: ${score}/${total} correct!`);
    const key = `${selectedClass}_${selectedSubject}_${selectedChapter}`;
    setStats(prev => ({...prev, quizScores:{...prev.quizScores, [key]:pct}}));
    if (pct >= 75) unlockBadge("quiz_pass");
    if (pct === 100) { unlockBadge("perfect_quiz"); setTimeout(()=>showToast("Perfect score! 🏆", "🏆"), 500); }
  }, [awardPoints, unlockBadge, showToast, selectedClass, selectedSubject, selectedChapter]);

  const handleKey = e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const resetAll = () => { setScreen("setup"); setStep(1); setSelectedLang(null); setSelectedClass(null); setSelectedSubject(null); setSelectedChapter(null); setMessages([]); setMemory(""); setMsgCount(0); };

  const switchChapter = async (ch) => {
    setSelectedChapter(ch); setMessages([]); setMemory(""); setMsgCount(0); setIsLoading(true);
    markVisited(ch);
    try {
      const r = await callClaude([{role:"user", content:`Please introduce the chapter: "${ch}". Give a warm welcome and brief overview.`}]);
      setMessages([processResponse(r)]);
    } catch { setMessages([{role:"assistant", content:"Error loading chapter."}]); }
    setIsLoading(false);
  };

  // ── SETUP ──────────────────────────────────────────────────────────────────
  const renderSetup = () => (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#fffdf5 0%,#fff8ee 50%,#fff5f0 100%)", fontFamily:"'Poppins',sans-serif", display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #f0e8d8", background:"#fff" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#ff6b2b,#ff9a5c)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:"0 4px 12px #ff6b2b44" }}>🔭</div>
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:"#1a1a1a" }}>LinguaLearnAI</div>
            <div style={{ fontSize:9, color:"#bbb", letterSpacing:"0.04em" }}>NCERT Science · Indian Languages</div>
          </div>
        </div>
        {stats.points > 0 && (
          <div style={{ display:"flex", gap:14, alignItems:"center" }}>
            <span style={{ fontSize:12, color:"#ff6b2b", fontWeight:700 }}>🔥 {stats.streak} day streak</span>
            <span style={{ fontSize:12, color:"#f5a623", fontWeight:700 }}>⭐ {stats.points} pts</span>
            <span style={{ fontSize:12, color:"#555" }}>📖 {stats.chaptersStudied} chapters</span>
            {stats.badges.length > 0 && <span style={{ fontSize:12, color:"#888" }}>🏅 {stats.badges.length} badges</span>}
          </div>
        )}
      </div>
      <div style={{ display:"flex", justifyContent:"center", padding:"20px 20px 0" }}>
        {[t("step1"), t("step2"), t("step3")].map((label, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:step>=i+1?"#ff6b2b":"#e8e8e8", color:step>=i+1?"#fff":"#aaa", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, boxShadow:step===i+1?"0 4px 14px #ff6b2b55":"none", transition:"all 0.3s" }}>{step>i+1?"✓":i+1}</div>
              <div style={{ fontSize:9, color:step===i+1?"#ff6b2b":"#aaa", whiteSpace:"nowrap" }}>{label}</div>
            </div>
            {i<2 && <div style={{ width:50, height:2, background:step>i+1?"#ff6b2b":"#e8e8e8", margin:"0 5px", marginTop:-12, transition:"all 0.3s" }} />}
          </div>
        ))}
      </div>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"18px" }}>
        {step===1 && (
          <div style={{ maxWidth:580, width:"100%" }}>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:22, fontWeight:700, color:"#1a1a1a", marginBottom:4 }}>अपनी भाषा चुनें · Choose Your Language</div>
              <div style={{ fontSize:11, color:"#aaa" }}>Select your preferred language of learning</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:9 }}>
              {LANGUAGES.map(lang => (
                <button key={lang.code} onClick={()=>{ setSelectedLang(lang); setStep(2); }}
                  style={{ padding:"13px 15px", background:"#fff", border:"2px solid #f0e8d8", borderRadius:12, cursor:"pointer", display:"flex", alignItems:"center", gap:10, transition:"all 0.2s", textAlign:"left", fontFamily:fontFor(lang.script) }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#ff6b2b";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px #ff6b2b22";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#f0e8d8";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}
                >
                  <div style={{ width:36, height:36, borderRadius:9, background:"linear-gradient(135deg,#fff8f0,#ffe8d8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{langIcon(lang.code)}</div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:600, color:"#1a1a1a" }}>{lang.name}</div>
                    <div style={{ fontSize:9, color:"#bbb", fontFamily:"'Poppins',sans-serif" }}>{lang.english}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {step===2 && (
          <div style={{ maxWidth:480, width:"100%" }}>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:22, fontWeight:700, color:"#1a1a1a", marginBottom:4, fontFamily:fontFor(selectedLang?.script) }}>{t("chooseClass")}</div>
              <div style={{ fontSize:11, color:"#aaa" }}>{t("chooseClassSub")}</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:11 }}>
              {[6,7,8,9,10].map(cls => (
                <button key={cls} onClick={()=>{ setSelectedClass(cls); setStep(3); }}
                  style={{ padding:"18px 10px", background:"#fff", border:"2px solid #f0e8d8", borderRadius:12, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, transition:"all 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#ff6b2b";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px #ff6b2b22";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#f0e8d8";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}
                >
                  <div style={{ fontSize:30, fontWeight:800, color:"#ff6b2b", lineHeight:1 }}>{cls}</div>
                  <div style={{ fontSize:9, color:"#aaa" }}>{CURRICULUM[cls].label}</div>
                </button>
              ))}
            </div>
            <button onClick={()=>setStep(1)} style={{ marginTop:12, background:"none", border:"none", color:"#bbb", cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", gap:4, fontFamily:"inherit", margin:"12px auto 0", padding:"8px 14px" }}>{t("changeLanguage")}</button>
          </div>
        )}
        {step===3 && (
          <div style={{ maxWidth:620, width:"100%" }}>
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ fontSize:20, fontWeight:700, color:"#1a1a1a", marginBottom:4, fontFamily:fontFor(selectedLang?.script) }}>{t("chooseChapter")}</div>
              <div style={{ fontSize:11, color:"#aaa" }}>{t("chooseChapterSub")}</div>
            </div>
            <div style={{ display:"flex", gap:7, marginBottom:13, flexWrap:"wrap", justifyContent:"center" }}>
              {availableSubjects.map(([key, val]) => {
                const sc = SUBJECT_COLORS[key], isSel = selectedSubject===key;
                return <button key={key} onClick={()=>{ setSelectedSubject(key); setSelectedChapter(null); }}
                  style={{ padding:"7px 14px", background:isSel?sc.accent:"#fff", border:`2px solid ${isSel?sc.accent:"#e8e8e8"}`, borderRadius:20, cursor:"pointer", color:isSel?"#fff":"#666", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:5, transition:"all 0.2s", fontFamily:"inherit" }}>
                  <span>{SUBJECT_ICONS[key]}</span>{val.label}
                </button>;
              })}
            </div>
            {selectedSubject && subjectData && (
              <div style={{ background:"#fff", border:"2px solid #f0e8d8", borderRadius:12, overflow:"hidden", maxHeight:280, overflowY:"auto" }}>
                {subjectData.chapters.map((ch, i) => {
                  const scoreKey = `${selectedClass}_${selectedSubject}_${ch}`;
                  const visited = stats.visitedChapters.includes(ch);
                  const score = stats.quizScores[scoreKey];
                  return (
                    <div key={i} onClick={()=>setSelectedChapter(ch)}
                      style={{ padding:"10px 14px", display:"flex", alignItems:"center", gap:10, cursor:"pointer", borderBottom:i<subjectData.chapters.length-1?"1px solid #f5f5f5":"none", background:selectedChapter===ch?SUBJECT_COLORS[selectedSubject]?.light:"transparent", transition:"background 0.15s" }}
                      onMouseEnter={e=>{if(selectedChapter!==ch)e.currentTarget.style.background="#fafafa";}}
                      onMouseLeave={e=>{if(selectedChapter!==ch)e.currentTarget.style.background="transparent";}}
                    >
                      <span style={{ width:24, height:24, borderRadius:6, background:selectedChapter===ch?SUBJECT_COLORS[selectedSubject]?.accent:"#f0f0f0", color:selectedChapter===ch?"#fff":visited?SUBJECT_COLORS[selectedSubject]?.accent:"#bbb", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, flexShrink:0 }}>{visited?"✓":i+1}</span>
                      <span style={{ fontSize:12, color:selectedChapter===ch?SUBJECT_COLORS[selectedSubject]?.accent:"#333", fontWeight:selectedChapter===ch?600:400, flex:1 }}>{ch}</span>
                      {score!==undefined && <span style={{ fontSize:9, background:SUBJECT_COLORS[selectedSubject]?.bg, color:SUBJECT_COLORS[selectedSubject]?.accent, padding:"1px 6px", borderRadius:5, fontWeight:700 }}>{score}%</span>}
                      {selectedChapter===ch && <span style={{ color:SUBJECT_COLORS[selectedSubject]?.accent, fontWeight:700 }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
            {selectedChapter && (
              <button onClick={startSession}
                style={{ marginTop:14, width:"100%", padding:"13px", background:`linear-gradient(135deg,${accentColor},${accentColor}cc)`, border:"none", borderRadius:12, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 6px 20px ${accentColor}55`, transition:"all 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
              >{t("startLearning")} →</button>
            )}
            <button onClick={()=>setStep(2)} style={{ marginTop:10, background:"none", border:"none", color:"#bbb", cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", gap:4, fontFamily:"inherit", margin:"10px auto 0", padding:"8px 14px" }}>{t("changeClass")}</button>
          </div>
        )}
      </div>
    </div>
  );

  // ── CHAT ──────────────────────────────────────────────────────────────────
  const renderChat = () => (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:"#f7f3ee", fontFamily:"'Poppins',sans-serif" }}>
      <div style={{ background:"#fff", borderBottom:"1px solid #ede8e0", padding:"10px 16px", display:"flex", alignItems:"center", gap:12, flexShrink:0, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
        <button onClick={()=>setSidebarOpen(v=>!v)} style={{ background:"#f5f0ea", border:"none", borderRadius:7, width:32, height:32, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>☰</button>
        <div style={{ width:34, height:34, borderRadius:9, background:`linear-gradient(135deg,${accentColor},${accentColor}aa)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{SUBJECT_ICONS[selectedSubject]||"🔬"}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:600, color:"#1a1a1a", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{selectedChapter}</div>
          <div style={{ fontSize:10, color:"#999", display:"flex", gap:5, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ background:colors.bg, color:colors.accent, padding:"1px 6px", borderRadius:6, fontSize:9, fontWeight:600 }}>Class {selectedClass}</span>
            <span>{selectedSubject?.charAt(0).toUpperCase()+selectedSubject?.slice(1)}</span>
            <span>·</span><span>{selectedLang?.name}</span>
            {memory && <span style={{ background:"#e8f5e2", color:"#2d7a1f", padding:"1px 6px", borderRadius:6, fontSize:9, fontWeight:600, display:"flex", alignItems:"center", gap:3 }}><span style={{ width:5, height:5, borderRadius:"50%", background:"#2d7a1f", animation:"vgPulse 1.5s infinite", display:"inline-block" }} />{t("memoryLabel")}</span>}
          </div>
        </div>
        <StatsBar stats={stats} accentColor={accentColor} t={t} />
        <div style={{ display:"flex", gap:5 }}>
          <button onClick={triggerQuiz} style={{ padding:"6px 10px", background:colors.bg, border:`1px solid ${colors.accent}44`, borderRadius:7, color:colors.accent, cursor:"pointer", fontSize:11, fontWeight:600, fontFamily:"inherit" }}>{t("quizButton")}</button>
          <button onClick={resetAll} style={{ padding:"6px 10px", background:"#f5f0ea", border:"1px solid #e8e0d5", borderRadius:7, color:"#888", cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>{t("homeButton")}</button>
        </div>
      </div>
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {sidebarOpen && (
          <div style={{ width:220, flexShrink:0, background:"#fff", borderRight:"1px solid #ede8e0", display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ padding:"10px 12px 5px", fontSize:9, color:"#bbb", textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>{t("allChapters")}</div>
            <div style={{ flex:1, overflowY:"auto", padding:"2px 8px 8px" }}>
              {chapterList.map((ch, i) => {
                const scoreKey = `${selectedClass}_${selectedSubject}_${ch}`;
                return <ChapterItem key={i} chapter={ch} index={i} selected={ch===selectedChapter} onClick={()=>ch!==selectedChapter&&switchChapter(ch)} accentColor={accentColor} visited={stats.visitedChapters.includes(ch)} score={stats.quizScores[scoreKey]} />;
              })}
            </div>
            {/* Progress bar */}
            <div style={{ padding:"8px 12px", borderTop:"1px solid #f0ebe4", background:"#faf8f5" }}>
              <div style={{ fontSize:9, color:"#bbb", fontWeight:600, textTransform:"uppercase", marginBottom:5 }}>{t("progressTitle")}</div>
              <div style={{ height:6, background:"#f0f0f0", borderRadius:3, overflow:"hidden", marginBottom:4 }}>
                <div style={{ height:"100%", width:`${chapterList.length>0?Math.round((stats.visitedChapters.filter(c=>chapterList.includes(c)).length/chapterList.length)*100):0}%`, background:accentColor, borderRadius:3, transition:"width 0.8s ease" }} />
              </div>
              <div style={{ fontSize:9, color:"#bbb" }}>{stats.visitedChapters.filter(c=>chapterList.includes(c)).length}/{chapterList.length} chapters visited</div>
            </div>
            <BadgesPanel earnedBadges={stats.badges} accentColor={accentColor} t={t} />
            <div style={{ padding:"8px 12px 10px", borderTop:"1px solid #f0ebe4" }}>
              <div style={{ fontSize:9, color:"#bbb", fontWeight:600, marginBottom:5 }}>{t("quickTips")}</div>
              {["Ask for exam tips","Ask for a diagram","Ask 'why' questions","Request an example"].map((tip,i) => (
                <button key={i} onClick={()=>{ setInput(tip); inputRef.current?.focus(); }}
                  style={{ display:"block", width:"100%", textAlign:"left", padding:"4px 8px", background:"none", border:"1px solid #ede8e0", borderRadius:5, marginBottom:3, cursor:"pointer", fontSize:10, color:"#888", fontFamily:"inherit", transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=accentColor;e.currentTarget.style.color=accentColor;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#ede8e0";e.currentTarget.style.color="#888";}}
                >→ {tip}</button>
              ))}
            </div>
          </div>
        )}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 8px" }}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} lang={selectedLang} accentColor={accentColor}
                onQuizComplete={(score)=>handleQuizComplete(score, msg.quizData?.length||4)} />
            ))}
            {isLoading && (
              <div style={{ display:"flex", alignItems:"flex-end", gap:10, marginBottom:16 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:accentColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🧑‍🏫</div>
                <div style={{ background:"#fff", borderRadius:"18px 18px 18px 4px", padding:"12px 18px", boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}><TypingIndicator accentColor={accentColor} /></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ padding:"10px 14px 13px", background:"#fff", borderTop:"1px solid #ede8e0" }}>
            <div style={{ display:"flex", gap:8, alignItems:"flex-end", background:"#f7f3ee", borderRadius:13, padding:"7px 7px 7px 13px", border:"2px solid transparent", transition:"border-color 0.2s" }}
              onFocusCapture={e=>e.currentTarget.style.borderColor=accentColor}
              onBlurCapture={e=>e.currentTarget.style.borderColor="transparent"}
            >
              <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
                placeholder={t("inputPlaceholder")} rows={1}
                style={{ flex:1, background:"none", border:"none", color:"#1a1a1a", fontSize:13, fontFamily:fontFor(selectedLang?.script), resize:"none", outline:"none", lineHeight:1.6, maxHeight:100, overflowY:"auto" }}
              />
              <button onClick={sendMessage} disabled={isLoading||!input.trim()}
                style={{ width:36, height:36, borderRadius:10, background:input.trim()&&!isLoading?`linear-gradient(135deg,${accentColor},${accentColor}cc)`:"#e8e8e8", border:"none", color:input.trim()&&!isLoading?"#fff":"#bbb", cursor:input.trim()&&!isLoading?"pointer":"not-allowed", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s", boxShadow:input.trim()&&!isLoading?`0 4px 12px ${accentColor}44`:"none" }}>↑</button>
            </div>
            <div style={{ fontSize:9, color:"#ccc", textAlign:"center", marginTop:5 }}>Enter to send · Shift+Enter for new line · Powered by Anthropic Claude</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600&family=Noto+Sans+Tamil:wght@400;500;600&family=Noto+Sans+Telugu:wght@400;500;600&family=Noto+Sans+Kannada:wght@400;500;600&family=Noto+Sans+Malayalam:wght@400;500;600&family=Noto+Sans+Bengali:wght@400;500;600&family=Noto+Sans+Gujarati:wght@400;500;600&family=Noto+Sans+Gurmukhi:wght@400;500;600&display=swap');
        @keyframes vgBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}
        @keyframes vgFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes vgSlideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes vgPop{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}
        @keyframes vgPulse{0%,100%{opacity:0.4}50%{opacity:1}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#e0d8d0;border-radius:3px}
        body{margin:0}
      `}</style>
      <Toast notif={toast} />
      <BadgeSplash badge={badgeSplash} onClose={()=>setBadgeSplash(null)} />
      {screen==="setup" ? renderSetup() : renderChat()}
    </>
  );
}