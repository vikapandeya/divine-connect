import { useEffect, useState } from 'react';
import { getLocale, subscribeToLocale, type AppLocale } from './platform';

type LocaleMap = {
  hi: string;
  sa: string;
};

const translations: Record<string, LocaleMap> = {
  'Home': { hi: 'मुखपृष्ठ', sa: 'मुखपृष्ठम्' },
  'Services': { hi: 'सेवाएँ', sa: 'सेवाः' },
  'Shop': { hi: 'दुकान', sa: 'क्रयागारम्' },
  'Knowledge': { hi: 'ज्ञान', sa: 'ज्ञानम्' },
  'AI Astrology': { hi: 'एआई ज्योतिष', sa: 'कृत्रिम-बुद्धि-ज्योतिषम्' },
  'About': { hi: 'परिचय', sa: 'परिचयः' },
  'Contact': { hi: 'संपर्क', sa: 'सम्पर्कः' },
  'Book Puja': { hi: 'पूजा बुक करें', sa: 'पूजाम् आरक्षत' },
  'Temple Prasad': { hi: 'मंदिर प्रसाद', sa: 'मन्दिर-प्रसादः' },
  'My Profile': { hi: 'मेरा प्रोफ़ाइल', sa: 'मम परिचयपत्रम्' },
  'Need help?': { hi: 'सहायता चाहिए?', sa: 'साहाय्यम् अपेक्षितम्?' },
  'Search offerings': { hi: 'सेवाएँ खोजें', sa: 'सेवाः अन्विष्यन्ताम्' },
  'Demo Mode Active': { hi: 'डेमो मोड सक्रिय', sa: 'प्रदर्शन-रूपम् सक्रियम्' },
  'Spiritual platform demo': { hi: 'आध्यात्मिक प्लेटफ़ॉर्म डेमो', sa: 'आध्यात्मिक-मञ्च-प्रदर्शनम्' },
  'Puja booking, darshan support, prasad delivery, and astrology in one guided experience.': {
    hi: 'एक ही मार्गदर्शित अनुभव में पूजा बुकिंग, दर्शन सहायता, प्रसाद वितरण और ज्योतिष।',
    sa: 'एकस्मिन् मार्गदर्शित-अनुभवे पूजारक्षणम्, दर्शन-साहाय्यम्, प्रसाद-प्रेषणम्, ज्योतिषमार्गदर्शनं च।',
  },
  'Daily Panchang': { hi: 'दैनिक पंचांग', sa: 'दैनिक-पञ्चाङ्गम्' },
  "Today's auspicious guidance, muhurat, and devotional timing highlights.": {
    hi: 'आज के शुभ संकेत, मुहूर्त और भक्ति-संबंधी समय का सार।',
    sa: 'अद्यतनं शुभमार्गदर्शनम्, मुहूर्तम्, भक्तिकाल-विशेषाः च।',
  },
  'Spiritual Knowledge Base': { hi: 'आध्यात्मिक ज्ञानकोश', sa: 'आध्यात्मिक-ज्ञानकोशः' },
  'Hardcoded editorial cards for rituals, festivals, and family guidance.': {
    hi: 'अनुष्ठान, पर्व और पारिवारिक मार्गदर्शन के लिए चयनित सामग्री।',
    sa: 'व्रत, उत्सव, कुलमार्गदर्शनार्थं चयनिताः लेखाः।',
  },
  'PWA Ready': { hi: 'पीडब्ल्यूए तैयार', sa: 'पीडब्ल्यूए सज्जम्' },
  'Web Only': { hi: 'केवल वेब', sa: 'जालपुटमात्रम्' },
  'Sacred services with modern clarity': {
    hi: 'आधुनिक स्पष्टता के साथ पवित्र सेवाएँ',
    sa: 'आधुनिक-स्पष्टतया सह पवित्र-सेवाः',
  },
  'Realtime Alerts': { hi: 'रीयलटाइम सूचनाएँ', sa: 'तात्कालिक-सूचनाः' },
  'Demo Profile': { hi: 'डेमो प्रोफ़ाइल', sa: 'प्रदर्शन-परिचयपत्रम्' },
  'Bookings, invoices, certificates': {
    hi: 'बुकिंग, चालान और प्रमाणपत्र',
    sa: 'आरक्षणानि, चलनपत्राणि, प्रमाणपत्राणि',
  },
  'Manage products and pujas': { hi: 'उत्पाद और पूजाएँ प्रबंधित करें', sa: 'उत्पादान् पूजाश्च व्यवस्थापयत' },
  'Admin Panel': { hi: 'एडमिन पैनल', sa: 'प्रशासक-पट्टः' },
  'Platform operations overview': { hi: 'प्लेटफ़ॉर्म संचालन अवलोकन', sa: 'मञ्च-सञ्चालन-समीक्षणम्' },
  'My Orders': { hi: 'मेरे ऑर्डर', sa: 'मम आदेशाः' },
  'Receipts, invoices, and reorder actions': {
    hi: 'रसीदें, चालान और पुनः-ऑर्डर क्रियाएँ',
    sa: 'रसीदाः, चलनपत्राणि, पुनरादेश-क्रियाः',
  },
  'Bookings, certificates, and account history': {
    hi: 'बुकिंग, प्रमाणपत्र और खाता इतिहास',
    sa: 'आरक्षणानि, प्रमाणपत्राणि, लेखा-इतिहासः',
  },
  'Manage products, pujas, and bookings': {
    hi: 'उत्पाद, पूजाएँ और बुकिंग प्रबंधित करें',
    sa: 'उत्पादान्, पूजाः, आरक्षणानि च व्यवस्थापयत',
  },
  'Platform operations and catalog control': {
    hi: 'प्लेटफ़ॉर्म संचालन और कैटलॉग नियंत्रण',
    sa: 'मञ्च-सञ्चालनम् तथा सूची-नियन्त्रणम्',
  },
  'Explore': { hi: 'एक्सप्लोर', sa: 'अन्वेषणम्' },
  'Puja Booking': { hi: 'पूजा बुकिंग', sa: 'पूजारक्षणम्' },
  'Yatra Packages': { hi: 'यात्रा पैकेज', sa: 'यात्रा-संकुलानि' },
  'Darshan Support': { hi: 'दर्शन सहायता', sa: 'दर्शन-साहाय्यम्' },
  'Platform': { hi: 'प्लेटफ़ॉर्म', sa: 'मञ्चः' },
  'Our Mission': { hi: 'हमारा उद्देश्य', sa: 'अस्माकं ध्येयम्' },
  'Contact Support': { hi: 'सहायता से संपर्क', sa: 'साहाय्येन सह सम्पर्कः' },
  'Reach Us': { hi: 'हमसे जुड़ें', sa: 'अस्मान् सम्प्राप्नुत' },
  'Open Support': { hi: 'सहायता खोलें', sa: 'साहाय्यं उद्घाटयत' },
  'A guided spiritual platform for puja booking, darshan coordination, temple prasad, sacred commerce, and AI-assisted devotional support.': {
    hi: 'पूजा बुकिंग, दर्शन समन्वय, मंदिर प्रसाद, आध्यात्मिक वाणिज्य और एआई-आधारित भक्तिभाव सहायता के लिए एक मार्गदर्शित आध्यात्मिक मंच।',
    sa: 'पूजारक्षणाय, दर्शन-समन्वयाय, मन्दिर-प्रसादाय, पवित्र-वाणिज्याय, कृत्रिम-बुद्धि-सहायित-भक्ति-साहाय्याय च मार्गदर्शितः आध्यात्मिक-मञ्चः।',
  },
  'Verified services': { hi: 'सत्यापित सेवाएँ', sa: 'सत्यापित-सेवाः' },
  'Temple-linked offerings': { hi: 'मंदिर-संबद्ध अर्पण', sa: 'मन्दिर-संबद्ध-समर्पणानि' },
  'Printable records': { hi: 'प्रिंट योग्य अभिलेख', sa: 'मुद्रणीय-अभिलेखाः' },
  'Monday to Saturday, 9:00 AM to 7:00 PM IST': {
    hi: 'सोमवार से शनिवार, प्रातः 9:00 से सायं 7:00 बजे तक',
    sa: 'सोमवासरात् शनिवासरपर्यन्तम्, प्रातः 9:00 यावत् सायं 7:00',
  },
  'All spiritual rights reserved.': { hi: 'सर्वाधिकार सुरक्षित।', sa: 'सर्वे आध्यात्मिक-अधिकाराः सुरक्षिताः।' },
  'Designed for a calm, guided, and trustworthy devotional journey.': {
    hi: 'शांत, मार्गदर्शित और विश्वसनीय भक्ति-यात्रा के लिए निर्मित।',
    sa: 'शान्तायै मार्गदर्शितायै विश्वसनीयायै भक्तियात्रायै विनिर्मितम्।',
  },
  'Connect with the Divine': { hi: 'दिव्यता से जुड़ें', sa: 'दिव्येन सम्बध्यध्वम्' },
  'from Anywhere': { hi: 'कहीं से भी', sa: 'यतः कुतश्चित्' },
  'Experience sacred rituals, online live darshan, and temple offerings on a platform built for trust, clarity, devotional ease, and reliable delivery.': {
    hi: 'विश्वास, स्पष्टता, भक्तिपूर्ण सहजता और भरोसेमंद सेवा के लिए बने मंच पर पवित्र अनुष्ठान, ऑनलाइन लाइव दर्शन और मंदिर अर्पणों का अनुभव करें।',
    sa: 'विश्वासाय, स्पष्टतायै, भक्तिसौकर्याय, विश्वसनीय-सेवायै निर्मिते मञ्चे पवित्रानुष्ठानानि, आनलाइन-दर्शनम्, मन्दिर-समर्पणानि च अनुभवन्तु।',
  },
  'Spiritual Knowledge': { hi: 'आध्यात्मिक ज्ञान', sa: 'आध्यात्मिक-ज्ञानम्' },
  'Live Panchang': { hi: 'लाइव पंचांग', sa: 'सजीव-पञ्चाङ्गम्' },
  'Fallback Snapshot': { hi: 'बैकअप स्नैपशॉट', sa: 'पर्यायी-चित्रम्' },
  "Refreshing today's Panchang from the configured source...": {
    hi: 'निर्धारित स्रोत से आज का पंचांग अद्यतन किया जा रहा है...',
    sa: 'निर्दिष्टस्रोततः अद्यतन-पञ्चाङ्गम् अद्यतन्यते...',
  },
  'Tithi': { hi: 'तिथि', sa: 'तिथिः' },
  'Nakshatra': { hi: 'नक्षत्र', sa: 'नक्षत्रम्' },
  'Muhurat': { hi: 'मुहूर्त', sa: 'मुहूर्तम्' },
  'Devotional Focus': { hi: 'भक्ति-केंद्र', sa: 'भक्ति-केंद्रः' },
  'Daily Horoscope': { hi: 'दैनिक राशिफल', sa: 'दैनिक-राशिफलम्' },
  'Return every day for auspicious guidance': {
    hi: 'शुभ मार्गदर्शन के लिए प्रतिदिन आएँ',
    sa: 'शुभमार्गदर्शनाय प्रतिदिनम् आगच्छन्तु',
  },
  'Remedy Ready': { hi: 'उपाय उपलब्ध', sa: 'उपायः सिद्धः' },
  'New Feature': { hi: 'नई सुविधा', sa: 'नवीन-सुविधा' },
  'Explore Yatra Packages': { hi: 'यात्रा पैकेज देखें', sa: 'यात्रा-संकुलानि पश्यत' },
  'Sacred Services': { hi: 'पवित्र सेवाएँ', sa: 'पवित्र-सेवाः' },
  'Temple Integration': { hi: 'मंदिर समेकन', sa: 'मन्दिर-समन्वयः' },
  'Temple Linked': { hi: 'मंदिर-संबद्ध', sa: 'मन्दिर-संबद्धम्' },
  'View Services': { hi: 'सेवाएँ देखें', sa: 'सेवाः पश्यत' },
  'Feedback & Rating': { hi: 'प्रतिक्रिया और रेटिंग', sa: 'प्रतिक्रिया तथा मूल्यांकनम्' },
  'Built for trust in every sacred step.': {
    hi: 'हर पवित्र चरण में विश्वास के लिए निर्मित।',
    sa: 'प्रत्येकस्मिन् पवित्र-पदे विश्वासाय निर्मितम्।',
  },
  'Share Your Feedback': { hi: 'अपनी प्रतिक्रिया साझा करें', sa: 'स्वप्रतिक्रियां साझयन्तु' },
  'Tell us how we can serve devotees better.': {
    hi: 'बताइए कि हम भक्तों की और बेहतर सेवा कैसे कर सकते हैं।',
    sa: 'वदन्तु यत् वयं भक्तान् कथं श्रेष्ठतया सेवितुं शक्नुमः।',
  },
  'Your full name': { hi: 'आपका पूरा नाम', sa: 'भवतः पूर्णनाम' },
  'Your email address': { hi: 'आपका ईमेल पता', sa: 'भवतः ईमेल-पता' },
  'Subject, for example puja booking or prasad delivery': {
    hi: 'विषय, जैसे पूजा बुकिंग या प्रसाद डिलीवरी',
    sa: 'विषयः, यथा पूजारक्षणम् अथवा प्रसाद-प्रेषणम्',
  },
  '5 Star': { hi: '5 सितारा', sa: 'पञ्च-तारक' },
  '4 Star': { hi: '4 सितारा', sa: 'चतुर्-तारक' },
  '3 Star': { hi: '3 सितारा', sa: 'त्रि-तारक' },
  '2 Star': { hi: '2 सितारा', sa: 'द्वि-तारक' },
  '1 Star': { hi: '1 सितारा', sa: 'एक-तारक' },
  'Submitting Feedback...': { hi: 'प्रतिक्रिया भेजी जा रही है...', sa: 'प्रतिक्रिया प्रेष्यते...' },
  'Submit Feedback': { hi: 'प्रतिक्रिया भेजें', sa: 'प्रतिक्रियाम् प्रेषयत' },
  'Feedback shared': { hi: 'प्रतिक्रिया साझा की गई', sa: 'प्रतिक्रिया साझिता' },
  'Thank you. Your feedback has been shared with the DivineConnect team.': {
    hi: 'धन्यवाद। आपकी प्रतिक्रिया DivineConnect टीम तक पहुँच गई है।',
    sa: 'धन्यवादः। भवतः प्रतिक्रिया DivineConnect-दले प्रापिता।',
  },
  'Feedback not submitted': { hi: 'प्रतिक्रिया जमा नहीं हुई', sa: 'प्रतिक्रिया न समर्पिता' },
  'Unable to submit feedback right now. Please try again in a moment.': {
    hi: 'अभी प्रतिक्रिया भेजना संभव नहीं है। कृपया थोड़ी देर बाद पुनः प्रयास करें।',
    sa: 'अधुना प्रतिक्रिया प्रेषयितुं न शक्यते। कृपया क्षणानन्तरं पुनः प्रयतध्वम्।',
  },
  'Spiritual Offerings': { hi: 'आध्यात्मिक अर्पण', sa: 'आध्यात्मिक-समर्पणानि' },
  'View All': { hi: 'सभी देखें', sa: 'सर्वाणि पश्यत' },
  'Open Knowledge Hub': { hi: 'ज्ञान केंद्र खोलें', sa: 'ज्ञानकेन्द्रम् उद्घाटयत' },
  'Read article': { hi: 'लेख पढ़ें', sa: 'लेखं पठत' },
  'Contact DivineConnect': { hi: 'DivineConnect से संपर्क', sa: 'DivineConnect-सम्पर्कः' },
  'Live Chat': { hi: 'लाइव चैट', sa: 'सजीव-सम्भाषणम्' },
  'AI Support Online': { hi: 'एआई सहायता ऑनलाइन', sa: 'कृत्रिम-बुद्धि-साहाय्यम् आनलाइन' },
  'Send': { hi: 'भेजें', sa: 'प्रेषयत' },
  'Support Hours': { hi: 'सहायता समय', sa: 'साहाय्य-कालः' },
  'What AI Support Can Help With': { hi: 'एआई सहायता किसमें मदद कर सकती है', sa: 'कृत्रिम-बुद्धि-साहाय्यं केषु सहायं करोति' },
  'Page Not Found': { hi: 'पृष्ठ नहीं मिला', sa: 'पृष्ठं न लब्धम्' },
  'Return Home': { hi: 'मुखपृष्ठ पर लौटें', sa: 'मुखपृष्ठं प्रत्यागच्छत' },
  'Explore Shop': { hi: 'दुकान देखें', sa: 'क्रयागारम् पश्यत' },
  'Back to Home': { hi: 'मुखपृष्ठ पर वापस', sa: 'मुखपृष्ठं प्रति' },
  'Spiritual Shop': { hi: 'आध्यात्मिक दुकान', sa: 'आध्यात्मिक-क्रयागारम्' },
  'All Routes': { hi: 'सभी मार्ग', sa: 'सर्वे मार्गाः' },
  'Char Dham': { hi: 'चार धाम', sa: 'चारधाम' },
  'Jyotirlinga': { hi: 'ज्योतिर्लिंग', sa: 'ज्योतिर्लिङ्गम्' },
  'Tirth Sthal': { hi: 'तीर्थ स्थल', sa: 'तीर्थ-स्थलम्' },
  'Dham Circuits': { hi: 'धाम परिक्रमा', sa: 'धाम-परिचक्राः' },
  'Pilgrimage Packages': { hi: 'तीर्थयात्रा पैकेज', sa: 'तीर्थयात्रा-संकुलानि' },
  'Checkout Flow': { hi: 'चेकआउट प्रक्रिया', sa: 'समापन-क्रिया' },
  'Order Summary': { hi: 'ऑर्डर सारांश', sa: 'आदेश-सारः' },
  'Delivery Details': { hi: 'डिलीवरी विवरण', sa: 'प्रेषण-विवरणम्' },
  'Payment Method': { hi: 'भुगतान विधि', sa: 'भुगतान-प्रकारः' },
  'Place Order': { hi: 'ऑर्डर करें', sa: 'आदेशं स्थापयत' },
  'Processing...': { hi: 'प्रक्रिया चल रही है...', sa: 'प्रक्रिया प्रवर्तते...' },
  'Your cart is empty': { hi: 'आपकी कार्ट खाली है', sa: 'भवतः कार्ट शून्या अस्ति' },
  "Looks like you haven't added any spiritual essentials yet.": {
    hi: 'लगता है आपने अभी तक कोई आध्यात्मिक सामग्री नहीं जोड़ी है।',
    sa: 'अद्यापि भवता किमपि आध्यात्मिक-सामग्री न योजिता।',
  },
  'Start Shopping': { hi: 'खरीदारी शुरू करें', sa: 'क्रयम् आरभध्वम्' },
  'Confirm Booking': { hi: 'बुकिंग की पुष्टि करें', sa: 'आरक्षणं पुष्टि करोतु' },
  'Back to Services': { hi: 'सेवाओं पर वापस', sa: 'सेवासु प्रत्यागच्छत' },
  'Puja not found': { hi: 'पूजा नहीं मिली', sa: 'पूजा न लब्धा' },
  'Loading puja details...': { hi: 'पूजा विवरण लोड हो रहे हैं...', sa: 'पूजा-विवरणानि आनीयन्ते...' },
  'My DivineConnect': { hi: 'मेरा DivineConnect', sa: 'मम DivineConnect' },
  'Service Bookings': { hi: 'सेवा बुकिंग', sa: 'सेवा-आरक्षणानि' },
  'Order History': { hi: 'ऑर्डर इतिहास', sa: 'आदेश-इतिहासः' },
  'Astrology History': { hi: 'ज्योतिष इतिहास', sa: 'ज्योतिष-इतिहासः' },
  'Account Settings': { hi: 'खाता सेटिंग्स', sa: 'लेखा-विन्यासः' },
  'Bookings': { hi: 'बुकिंग', sa: 'आरक्षणानि' },
  'Orders': { hi: 'ऑर्डर', sa: 'आदेशाः' },
  'Readings': { hi: 'रीडिंग', sa: 'पाठनानि' },
  'Wishlist': { hi: 'इच्छा-सूची', sa: 'अभिलाषा-सूची' },
  'No orders': { hi: 'कोई ऑर्डर नहीं', sa: 'आदेशाः न सन्ति' },
  'Account Workspace': { hi: 'खाता कार्यक्षेत्र', sa: 'लेखा-कार्य-क्षेत्रम्' },
  'Full Name': { hi: 'पूरा नाम', sa: 'पूर्णनाम' },
  'Email Address': { hi: 'ईमेल पता', sa: 'ईमेल-पता' },
  'No orders found.': { hi: 'कोई ऑर्डर नहीं मिला।', sa: 'आदेशाः न लब्धाः।' },
  'No astrology readings found yet.': { hi: 'अभी तक कोई ज्योतिष रीडिंग नहीं मिली।', sa: 'अद्यावधि ज्योतिष-पाठनानि न लब्धानि।' },
  'Vendor Dashboard': { hi: 'विक्रेता डैशबोर्ड', sa: 'विक्रेता-फलकम्' },
  'Manage your divine offerings and bookings.': {
    hi: 'अपने दिव्य अर्पण और बुकिंग प्रबंधित करें।',
    sa: 'स्वानि दिव्य-समर्पणानि आरक्षणानि च व्यवस्थापयत।',
  },
  'Products': { hi: 'उत्पाद', sa: 'उत्पादाः' },
  'Pujas': { hi: 'पूजाएँ', sa: 'पूजाः' },
  'Wallet and payouts': { hi: 'वॉलेट और भुगतान', sa: 'कोषः तथा भुगतानम्' },
  'Realtime operations': { hi: 'रीयलटाइम संचालन', sa: 'तात्कालिक-सञ्चालनम्' },
  'Add Product': { hi: 'उत्पाद जोड़ें', sa: 'उत्पादं योजयत' },
  'Add Puja': { hi: 'पूजा जोड़ें', sa: 'पूजां योजयत' },
  'Admin Dashboard': { hi: 'एडमिन डैशबोर्ड', sa: 'प्रशासक-फलकम्' },
  'Manage your spiritual marketplace inventory.': {
    hi: 'अपने आध्यात्मिक मार्केटप्लेस की सूची प्रबंधित करें।',
    sa: 'स्वस्य आध्यात्मिक-विपण्याः सूचीं व्यवस्थापयत।',
  },
  'Add New Product': { hi: 'नया उत्पाद जोड़ें', sa: 'नवीनम् उत्पादं योजयत' },
  'Product Name': { hi: 'उत्पाद नाम', sa: 'उत्पादनाम' },
  'Category': { hi: 'श्रेणी', sa: 'वर्गः' },
  'Price (Rs.)': { hi: 'मूल्य (रु.)', sa: 'मूल्यम् (रु.)' },
  'Stock Quantity': { hi: 'स्टॉक मात्रा', sa: 'भाण्डार-परिमाणम्' },
  'Image URL': { hi: 'छवि URL', sa: 'चित्र-URL' },
  'Temple / Source': { hi: 'मंदिर / स्रोत', sa: 'मन्दिरम् / स्रोतः' },
  'Offering Type': { hi: 'अर्पण प्रकार', sa: 'समर्पण-प्रकारः' },
  'Weight': { hi: 'वज़न', sa: 'भारः' },
  'Size / Pack': { hi: 'आकार / पैक', sa: 'परिमाणम् / पुटम्' },
  'Dispatch Window': { hi: 'प्रेषण समय', sa: 'प्रेषण-कालः' },
  'City': { hi: 'शहर', sa: 'नगरम्' },
  'Description': { hi: 'विवरण', sa: 'वर्णनम्' },
  'Cancel': { hi: 'रद्द करें', sa: 'निरस्यत' },
  'Save Product': { hi: 'उत्पाद सहेजें', sa: 'उत्पादं रक्षत' },
  'Update Product': { hi: 'उत्पाद अपडेट करें', sa: 'उत्पादं अद्यतनं कुरुत' },
  'Save Puja': { hi: 'पूजा सहेजें', sa: 'पूजां रक्षत' },
  'Edit Product': { hi: 'उत्पाद संपादित करें', sa: 'उत्पादं सम्पादयत' },
};

export function useAppLocale() {
  const [locale, setLocaleState] = useState<AppLocale>(getLocale());

  useEffect(() => subscribeToLocale(() => setLocaleState(getLocale())), []);

  return locale;
}

export function translateText(locale: AppLocale, text: string) {
  if (locale === 'en') {
    return text;
  }

  const translation = translations[text];
  if (!translation) {
    return text;
  }

  return locale === 'hi' ? translation.hi : translation.sa;
}

export function translateArray(locale: AppLocale, values: string[]) {
  return values.map((value) => translateText(locale, value));
}

function resolveIntlLocale(locale: AppLocale) {
  if (locale === 'hi') {
    return 'hi-IN';
  }

  if (locale === 'sa') {
    return 'sa-IN';
  }

  return 'en-IN';
}

export function formatDateForLocale(value: string | Date, locale: AppLocale) {
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function formatDateTimeForLocale(value: string | Date, locale: AppLocale) {
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
