import React, { useState } from 'react';
import OpenAI from 'openai';
import { WebsiteAnalyzer } from './websiteAnalyzer.jsx';
import { translations } from './translations';
import { getSystemPrompts } from './prompts';
import LoadingModal from './components/LoadingModal';
import OrderDetails from './components/OrderDetails';
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

function App() {
  const [companyName, setCompanyName] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [activity, setActivity] = useState('');
  const [language, setLanguage] = useState('es');
  const videoCount = 6;
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [videoScripts, setVideoScripts] = useState([]);
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

      // Automatically generate video scripts after analysis
      await getVideoScripts(analysis.companyName, analysis.activity);
    } catch (error) {
      console.error('Error analyzing website:', error);
      setError(t.errors.websiteAnalysis);
    } finally {
      setAnalyzing(false);
      hideModal();
    }
  };

  const getVideoScripts = async (name, desc) => {
    if (!name || !desc) {
      setError(t.errors.missingInfo);
      return;
    }

    setError('');
    setLoading(true);
    showModal(t.processing.generatingScripts(videoCount));

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: getSystemPrompts(language).scriptGeneration
        }, {
          role: "user",
          content: `Generate ${videoCount} video concepts for ${name}. Activity: ${desc}

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
      setError('');
    } catch (error) {
      console.error('Error getting video scripts:', error);
      setError(t.errors.scriptGeneration);
    } finally {
      setLoading(false);
      hideModal();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-montreal flex flex-col">
      <LoadingModal isOpen={modalOpen} message={modalMessage} language={language} />
      <BackgroundIcons />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none"></div>
      
      <div className="relative z-10 flex-1">
        <Header language={language} setLanguage={setLanguage} />
        
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
          {!videoScripts.length > 0 ? (
            <>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-8">
                Generador de Ideas para Vídeos
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 text-center mb-12 max-w-3xl mx-auto leading-relaxed">
                Genera títulos y resúmenes de vídeos a medida para tu empresa
              </p>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/10 mb-8">
                <div className="max-w-3xl mx-auto">
                  <div className="mb-6">
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
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                {/* Feature 1: Introduce tu Web */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="w-12 h-12 bg-[#7B7EF4]/20 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[#7B7EF4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium mb-2">{t.landing.features[0].title}</h3>
                  <p className="text-gray-400">{t.landing.features[0].description}</p>
                </div>

                {/* Feature 2: Propuestas de Vídeos */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="w-12 h-12 bg-[#7B7EF4]/20 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[#7B7EF4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium mb-2">{t.landing.features[1].title}</h3>
                  <p className="text-gray-400">{t.landing.features[1].description}</p>
                </div>

                {/* Feature 3: Oferta a Medida */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="w-12 h-12 bg-[#7B7EF4]/20 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[#7B7EF4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium mb-2">{t.landing.features[2].title}</h3>
                  <p className="text-gray-400">{t.landing.features[2].description}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-3 text-center">
                {t.videoScripts.title} {companyName}
              </h1>
              <p className="text-xl text-gray-300 text-center mb-8 max-w-3xl mx-auto leading-relaxed">
                {t.videoScripts.selectAndQuote}
              </p>
              
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
                                         : 'bg-white/10 text-white group-hover:bg-[#7B7EF4] hover:bg-[#7B7EF4]'
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

                      <div className="flex flex-col sm:flex-row justify-stretch gap-4 mt-8 w-full">
                        <button
                          onClick={() => {
                            setVideoScripts([]);
                            setSelectedVideos([]);
                          }}
                          className="flex-1 bg-[#5b9fd8] text-white px-4 py-2 rounded-lg hover:bg-[#4a8fc8] transition-colors font-medium flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          {t.videoScripts.backButton}
                        </button>

                        <button
                          onClick={() => getVideoScripts(companyName, activity)}
                          disabled={loading || videoScripts.length >= maxVideoIdeas}
                          className="flex-1 bg-[#7B7EF4] text-white px-4 py-2 rounded-lg hover:bg-[#6B6EE4] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

                        <button
                          onClick={() => setShowOrder(true)}
                          disabled={selectedVideos.length === 0}
                          className="flex-1 bg-[#b1c752] text-white px-4 py-2 rounded-lg hover:bg-[#a0b641] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                          {`${t.videoScripts.generateQuote} (${selectedVideos.length})`}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default App;