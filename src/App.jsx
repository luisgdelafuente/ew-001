import React, { useState } from 'react';
import OpenAI from 'openai';
import { WebsiteAnalyzer } from './websiteAnalyzer';
import { translations } from './translations';
import { getSystemPrompts } from './prompts';
import LoadingModal from './components/LoadingModal';
import { createCheckoutSession, redirectToCheckout } from './services/stripe';

const LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' }
];

const VideoIcon = () => (
  <svg className="w-6 h-6 text-white group-hover:text-[#7B7EF4] transition-colors" fill="currentColor" viewBox="0 0 24 24">
    <path d="M4 8h12v8H4zm14 2l3-2v8l-3-2m-4-9H3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2v-2l3 2a1 1 0 001-1V8a1 1 0 00-1-1l-3 2V7a2 2 0 00-2-2z"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

function App() {
  const [companyName, setCompanyName] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [activity, setActivity] = useState('');
  const [language, setLanguage] = useState('es');
  const [videoCount, setVideoCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [videoScripts, setVideoScripts] = useState([]);
  const [step, setStep] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const t = translations[language];
  const prompts = getSystemPrompts(language);
  const VIDEO_PRICE = 99; // Price per video in euros

  const showModal = (message) => {
    setModalMessage(message);
    setModalOpen(true);
  };

  const hideModal = () => {
    setModalOpen(false);
    setModalMessage('');
  };

  const handleUrlChange = (e) => {
    setError('');
    let url = e.target.value.trim();
    url = url.replace(/^(https?:\/\/)?(www\.)?/, '');
    setCompanyUrl(url);
  };

  const analyzeWebsite = async (url) => {
    if (!url) {
      setError(t.errors.noUrl);
      return;
    }

    setError('');
    setAnalyzing(true);
    showModal(t.processing.analyzingWebsite);

    try {
      const analyzer = new WebsiteAnalyzer(openai.apiKey, language);
      const content = await analyzer.extractMainContent(url);
      const analysis = await analyzer.analyzeContent(content);
      
      if (analysis.companyName) {
        setCompanyName(analysis.companyName);
      }
      if (analysis.activity) {
        setActivity(analysis.activity);
      }
    } catch (error) {
      console.error('Error analyzing website:', error);
      setError(t.errors.websiteAnalysis);
    } finally {
      setAnalyzing(false);
      hideModal();
    }
  };

  const getVideoScripts = async () => {
    if (!companyName.trim() || !activity.trim()) {
      setError(t.errors.missingInfo);
      return;
    }

    setError('');
    setLoading(true);
    showModal(t.processing.generatingScripts(videoCount));

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: `You are a professional video marketing scriptwriter specializing in short-form video content. Your task is to create engaging video concepts that follow these strict guidelines:

1. Video Duration:
- All videos must be designed for short-form format (20-60 seconds)
- If a topic requires more time, split it into multiple related videos
- Indicate the recommended duration for each video in seconds

2. Content Mix:
- Create a balanced mix of:
  a) Direct company-focused videos (showcasing products, services, team, etc.)
  b) Indirect industry-related content (tips, trends, educational content)
- Ensure each video has a clear value proposition for viewers

3. Format Requirements:
- Each video must be concise and focused on a single main point
- Include visual suggestions that work well in vertical format
- Consider the fast-paced nature of short-form content

Format the response as a JSON array of objects with:
- title: Catchy, SEO-friendly title
- description: Brief concept explanation (2-3 sentences)
- duration: Recommended duration in seconds
- type: "direct" or "indirect" (company focus vs industry focus)

All content MUST be in ${LANGUAGES.find(l => l.code === language).name}`
        }, {
          role: "user",
          content: `Create ${videoCount} video concepts for this company:

Company Information:
Company: ${companyName}
Activity: ${activity}

Requirements:
- Create exactly ${videoCount} video concepts
- Mix direct company content with indirect industry content
- Keep all videos between 20-60 seconds
- Split longer topics into multiple related videos
- Make titles catchy and SEO-friendly
- Every title and description MUST be in ${LANGUAGES.find(l => l.code === language).name}

Format each video as:
{
  "title": "Engaging, SEO-friendly title",
  "description": "Brief concept description",
  "duration": seconds,
  "type": "direct" or "indirect"
}`
        }],
        temperature: 0.8,
      });

      let scripts;
      try {
        scripts = JSON.parse(response.choices[0].message.content);
        if (!Array.isArray(scripts)) {
          throw new Error('Invalid response format');
        }
      } catch (e) {
        console.error('Error parsing scripts:', e);
        throw new Error(t.errors.invalidResponse);
      }

      // Add unique IDs to each video script
      const scriptsWithIds = scripts.slice(0, videoCount).map((script, index) => ({
        ...script,
        id: `video-${Date.now()}-${index}`
      }));

      setVideoScripts(scriptsWithIds);
      setSelectedVideos([]);
      setStep(2);
      setError('');
    } catch (error) {
      console.error('Error getting video scripts:', error);
      setError(t.errors.scriptGeneration);
    } finally {
      setLoading(false);
      hideModal();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await getVideoScripts();
  };

  const handleBack = () => {
    setStep(1);
    setError('');
    setSelectedVideos([]);
    setShowCheckout(false);
  };

  const toggleVideoSelection = (index) => {
    setSelectedVideos(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleOrderVideos = () => {
    if (selectedVideos.length === 0) {
      setError(t.errors.noVideosSelected);
      return;
    }
    setShowCheckout(true);
  };

  const handlePurchase = async () => {
    if (selectedVideos.length === 0) {
      setError(t.errors.noVideosSelected);
      return;
    }

    try {
      setProcessingPayment(true);
      showModal(t.checkout.processingPayment);

      // Get the selected video objects
      const selectedVideoObjects = selectedVideos.map(index => videoScripts[index]);

      // Create a checkout session with Stripe
      const session = await createCheckoutSession(selectedVideoObjects, companyName);
      
      // Redirect to Stripe Checkout
      await redirectToCheckout(session.id);
      
      // Note: The user will be redirected to Stripe's checkout page,
      // so the code below may not execute immediately
      
      hideModal();
      setProcessingPayment(false);
    } catch (error) {
      console.error('Payment error:', error);
      hideModal();
      setProcessingPayment(false);
      setError(t.errors.paymentFailed);
    }
  };

  const totalPrice = selectedVideos.length * VIDEO_PRICE;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-montreal">
      <LoadingModal isOpen={modalOpen} message={modalMessage} />
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none"></div>
      
      <div className="relative z-10 px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="text-[#7B7EF4] transition-colors">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 8h12v8H4zm14 2l3-2v8l-3-2m-4-9H3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2v-2l3 2a1 1 0 001-1V8a1 1 0 00-1-1l-3 2V7a2 2 0 00-2-2z"/>
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl font-medium">
                {t.title}
              </h1>
            </div>
          </div>
          
          {step === 1 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/10">
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <div className="mb-8">
                  <div className="mb-4">
                    <label className="block text-base font-medium text-gray-300 mb-2">
                      {t.language.label}
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#7B7EF4] focus:ring-1 focus:ring-[#7B7EF4] transition-colors"
                      style={{ color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    >
                      {LANGUAGES.map(({ code, name }) => (
                        <option key={code} value={code} style={{ color: 'black' }}>{name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-base font-medium text-gray-300 mb-2">
                      {t.websiteUrl.label}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={companyUrl}
                        onChange={handleUrlChange}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#7B7EF4] focus:ring-1 focus:ring-[#7B7EF4] transition-colors"
                        placeholder={t.websiteUrl.placeholder}
                      />
                      <button
                        type="button"
                        onClick={() => analyzeWebsite(companyUrl)}
                        disabled={!companyUrl || analyzing}
                        className="w-full sm:w-auto bg-[#7B7EF4] text-white py-3 px-6 rounded-xl hover:bg-[#6B6EE4] focus:outline-none focus:ring-2 focus:ring-[#7B7EF4] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 transition-colors font-medium whitespace-nowrap"
                      >
                        {analyzing ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t.websiteUrl.analyzing}
                          </div>
                        ) : (
                          t.websiteUrl.analyzeButton
                        )}
                      </button>
                    </div>
                    {error && (
                      <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {error}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-base font-medium text-gray-300 mb-2">
                      {t.companyName.label}
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#7B7EF4] focus:ring-1 focus:ring-[#7B7EF4] transition-colors"
                      placeholder={t.companyName.placeholder}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-base font-medium text-gray-300 mb-2">
                      {t.activity.label}
                    </label>
                    <textarea
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#7B7EF4] focus:ring-1 focus:ring-[#7B7EF4] transition-colors"
                      placeholder={t.activity.placeholder}
                      rows="5"
                      required
                      style={{ resize: 'none', height: 'auto', minHeight: '120px' }}
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-base font-medium text-gray-300 mb-2">
                    {t.videoCount.label}
                  </label>
                  <select
                    value={videoCount}
                    onChange={(e) => setVideoCount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#7B7EF4] focus:ring-1 focus:ring-[#7B7EF4] transition-colors"
                    style={{ color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    {[...Array(8)].map((_, i) => (
                      <option key={i + 3} value={i + 3} style={{ color: 'black' }}>{i + 3}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading || !companyName.trim() || !activity.trim()}
                  className="w-full bg-[#7B7EF4] text-white py-3 px-4 rounded-xl hover:bg-[#6B6EE4] focus:outline-none focus:ring-2 focus:ring-[#7B7EF4] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 transition-colors font-medium"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t.generateScripts.analyzing}
                    </div>
                  ) : t.generateScripts.button}
                </button>
              </form>
            </div>
          )}

          {step === 2 && videoScripts.length > 0 && !showCheckout && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/10">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-medium mb-6">
                  {t.videoScripts.title}
                </h2>
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-6 mb-8">
                  {videoScripts.map((script, index) => (
                    <div
                      key={index}
                      className={`group bg-white/5 rounded-xl p-4 sm:p-6 border transition-colors ${
                        selectedVideos.includes(index) 
                          ? 'border-[#7B7EF4] bg-white/10' 
                          : 'border-white/10 hover:bg-white/10 hover:border-[#7B7EF4]'
                      }`}
                      onClick={() => toggleVideoSelection(index)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                            selectedVideos.includes(index) 
                              ? 'bg-[#7B7EF4] border-[#7B7EF4]' 
                              : 'border-white/30'
                          }`}>
                            {selectedVideos.includes(index) && <CheckIcon />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-medium mb-3 group-hover:text-[#7B7EF4] transition-colors">{script.title}</h3>
                          <p className="text-gray-400">{script.description}</p>
                          <p className="text-gray-400 mt-2">
                            <span className="text-[#7B7EF4]">{script.duration}s</span> • 
                            <span className="ml-2">{script.type === 'direct' ? t.videoTypes.direct : t.videoTypes.indirect}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleBack}
                    className="w-full bg-white/5 text-white py-3 px-4 rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#7B7EF4] focus:ring-offset-2 focus:ring-offset-black transition-colors border border-white/10 font-medium"
                  >
                    {t.videoScripts.backButton}
                  </button>
                  <button
                    onClick={handleOrderVideos}
                    className="w-full bg-[#7B7EF4] text-white py-3 px-4 rounded-xl hover:bg-[#6B6EE4] focus:outline-none focus:ring-2 focus:ring-[#7B7EF4] focus:ring-offset-2 focus:ring-offset-black transition-colors font-medium"
                    disabled={selectedVideos.length === 0}
                  >
                    {t.videoScripts.orderButton} ({selectedVideos.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && showCheckout && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/10">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-medium mb-6">
                  {t.checkout.title}
                </h2>
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-6 mb-8">
                  {selectedVideos.map((videoIndex) => {
                    const script = videoScripts[videoIndex];
                    return (
                      <div key={videoIndex} className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-medium mb-2">{script.title}</h3>
                            <p className="text-gray-400 text-sm">{script.duration}s • {script.type === 'direct' ? t.videoTypes.direct : t.videoTypes.indirect}</p>
                          </div>
                          <div className="text-lg font-medium">{VIDEO_PRICE}€</div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="bg-white/10 rounded-xl p-4 sm:p-6 border border-white/10">
                    <div className="flex justify-between items-center">
                      <div className="text-xl font-medium">{t.checkout.total}</div>
                      <div className="text-xl font-medium">{totalPrice}€</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="w-full bg-white/5 text-white py-3 px-4 rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#7B7EF4] focus:ring-offset-2 focus:ring-offset-black transition-colors border border-white/10 font-medium"
                    disabled={processingPayment}
                  >
                    {t.checkout.backButton}
                  </button>
                  <button
                    onClick={handlePurchase}
                    className="w-full bg-[#7B7EF4] text-white py-3 px-4 rounded-xl hover:bg-[#6B6EE4] focus:outline-none focus:ring-2 focus:ring-[#7B7EF4] focus:ring-offset-2 focus:ring-offset-black transition-colors font-medium"
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.checkout.processing}
                      </div>
                    ) : (
                      <>
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 3h16a1 1 0 011 1v1.18c0 .68-.37 1.3-.94 1.63l-8 4.5a1.98 1.98 0 01-1.95 0l-8-4.5A2 2 0 011 5.18V4a1 1 0 011-1zm0 4.8V20a1 1 0 001 1h14a1 1 0 001-1V7.8l-7.06 4a4 4 0 01-3.88 0L2 7.8z" />
                          </svg>
                          {t.checkout.purchaseButton}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;