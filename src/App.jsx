import React, { useState } from 'react';
import OpenAI from 'openai';
import { WebsiteAnalyzer } from './websiteAnalyzer';
import { translations } from './translations';
import { getSystemPrompts } from './prompts';
import LoadingModal from './components/LoadingModal';
import OrderDetails from './components/OrderDetails';
import ShoppingCart from './components/ShoppingCart';
import BackgroundIcons from './components/BackgroundIcons';
import Header from './components/Header';
import Footer from './components/Footer';
import { config } from './config';
import { VideoIcon, LanguageIcon, ContentIcon } from './components/FeatureIcons';
import * as Tooltip from '@radix-ui/react-tooltip';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  dangerouslyAllowBrowser: true
});

const getFeatureIcon = (iconName) => {
  const icons = {
    video: VideoIcon,
    language: LanguageIcon,
    content: ContentIcon
  };
  const Icon = icons[iconName];
  return Icon ? <Icon /> : null;
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#7B7EF4] transition-colors">
    <div className="w-12 h-12 bg-[#7B7EF4]/20 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-400 text-lg leading-relaxed">{description}</p>
  </div>
);

function App() {
  const [showForm, setShowForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [activity, setActivity] = useState('');
  const [language, setLanguage] = useState('es');
  const videoCount = 6;
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [videoScripts, setVideoScripts] = useState([]);
  const [step, setStep] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [showOrder, setShowOrder] = useState(false);
  const maxVideoIdeas = 30;

  const t = translations[language];

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
      const analyzer = new WebsiteAnalyzer(language);
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

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: getSystemPrompts(language).scriptGeneration
        }, {
          role: "user",
          content: `Generate ${videoCount} video concepts for ${companyName}. Activity: ${activity}

Format each video as a JSON object with:
- title: Catchy SEO-friendly title in ${language}
- description: Clear 2-3 sentence description in ${language}
- duration: Length in seconds (20-60)
- type: Either 'direct' (about company) or 'indirect' (industry content)

Return array of exactly ${videoCount} objects. Mix direct/indirect focus.`
        }],
        temperature: 0.8,
        response_format: { type: "json_object" }
      });

      let scripts;
      try {
        const parsedResponse = JSON.parse(response.choices[0].message.content);
        if (!parsedResponse.videos || !Array.isArray(parsedResponse.videos)) {
          throw new Error('Invalid response format: missing videos array');
        }
        
        scripts = parsedResponse.videos
          .slice(0, videoCount)
          .map((script, index) => ({
            id: `video-${Date.now()}-${index}`,
            title: script.title?.trim(),
            description: script.description?.trim(),
            duration: Math.min(Math.max(script.duration || 30, 20), 60),
            type: ['direct', 'indirect'].includes(script.type) ? script.type : 'direct'
          }))
          .filter(script => script.title && script.description);

        if (scripts.length !== videoCount) {
          throw new Error(`Expected ${videoCount} videos but got ${scripts.length}`);
        }
      } catch (e) {
        console.error('Error parsing scripts:', e);
        throw new Error(t.errors.invalidResponse);
      }

      if (!scripts || scripts.length === 0) {
        throw new Error(t.errors.noVideosGenerated);
      }

      setVideoScripts(prevScripts => {
        const newScripts = [...prevScripts, ...scripts];
        return newScripts.slice(0, maxVideoIdeas);
      });
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
    if (step === 2) {
      setStep(1);
      setVideoScripts([]);
      setSelectedVideos([]);
    } else {
      setShowForm(false);
    }
    setError('');
  };

  if (!showForm) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden font-montreal flex flex-col">
        <BackgroundIcons />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none"></div>
        
        <div className="relative z-10 flex-1 container mx-auto">
          <Header language={language} setLanguage={setLanguage} />
          
          {/* Hero Section */}
          <div className="px-4 py-12 md:py-20">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                {t.landing.hero.title}
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                {t.landing.hero.subtitle}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#7B7EF4] text-white px-8 py-4 rounded-xl hover:bg-[#6B6EE4] focus:outline-none focus:ring-2 focus:ring-[#7B7EF4] focus:ring-offset-2 focus:ring-offset-black transition-colors text-lg font-bold"
              >
                {t.landing.hero.cta}
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="px-4 py-12">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {t.landing.features.map((feature, index) => (
                  <FeatureCard
                    key={index}
                    icon={getFeatureIcon(feature.icon)}
                    title={feature.title}
                    description={feature.description}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-montreal flex flex-col">
      <LoadingModal isOpen={modalOpen} message={modalMessage} />
      <BackgroundIcons />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none"></div>
      
      <div className="relative z-10 flex-1">
        <Header showBackButton={true} onBack={handleBack} language={language} setLanguage={setLanguage} />
        
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-4">
            {t.landing.hero.title}
          </h1>
          {step === 1 ? (
            <h2 className="text-xl sm:text-2xl text-gray-300 text-center mb-8">
              {t.formSubtitle}
            </h2>
          ) : (
            <h2 className="text-xl sm:text-2xl text-gray-300 text-center mb-8">
              {`${t.videoScripts.subtitle} ${companyName}`}
            </h2>
          )}
          
          <div className="max-w-5xl mx-auto">
            {step === 1 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/10">
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                  <div className="mb-8">
                    <div className="mb-4">
                      <label className="block text-lg font-medium text-gray-300 mb-3">
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
                      <label className="block text-lg font-medium text-gray-300 mb-3">
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
                      <label className="block text-lg font-medium text-gray-300 mb-3">
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

            {step === 2 && videoScripts.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/10">
                <div className="max-w-5xl mx-auto">
                  {showOrder ? (
                    <OrderDetails
                      selectedVideos={selectedVideos}
                      onBack={() => setShowOrder(false)}
                      language={language}
                    />
                  ) : (
                    <>
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {videoScripts.map((script, index) => (
                      <div
                        key={index}
                        className={`group rounded-xl p-4 sm:p-6 border flex flex-col h-full transition-all ${
                          selectedVideos.some(v => v.id === script.id)
                            ? 'bg-white/10 border-[#7B7EF4]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#7B7EF4]'
                        }`}
                      >
                        <div className="flex-1">
                          <h3 className={`text-lg sm:text-xl font-medium mb-3 transition-colors ${
                            selectedVideos.some(v => v.id === script.id) ? 'text-[#7B7EF4]' : 'group-hover:text-[#7B7EF4]'
                          }`}>{script.title}</h3>
                          <p className="text-gray-400">{script.description}</p>
                        </div>
                        <div className="flex justify-between items-center text-gray-400 mt-4 pt-4 border-t border-white/10">
                          <p>
                          <span className="text-[#7B7EF4]">{script.duration}s</span> • 
                          <span className="ml-2">{script.type === 'direct' ? t.videoTypes.direct : t.videoTypes.indirect}</span>
                          </p>
                          <Tooltip.Provider>
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <button
                                  onClick={() => {
                                    const isSelected = selectedVideos.some(v => v.id === script.id);
                                    setSelectedVideos(isSelected 
                                      ? selectedVideos.filter(v => v.id !== script.id)
                                      : [...selectedVideos, script]
                                    );
                                  }}
                                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                                    selectedVideos.some(v => v.id === script.id)
                                      ? 'bg-[#7B7EF4] text-white'
                                      : 'bg-white/10 text-white hover:bg-[#7B7EF4]/20'
                                  }`}
                                >
                                  {selectedVideos.some(v => v.id === script.id) ? t.videoScripts.selected : t.videoScripts.buy}
                                </button>
                              </Tooltip.Trigger>
                              <Tooltip.Portal>
                                <Tooltip.Content 
                                  className="relative z-50 bg-black/90 text-white px-3 py-2 rounded-lg text-sm"
                                  sideOffset={5}>
                                  {selectedVideos.some(v => v.id === script.id) ? t.videoScripts.selectedTooltip : t.videoScripts.buyTooltip}
                                  <Tooltip.Arrow className="fill-black/90" />
                                </Tooltip.Content>
                              </Tooltip.Portal>
                            </Tooltip.Root>
                          </Tooltip.Provider>
                        </div>
                      </div>
                    ))}
                  </div>
                  {videoScripts.length < maxVideoIdeas && (
                    <div className="flex justify-center my-8">
                      <button
                        onClick={() => {
                          getVideoScripts();
                        }}
                        disabled={loading}
                        className="bg-[#7B7EF4] text-white py-3 px-8 rounded-xl hover:bg-[#6B6EE4] focus:outline-none focus:ring-2 focus:ring-[#7B7EF4] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 transition-colors font-medium flex items-center gap-3"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t.videoScripts.generatingMore}
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            {t.videoScripts.generateMore}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  {selectedVideos.length > 0 && (
                    <ShoppingCart
                      selectedVideos={selectedVideos}
                      onRemoveVideo={(videoId) => setSelectedVideos(selectedVideos.filter(v => v.id !== videoId))}
                      onOrder={() => setShowOrder(true)}
                      language={language}
                      onBack={handleBack}
                    />
                  )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default App