// src/app/[locale]/chatbot/chat/ChatIntroduction.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Language } from '@/src/app/[locale]/chatbot/lib/live-chat.types';

interface IntroductionContent {
  greeting: string;
  description: string;
  suggestions: string[];
}

// --- Interface cho cấu trúc dữ liệu người dùng ---
interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Cấu trúc dữ liệu cho từng loại introduction
interface IntroductionType {
  type: string;
  content: Record<Language, IntroductionContent>;
}
// Define a default fallback object for introductions
const defaultIntroductions: Record<Language, IntroductionContent> = {
  en: {
    greeting: 'Hello',
    description:
      "I'm a chatbot assistant for finding conference information. Ask a question or choose a suggestion below to get started:",
    suggestions: [
      'List some AI conferences in Asia.',
      'Find Big Data conferences this year (2025).',
      'I want to know about blockchain conferences in Europe.',
    ],
  },
  vi: {
    greeting: 'Xin chào',
    description:
      'Tôi là chatbot hỗ trợ tìm kiếm thông tin về các hội nghị. Hãy đặt câu hỏi hoặc chọn một trong số các câu hỏi gợi ý sau để bắt đầu:',
    suggestions: [
      'Liệt kê cho tôi một vài hội nghị về lĩnh vực AI tổ chức tại châu Á.',
      'Tìm các hội nghị về Big Data trong năm nay (2025).',
      'Tôi muốn biết về các hội nghị blockchain tại châu Âu.',
    ],
  },
  zh: {
    greeting: '你好',
    description:
      '我是会议信息查询聊天机器人助手。您可以提问或选择下面的建议开始：',
    suggestions: [
      '列出亚洲的一些人工智能会议。',
      '查找今年的大数据会议 (2025)。',
      '我想了解欧洲的区块链会议。',
    ],
  },
  de: { // German added
    greeting: 'Hallo',
    description:
      'Ich bin ein Chatbot-Assistent zum Finden von Konferenzinformationen. Stellen Sie eine Frage oder wählen Sie einen Vorschlag unten, um zu beginnen:',
    suggestions: [
      'Listen Sie einige KI-Konferenzen in Asien auf.',
      'Finden Sie Big Data Konferenzen dieses Jahr (2025).',
      'Ich möchte mehr über Blockchain-Konferenzen in Europa erfahren.',
    ],
  },
  es: { // Spanish added
    greeting: 'Hola',
    description:
      'Soy un asistente chatbot para encontrar información de conferencias. Haga una pregunta o elija una sugerencia a continuación para comenzar:',
    suggestions: [
      'Listar algunas conferencias de IA en Asia.',
      'Encontrar conferencias de Big Data este año (2025).',
      'Quiero saber sobre conferencias de blockchain en Europa.',
    ],
  },
  ko: { // Korean added
    greeting: '안녕하세요',
    description:
      '저는 컨퍼런스 정보를 찾는데 도움을 주는 챗봇입니다. 질문을 하거나 아래 제안을 선택하여 시작하세요:',
    suggestions: [
      '아시아의 AI 컨퍼런스를 몇 개 나열해주세요.',
      '올해(2025년)의 빅데이터 컨퍼런스를 찾아주세요.',
      '유럽의 블록체인 컨퍼런스에 대해 알고 싶습니다.',
    ],
  },
  ru: { // Russian added
    greeting: 'Здравствуйте',
    description:
      'Я чат-бот-помощник для поиска информации о конференциях. Задайте вопрос или выберите предложение ниже, чтобы начать:',
    suggestions: [
      'Перечислите несколько конференций по ИИ в Азии.',
      'Найдите конференции по большим данным в этом году (2025).',
      'Я хочу узнать о конференциях по блокчейну в Европе.',
    ],
  },
  ar: { // Arabic added
    greeting: 'مرحباً',
    description:
      'أنا مساعد روبوت محادثة للبحث عن معلومات المؤتمرات. اطرح سؤالاً أو اختر اقتراحًا أدناه للبدء:',
    suggestions: [
      'اذكر بعض مؤتمرات الذكاء الاصطناعي في آسيا.',
      'ابحث عن مؤتمرات البيانات الكبيرة هذا العام (2025).',
      'أريد أن أعرف عن مؤتمرات البلوك تشين في أوروبا.',
    ],
  },
  fa: { // Persian added
    greeting: 'سلام',
    description:
      'من یک ربات چت دستیار برای یافتن اطلاعات کنفرانس هستم. برای شروع سوالی بپرسید یا یکی از پیشنهادات زیر را انتخاب کنید:',
    suggestions: [
      'چند کنفرانس هوش مصنوعی در آسیا را لیست کن.',
      'کنفرانس های بیگ دیتا امسال (2025) را پیدا کن.',
      'می خواهم درباره کنفرانس های بلاک چین در اروپا بدانم.',
    ],
  },
  fr: { // French added
    greeting: 'Bonjour',
    description:
      'Je suis un assistant chatbot pour trouver des informations sur les conférences. Posez une question ou choisissez une suggestion ci-dessous pour commencer :',
    suggestions: [
      'Liste quelques conférences sur l\'IA en Asie.',
      'Trouve des conférences sur les Big Data cette année (2025).',
      'Je veux en savoir plus sur les conférences blockchain en Europe.',
    ],
  },
  ja: { // Japanese added
    greeting: 'こんにちは',
    description:
      '私は会議情報検索チャットボットアシスタントです。質問をするか、以下の提案を選択して開始してください:',
    suggestions: [
      'アジアのAIに関する会議をいくつかリストアップしてください。',
      '今年のビッグデータに関する会議を探してください (2025)。',
      'ヨーロッパのブロックチェーンに関する会議について知りたいです。',
    ],
  },
};


const findInfoIntroductions: IntroductionType = {
  type: 'Tìm thông tin các hội nghị',
  content: {
    en: {
      greeting: 'Hello',
      description: "I'm here to help you find conference information. Try this suggestion:",
      suggestions: [
        'List some AI conferences in Asia.',
        'Find Big Data conferences this year (2025).',
        'I want to know about blockchain conferences in Europe.',
      ],
    },
    vi: {
      greeting: 'Xin chào',
      description: 'Tôi có thể giúp bạn tìm thông tin về các hội nghị. Hãy thử gợi ý này:',
      suggestions: [
        'Liệt kê cho tôi một vài hội nghị về lĩnh vực AI tổ chức tại châu Á.',
        'Tìm các hội nghị về Big Data trong năm nay (2025).',
        'Tôi muốn biết về các hội nghị blockchain tại châu Âu.',
      ],
    },
    zh: {
      greeting: '你好',
      description: '我在这里帮助您查找会议信息。请尝试以下建议：',
      suggestions: [
        '列出亚洲的一些人工智能会议。',
        '查找今年的大数据会议 (2025)。',
        '我想了解欧洲的区块链会议。',
      ],
    },
    de: { // German added
      greeting: 'Hallo',
      description: 'Ich helfe Ihnen gerne bei der Suche nach Konferenzinformationen. Versuchen Sie diesen Vorschlag:',
      suggestions: [
        'Listen Sie einige KI-Konferenzen in Asien auf.',
        'Finden Sie Big Data Konferenzen dieses Jahr (2025).',
        'Ich möchte mehr über Blockchain-Konferenzen in Europa erfahren.',
      ],
    },
    es: { // Spanish added
      greeting: 'Hola',
      description: 'Estoy aquí para ayudarte a encontrar información de conferencias. Prueba esta sugerencia:',
      suggestions: [
        'Listar algunas conferencias de IA en Asia.',
        'Encontrar conferencias de Big Data este año (2025).',
        'Quiero saber sobre conferencias de blockchain en Europa.',
      ],
    },
    ko: { // Korean added
      greeting: '안녕하세요',
      description: '컨퍼런스 정보를 찾는 것을 도와드릴 수 있습니다. 다음 제안을 시도해보세요:',
      suggestions: [
        '아시아의 AI 컨퍼런스를 몇 개 나열해주세요.',
        '올해(2025년)의 빅데이터 컨퍼런스를 찾아주세요.',
        '유럽의 블록체인 컨퍼런스에 대해 알고 싶습니다.',
      ],
    },
    ru: { // Russian added
      greeting: 'Здравствуйте',
      description: 'Я здесь, чтобы помочь вам найти информацию о конференциях. Попробуйте это предложение:',
      suggestions: [
        'Перечислите несколько конференций по ИИ в Азии.',
        'Найдите конференции по большим данным в этом году (2025).',
        'Я хочу узнать о конференциях по блокчейну в Европе.',
      ],
    },
    ar: { // Arabic added
      greeting: 'مرحباً',
      description: 'أنا هنا لمساعدتك في العثور على معلومات المؤتمرات. جرب هذا الاقتراح:',
      suggestions: [
        'اذكر بعض مؤتمرات الذكاء الاصطناعي في آسيا.',
        'ابحث عن مؤتمرات البيانات الكبيرة هذا العام (2025).',
        'أريد أن أعرف عن مؤتمرات البلوك تشين في أوروبا.',
      ],
    },
    fa: { // Persian added
      greeting: 'سلام',
      description: 'من اینجا هستم تا به شما در یافتن اطلاعات کنفرانس کمک کنم. این پیشنهاد را امتحان کنید:',
      suggestions: [
        'چند کنفرانس هوش مصنوعی در آسیا را لیست کن.',
        'کنفرانس های بیگ دیتا امسال (2025) را پیدا کن.',
        'می خواهم درباره کنفرانس های بلاک چین در اروپا بدانم.',
      ],
    },
    fr: { // French added
      greeting: 'Bonjour',
      description: 'Je suis là pour vous aider à trouver des informations sur les conférences. Essayez cette suggestion :',
      suggestions: [
        'Liste quelques conférences sur l\'IA en Asie.',
        'Trouve des conférences sur les Big Data cette année (2025).',
        'Je veux en savoir plus sur les conférences blockchain en Europe.',
      ],
    },
    ja: { // Japanese added
      greeting: 'こんにちは',
      description: '会議情報を見つけるお手伝いをします。この提案を試してみてください:',
      suggestions: [
        'アジアのAIに関する会議をいくつかリストアップしてください。',
        '今年のビッグデータに関する会議を探してください (2025)。',
        'ヨーロッパのブロックチェーンに関する会議について知りたいです。',
      ],
    },
  },
};

const redirectToWebsiteIntroductions: IntroductionType = {
  type: 'Chuyển hướng tới trang web hội nghị',
  content: {
    en: {
      greeting: 'Hello',
      description: "Need to visit a conference website? Ask me!",
      suggestions: [
        'Go to the website for the "International Joint Conference on Knowledge Discovery, Knowledge Engineering and Knowledge Management".',
        'Direct me to the official site of "AAAI".',
        'Open the website for "RAID".',
      ],
    },
    vi: {
      greeting: 'Xin chào',
      description: 'Bạn muốn truy cập trang web của hội nghị? Hãy hỏi tôi!',
      suggestions: [
        'Truy cập trang web của hội nghị "International Joint Conference on Knowledge Discovery, Knowledge Engineering and Knowledge Management".',
        'Chuyển hướng tôi đến trang web chính thức của "AAAI".',
        'Mở trang web cho "RAID".',
      ],
    },
    zh: {
      greeting: '你好',
      description: '需要访问会议网站吗？问我吧！',
      suggestions: [
        '前往“International Joint Conference on Knowledge Discovery, Knowledge Engineering and Knowledge Management”的网站。',
        '带我去“AAAI”的官方网站。',
        '打开“RAID”的网站。',
      ],
    },
    de: { // German added
      greeting: 'Hallo',
      description: 'Müssen Sie eine Konferenz-Website besuchen? Fragen Sie mich!',
      suggestions: [
        'Gehen Sie zur Website der "International Joint Conference on Knowledge Discovery, Knowledge Engineering and Knowledge Management".',
        'Leiten Sie mich zur offiziellen Seite von "AAAI" weiter.',
        'Öffnen Sie die Website für "RAID".',
      ],
    },
    es: { // Spanish added
      greeting: 'Hola',
      description: '¿Necesitas visitar el sitio web de una conferencia? ¡Pregúntame!',
      suggestions: [
        'Ir al sitio web de la "International Joint Conference on Knowledge Discovery, Knowledge Engineering and Knowledge Management".',
        'Dirígeme al sitio oficial de "AAAI".',
        'Abrir el sitio web de "RAID".',
      ],
    },
    ko: { // Korean added
      greeting: '안녕하세요',
      description: '컨퍼런스 웹사이트를 방문해야 하나요? 저에게 물어보세요!',
      suggestions: [
        '"International Joint Conference on Knowledge Discovery, Knowledge Engineering and Knowledge Management" 웹사이트로 이동해주세요.',
        '"AAAI"의 공식 사이트로 안내해주세요.',
        '"RAID" 웹사이트를 열어주세요.',
      ],
    },
    ru: { // Russian added
      greeting: 'Здравствуйте',
      description: 'Нужно посетить веб-сайт конференции? Спросите меня!',
      suggestions: [
        'Перейти на веб-сайт "International Joint Conference on Knowledge Discovery, Knowledge Engineering and Knowledge Management".',
        'Направьте меня на официальный сайт "AAAI".',
        'Открыть веб-сайт "RAID".',
      ],
    },
    ar: { // Arabic added
      greeting: 'مرحباً',
      description: 'هل تحتاج لزيارة موقع ويب خاص بمؤتمر؟ اسألني!',
      suggestions: [
        'اذهب إلى موقع الويب الخاص بـ "International Joint Conference on Knowledge Discovery, Knowledge Engineering and Knowledge Management".',
        'وجهني إلى الموقع الرسمي لـ "AAAI".',
        'افتح موقع الويب الخاص بـ "RAID".',
      ],
    },
    fa: { // Persian added
      greeting: 'سلام',
      description: 'نیاز به بازدید از وب سایت کنفرانس دارید؟ از من بپرسید!',
      suggestions: [
        'به وب سایت "International Joint Conference on Knowledge Discovery, Knowledge Engineering and Knowledge Management" بروید.',
        'مرا به سایت رسمی "AAAI" هدایت کنید.',
        'وب سایت "RAID" را باز کنید.',
      ],
    },
    fr: { // French added
      greeting: 'Bonjour',
      description: 'Besoin de visiter le site web d\'une conférence ? Demandez-moi !',
      suggestions: [
        'Aller sur le site web de l\'"International Joint Conference on Knowledge Discovery, Knowledge Engineering and Knowledge Management".',
        'Dirigez-moi vers le site officiel de "AAAI".',
        'Ouvrez le site web de "RAID".',
      ],
    },
    ja: { // Japanese added
      greeting: 'こんにちは',
      description: '会議のウェブサイトを訪れる必要がありますか？聞いてください！',
      suggestions: [
        '"International Joint Conference on Knowledge Discovery, Knowledge Engineering and Knowledge Management"のウェブサイトに移動してください。',
        '"AAAI"の公式サイトに案内してください。',
        '"RAID"のウェブサイトを開いてください。',
      ],
    },
  },
};

const openMapIntroductions: IntroductionType = {
  type: 'Mở google map cho location của hội nghị',
  content: {
    en: {
      greeting: 'Hello',
      description: "Want to find the location of a conference? I can help!",
      suggestions: [
        'Show me the location of "SERA" on Google Maps.',
        'Where is the venue for "ACM International Symposium on Computer Architecture" located?',
        'Open the map for "SIGIR".',
      ],
    },
    vi: {
      greeting: 'Xin chào',
      description: 'Bạn muốn tìm địa điểm của một hội nghị? Tôi có thể giúp!',
      suggestions: [
        'Hiển thị địa điểm của "SERA" trên Google Maps.',
        'Địa điểm tổ chức "ACM International Symposium on Computer Architecture" ở đâu?',
        'Mở bản đồ cho "SIGIR".',
      ],
    },
    zh: {
      greeting: '你好',
      description: '想找到会议的地点吗？我可以帮忙！',
      suggestions: [
        '在 Google 地图上显示“SERA”的地点。',
        '“ACM International Symposium on Computer Architecture”的举办地在哪里？',
        '打开“SIGIR”的地图。',
      ],
    },
    de: { // German added
      greeting: 'Hallo',
      description: 'Möchten Sie den Standort einer Konferenz finden? Ich kann helfen!',
      suggestions: [
        'Zeigen Sie mir den Standort von "SERA" auf Google Maps.',
        'Wo befindet sich der Veranstaltungsort für die "ACM International Symposium on Computer Architecture"?',
        'Öffnen Sie die Karte für "SIGIR".',
      ],
    },
    es: { // Spanish added
      greeting: 'Hola',
      description: '¿Quieres encontrar la ubicación de una conferencia? ¡Puedo ayudarte!',
      suggestions: [
        'Muéstrame la ubicación de "SERA" en Google Maps.',
        '¿Dónde se encuentra el lugar de celebración del "ACM International Symposium on Computer Architecture"?',
        'Abrir el mapa para "SIGIR".',
      ],
    },
    ko: { // Korean added
      greeting: '안녕하세요',
      description: '컨퍼런스 위치를 찾고 싶으신가요? 도와드릴 수 있습니다!',
      suggestions: [
        '"SERA"의 위치를 구글 지도에 표시해주세요.',
        '"ACM International Symposium on Computer Architecture"의 장소는 어디인가요?',
        '"SIGIR"의 지도를 열어주세요.',
      ],
    },
    ru: { // Russian added
      greeting: 'Здравствуйте',
      description: 'Хотите найти местоположение конференции? Я могу помочь!',
      suggestions: [
        'Показать местоположение "SERA" на Google Maps.',
        'Где находится место проведения "ACM International Symposium on Computer Architecture"?',
        'Открыть карту для "SIGIR".',
      ],
    },
    ar: { // Arabic added
      greeting: 'مرحباً',
      description: 'هل ترغب في العثور على موقع مؤتمر؟ يمكنني المساعدة!',
      suggestions: [
        'أظهر لي موقع "SERA" على خرائط جوجل.',
        'أين يقع مكان انعقاد "ACM International Symposium on Computer Architecture"؟',
        'افتح خريطة "SIGIR".',
      ],
    },
    fa: { // Persian added
      greeting: 'سلام',
      description: 'می خواهید مکان یک کنفرانس را پیدا کنید؟ می توانم کمک کنم!',
      suggestions: [
        'مکان "SERA" را در نقشه گوگل نشان بده.',
        'محل برگزاری "ACM International Symposium on Computer Architecture" کجا واقع شده است؟',
        'نقشه "SIGIR" را باز کن.',
      ],
    },
    fr: { // French added
      greeting: 'Bonjour',
      description: 'Vous voulez trouver l\'emplacement d\'une conférence ? Je peux vous aider !',
      suggestions: [
        'Montrez-moi l\'emplacement de "SERA" sur Google Maps.',
        'Où se trouve le lieu de l\'"ACM International Symposium on Computer Architecture" ?',
        'Ouvrez la carte pour "SIGIR".',
      ],
    },
    ja: { // Japanese added
      greeting: 'こんにちは',
      description: '会議の場所を見つけたいですか？お手伝いできます！',
      suggestions: [
        '"SERA"の場所をGoogleマップで表示してください。',
        '"ACM International Symposium on Computer Architecture"の会場はどこにありますか？',
        '"SIGIR"のマップを開いてください。',
      ],
    },
  },
};

const contactAdminIntroductions: IntroductionType = {
  type: 'Send email to admin để contact hoặc report',
  content: {
    en: {
      greeting: 'Hello',
      description: "Need to contact the admin or report an issue? Let me know.",
      suggestions: [
        'How can I contact the administrator?',
        'I want to report a problem.',
        'Send feedback to the admin.',
      ],
    },
    vi: {
      greeting: 'Xin chào',
      description: 'Bạn cần liên hệ admin hoặc báo cáo sự cố? Hãy cho tôi biết.',
      suggestions: [
        'Làm thế nào để liên hệ với quản trị viên?',
        'Tôi muốn báo cáo một vấn đề.',
        'Gửi phản hồi đến admin.',
      ],
    },
    zh: {
      greeting: '你好',
      description: '需要联系管理员或报告问题？告诉我吧。',
      suggestions: [
        '如何联系管理员？',
        '我想报告一个问题。',
        '向管理员发送反馈。',
      ],
    },
    de: { // German added
      greeting: 'Hallo',
      description: 'Müssen Sie den Administrator kontaktieren oder ein Problem melden? Lassen Sie es mich wissen.',
      suggestions: [
        'Wie kann ich den Administrator kontaktieren?',
        'Ich möchte ein Problem melden.',
        'Feedback an den Administrator senden.',
      ],
    },
    es: { // Spanish added
      greeting: 'Hola',
      description: '¿Necesitas contactar al administrador o informar de un problema? Déjamelo saber.',
      suggestions: [
        '¿Cómo puedo contactar al administrador?',
        'Quiero informar de un problema.',
        'Enviar comentarios al administrador.',
      ],
    },
    ko: { // Korean added
      greeting: '안녕하세요',
      description: '관리자에게 연락하거나 문제를 보고해야 하나요? 알려주세요.',
      suggestions: [
        '관리자에게 어떻게 연락할 수 있나요?',
        '문제를 보고하고 싶습니다.',
        '관리자에게 피드백을 보내주세요.',
      ],
    },
    ru: { // Russian added
      greeting: 'Здравствуйте',
      description: 'Нужно связаться с администратором или сообщить о проблеме? Дайте знать.',
      suggestions: [
        'Как я могу связаться с администратором?',
        'Я хочу сообщить о проблеме.',
        'Отправить отзыв администратору.',
      ],
    },
    ar: { // Arabic added
      greeting: 'مرحباً',
      description: 'هل تحتاج للتواصل مع المسؤول أو الإبلاغ عن مشكلة؟ أخبرني بذلك.',
      suggestions: [
        'كيف يمكنني التواصل مع المسؤول؟',
        'أرغب في الإبلاغ عن مشكلة.',
        'أرسل ملاحظات للمسؤول.',
      ],
    },
    fa: { // Persian added
      greeting: 'سلام',
      description: 'نیاز به تماس با مدیر یا گزارش مشکل دارید؟ به من اطلاع دهید.',
      suggestions: [
        'چگونه می توانم با مدیر تماس بگیرم؟',
        'می خواهم مشکلی را گزارش کنم.',
        'ارسال بازخورد به مدیر.',
      ],
    },
    fr: { // French added
      greeting: 'Bonjour',
      description: 'Besoin de contacter l\'administrateur ou de signaler un problème ? Faites-le moi savoir.',
      suggestions: [
        'Comment puis-je contacter l\'administrateur ?',
        'Je veux signaler un problème.',
        'Envoyer des commentaires à l\'administrateur.',
      ],
    },
    ja: { // Japanese added
      greeting: 'こんにちは',
      description: '管理者に連絡したり、問題を報告したりする必要がありますか？教えてください。',
      suggestions: [
        '管理者にどのように連絡できますか？',
        '問題を報告したいです。',
        '管理者にフィードバックを送ってください。',
      ],
    },
  },
};

const followUnfollowIntroductions: IntroductionType = {
  type: 'Follow Unfollow Lấy danh sách follow conference',
  content: {
    en: {
      greeting: 'Hello',
      description: "Manage your followed conferences here:",
      suggestions: [
        'List the conferences I am following.',
        'How to follow a conference?',
        'Show me conferences I have followed.', // Example, might not be implemented
      ],
    },
    vi: {
      greeting: 'Xin chào',
      description: 'Quản lý các hội nghị bạn đang theo dõi tại đây:',
      suggestions: [
        'Liệt kê các hội nghị tôi đang theo dõi.',
        'Làm thế nào để theo dõi một hội nghị?',
        'Hiển thị các hội nghị tôi đã bỏ theo dõi.', // Ví dụ, có thể chưa triển khai
      ],
    },
    zh: {
      greeting: '你好',
      description: '在这里管理您关注的会议：',
      suggestions: [
        '列出我关注的会议。',
        '如何关注一个会议？',
        '显示我已取消关注的会议。', // 示例，可能未实现
      ],
    },
    de: { // German added
      greeting: 'Hallo',
      description: 'Verwalten Sie hier Ihre gefolgten Konferenzen:',
      suggestions: [
        'Listen Sie die Konferenzen auf, denen ich folge.',
        'Wie folge ich einer Konferenz?',
        'Zeigen Sie mir Konferenzen, denen ich nicht mehr folge.', // Beispiel, vielleicht nicht implementiert
      ],
    },
    es: { // Spanish added
      greeting: 'Hola',
      description: 'Gestiona aquí las conferencias que sigues:',
      suggestions: [
        'Listar las conferencias que sigo.',
        '¿Cómo seguir una conferencia?',
        'Mostrar las conferencias que he dejado de seguir.', // Ejemplo, podría no estar implementado
      ],
    },
    ko: { // Korean added
      greeting: '안녕하세요',
      description: '여기에서 팔로우 중인 컨퍼런스를 관리하세요:',
      suggestions: [
        '팔로우 중인 컨퍼런스를 목록 표시해주세요.',
        '컨퍼런스를 팔로우하는 방법은 무엇인가요?',
        '팔로우를 취소한 컨퍼런스를 보여주세요.', // 예시, 구현되지 않았을 수 있음
      ],
    },
    ru: { // Russian added
      greeting: 'Здравствуйте',
      description: 'Управляйте отслеживаемыми конференциями здесь:',
      suggestions: [
        'Перечислить конференции, которые я отслеживаю.',
        'Как отслеживать конференцию?',
        'Показать конференции, от которых я отписался.', // Пример, возможно, не реализовано
      ],
    },
    ar: { // Arabic added
      greeting: 'مرحباً',
      description: 'إدارة مؤتمراتك المتابعة هنا:',
      suggestions: [
        'اسرد المؤتمرات التي أتابعها.',
        'كيف أتابع مؤتمرًا؟',
        'أظهر لي المؤتمرات التي ألغيت متابعتها.', // مثال، قد لا يكون مطبقًا
      ],
    },
    fa: { // Persian added
      greeting: 'سلام',
      description: 'کنفرانس های دنبال شده خود را در اینجا مدیریت کنید:',
      suggestions: [
        'کنفرانس هایی که دنبال می کنم را لیست کن.',
        'چگونه یک کنفرانس را دنبال کنم؟',
        'کنفرانس هایی که لغو دنبال کردن کرده ام را نشان بده.', // مثال، ممکن است پیاده سازی نشده باشد
      ],
    },
    fr: { // French added
      greeting: 'Bonjour',
      description: 'Gérez vos conférences suivies ici :',
      suggestions: [
        'Lister les conférences que je suis.',
        'Comment suivre une conférence ?',
        'Montrez-moi les conférences que j\'ai cessé de suivre.', // Exemple, pourrait ne pas être implémenté
      ],
    },
    ja: { // Japanese added
      greeting: 'こんにちは',
      description: 'ここでフォロー中の会議を管理できます:',
      suggestions: [
        'フォロー中の会議をリストアップしてください。',
        '会議をフォローするにはどうすればいいですか？',
        'フォローを解除した会議を表示してください。', // 例、実装されていない可能性があります
      ],
    },
  },
};

const calendarIntroductions: IntroductionType = {
  type: 'Add to calendar/ remove from calendar , danh sách calendar conference',
  content: {
    en: {
      greeting: 'Hello',
      description: "Manage your conference calendar:",
      suggestions: [
        'Add "Conference AAAI" to my calendar.',
        'Show me my conference calendar.',
        'Remove "Conference IC3K" from my calendar.',
      ],
    },
    vi: {
      greeting: 'Xin chào',
      description: 'Quản lý lịch hội nghị của bạn:',
      suggestions: [
        'Thêm "Hội nghị AAAI" vào lịch của tôi.',
        'Hiển thị lịch hội nghị của tôi.',
        'Xóa "Hội nghị IC3K" khỏi lịch của tôi.',
      ],
    },
    zh: {
      greeting: '你好',
      description: '管理您的会议日历：',
      suggestions: [
        '将“会议 AAAI”添加到我的日历。',
        '显示我的会议日历。',
        '从我的日历中删除“会议 IC3K”。',
      ],
    },
    de: { // German added
      greeting: 'Hallo',
      description: 'Verwalten Sie Ihren Konferenzkalender:',
      suggestions: [
        'Fügen Sie "Konferenz AAAI" meinem Kalender hinzu.',
        'Zeigen Sie mir meinen Konferenzkalender.',
        'Entfernen Sie "Konferenz IC3K" aus meinem Kalender.',
      ],
    },
    es: { // Spanish added
      greeting: 'Hola',
      description: 'Gestiona tu calendario de conferencias:',
      suggestions: [
        'Agregar "Conferencia AAAI" a mi calendario.',
        'Mostrar mi calendario de conferencias.',
        'Eliminar "Conferencia IC3K" de mi calendario.',
      ],
    },
    ko: { // Korean added
      greeting: '안녕하세요',
      description: '컨퍼런스 캘린더를 관리하세요:',
      suggestions: [
        '"AAAI 컨퍼런스"를 캘린더에 추가해주세요.',
        '제 컨퍼런스 캘린더를 보여주세요.',
        '"IC3K 컨퍼런스"를 제 캘린더에서 삭제해주세요.',
      ],
    },
    ru: { // Russian added
      greeting: 'Здравствуйте',
      description: 'Управляйте своим календарем конференций:',
      suggestions: [
        'Добавить "Конференция AAAI" в мой календарь.',
        'Показать мой календарь конференций.',
        'Удалить "Конференция IC3K" из моего календаря.',
      ],
    },
    ar: { // Arabic added
      greeting: 'مرحباً',
      description: 'إدارة تقويم المؤتمرات الخاص بك:',
      suggestions: [
        'أضف "مؤتمر AAAI" إلى تقويمي.',
        'أظهر لي تقويم مؤتمراتي.',
        'إزالة "مؤتمر IC3K" من تقويمي.',
      ],
    },
    fa: { // Persian added
      greeting: 'سلام',
      description: 'تقویم کنفرانس خود را مدیریت کنید:',
      suggestions: [
        '"کنفرانس AAAI" را به تقویم من اضافه کن.',
        'تقویم کنفرانس من را نشان بده.',
        '"کنفرانس IC3K" را از تقویم من حذف کن.',
      ],
    },
    fr: { // French added
      greeting: 'Bonjour',
      description: 'Gérez votre calendrier de conférences :',
      suggestions: [
        'Ajouter "Conférence AAAI" à mon calendrier.',
        'Montrez-moi mon calendrier de conférences.',
        'Supprimez "Conférence IC3K" de mon calendrier.',
      ],
    },
    ja: { // Japanese added
      greeting: 'こんにちは',
      description: '会議カレンダーを管理します:',
      suggestions: [
        '"AAAI コンファレンス"をカレンダーに追加してください。',
        '私の会議カレンダーを表示してください。',
        '"IC3K コンファレンス"を私のカレンダーから削除してください。',
      ],
    },
  },
};

// --- New Introduction Type: Learn about the website ---
const learnWebsiteIntroductions: IntroductionType = {
  type: 'Tìm hiểu thông tin về website',
  content: {
    en: {
      greeting: 'Hello',
      description: "Want to know more about this website? Ask me!",
      suggestions: [
        'What features does this website have?',
        'Who developed this website?',
        'Is there a help section for the website?',
      ],
    },
    vi: {
      greeting: 'Xin chào',
      description: 'Bạn muốn biết thêm về trang web này? Hãy hỏi tôi!',
      suggestions: [
        'Trang web này có những tính năng gì?',
        'Ai đã phát triển trang web này?',
        'Có phần trợ giúp nào cho trang web không?',
      ],
    },
    zh: {
      greeting: '你好',
      description: '想了解更多关于这个网站的信息吗？问我吧！',
      suggestions: [
        '这个网站有什么功能？',
        '这个网站是谁开发的？',
        '网站有帮助部分吗？',
      ],
    },
    de: { // German added
      greeting: 'Hallo',
      description: 'Möchten Sie mehr über diese Website erfahren? Fragen Sie mich!',
      suggestions: [
        'Welche Funktionen hat diese Website?',
        'Wer hat diese Website entwickelt?',
        'Gibt es einen Hilfebereich für die Website?',
      ],
    },
    es: { // Spanish added
      greeting: 'Hola',
      description: '¿Quieres saber más sobre este sitio web? ¡Pregúntame!',
      suggestions: [
        '¿Qué características tiene este sitio web?',
        '¿Quién desarrolló este sitio web?',
        '¿Hay una sección de ayuda para el sitio web?',
      ],
    },
    ko: { // Korean added
      greeting: '안녕하세요',
      description: '이 웹사이트에 대해 더 알고 싶으신가요? 저에게 물어보세요!',
      suggestions: [
        '이 웹사이트에는 어떤 기능이 있나요?',
        '이 웹사이트는 누가 개발했나요?',
        '웹사이트에 도움말 섹션이 있나요?',
      ],
    },
    ru: { // Russian added
      greeting: 'Здравствуйте',
      description: 'Хотите узнать больше об этом веб-сайте? Спросите меня!',
      suggestions: [
        'Какие функции есть у этого веб-сайта?',
        'Кто разработал этот веб-сайт?',
        'Есть ли раздел справки для веб-сайта?',
      ],
    },
    ar: { // Arabic added
      greeting: 'مرحباً',
      description: 'هل ترغب في معرفة المزيد عن هذا الموقع؟ اسألني!',
      suggestions: [
        'ما هي مميزات هذا الموقع؟',
        'من قام بتطوير هذا الموقع؟',
        'هل يوجد قسم مساعدة للموقع؟',
      ],
    },
    fa: { // Persian added
      greeting: 'سلام',
      description: 'می خواهید درباره این وب سایت بیشتر بدانید؟ از من بپرسید!',
      suggestions: [
        'این وب سایت چه ویژگی هایی دارد؟',
        'این وب سایت توسط چه کسی توسعه یافته است؟',
        'آیا بخشی برای راهنمایی در وب سایت وجود دارد؟',
      ],
    },
    fr: { // French added
      greeting: 'Bonjour',
      description: 'Vous voulez en savoir plus sur ce site web ? Demandez-moi !',
      suggestions: [
        'Quelles fonctionnalités a ce site web ?',
        'Qui a développé ce site web ?',
        'Y a-t-il une section d\'aide pour le site web ?',
      ],
    },
    ja: { // Japanese added
      greeting: 'こんにちは',
      description: 'このウェブサイトについてもっと知りたいですか？聞いてください！',
      suggestions: [
        'このウェブサイトにはどのような機能がありますか？',
        'このウェブサイトは誰が開発しましたか？',
        'ウェブサイトにヘルプセクションはありますか？',
      ],
    },
  },
};

// Mảng chứa tất cả các loại introduction (đã thêm loại mới)
const allIntroductionTypes: IntroductionType[] = [
  findInfoIntroductions,
  redirectToWebsiteIntroductions,
  openMapIntroductions,
  contactAdminIntroductions,
  followUnfollowIntroductions,
  calendarIntroductions,
  learnWebsiteIntroductions, // Add the new type here
];

// Hàm chọn ngẫu nhiên 3 loại introduction và 1 câu hỏi ngẫu nhiên cho mỗi loại
const selectRandomIntroductionsWithOneSuggestion = (language: Language): { type: string; greeting: string; description: string; suggestion: string }[] => {
  const shuffledTypes = allIntroductionTypes.sort(() => 0.5 - Math.random());
  const selectedTypes = shuffledTypes.slice(0, 3);

  return selectedTypes.map(introType => {
    const content = introType.content[language] || introType.content['en']; // Get content for the current language
    // Ensure there are suggestions before trying to access one
    const randomSuggestion = content.suggestions.length > 0
      ? content.suggestions[Math.floor(Math.random() * content.suggestions.length)]
      : 'Default suggestion if none available'; // Fallback suggestion

    return {
      type: introType.type,
      greeting: content.greeting, // You might only need one greeting at the top
      description: content.description,
      suggestion: randomSuggestion,
    };
  });
};


interface ChatIntroductionProps {
  onSuggestionClick: (suggestion: string) => void;
  language: Language;
}

const ChatIntroductionDisplay: React.FC<ChatIntroductionProps> = ({
  onSuggestionClick,
  language
}) => {
  const [isClient, setIsClient] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [displayedIntroductions, setDisplayedIntroductions] = useState<{ type: string; greeting: string; description: string; suggestion: string }[]>([]);


  useEffect(() => {
    setIsClient(true);
    // --- Đọc chuỗi JSON từ localStorage khi component mount ---
    try {
      const storedUserJSON = localStorage.getItem('user');
      if (storedUserJSON) {
        const userData: UserData = JSON.parse(storedUserJSON);
        if (userData && userData.firstName) {
          setFirstName(userData.firstName);
        }
        if (userData && userData.lastName) {
          setLastName(userData.lastName);
        }
      }
    } catch (error) {
      console.error(
        'Lỗi khi parse dữ liệu người dùng từ localStorage lúc mount:',
        error
      );
    }

    // Chọn ngẫu nhiên 3 loại introduction với 1 câu hỏi ngẫu nhiên cho mỗi loại
    setDisplayedIntroductions(selectRandomIntroductionsWithOneSuggestion(language));

  }, [language]); // Re-run when language changes

  // We now get the greeting from the first displayed introduction or the default
  const greeting = displayedIntroductions.length > 0
    ? displayedIntroductions[0].greeting
    : (defaultIntroductions[language]?.greeting || defaultIntroductions.en.greeting);


  return (
    <div className='mb-3 rounded-lg border border-blue-100  p-4 text-center dark:border-blue-800 dark:bg-gray-700 sm:mb-4 sm:p-6'>
      <h2 className='mb-1.5 text-lg font-semibold  sm:mb-2 sm:text-xl'>
        {greeting}{' '}
        {(firstName || lastName) && (
          <strong className='bg-span-bg bg-clip-text text-transparent'>
            {firstName} {lastName}
          </strong>
        )}
      </h2>

      {displayedIntroductions.map((intro, index) => {
        return (
          <div key={index} className="mb-4 last:mb-0">
             {/* You could display the type title here if desired */}
             {/* <h3 className="text-base font-medium mb-2">{intro.type}</h3> */}
            <p className='mb-3 text-sm  sm:mb-4'>{intro.description}</p>
            <div className='flex flex-wrap justify-center gap-1.5 sm:gap-2'>
              {/* Only display the single random suggestion */}
              <button
                key={0} // Use a fixed key since there's only one button
                onClick={() => onSuggestionClick(intro.suggestion)}
                className='dark:hover:0 rounded-2xl border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium  transition-colors duration-150 hover:border-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-200 sm:px-3 sm:text-sm'
              >
                {intro.suggestion}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ChatIntroductionDisplay;