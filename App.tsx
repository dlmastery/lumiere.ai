import React, { useState, useEffect } from 'react';
import { generateVideoConcept, generateStoryScript, generateSceneImage, generateSceneVideo, generateSpeech, refineSceneText, refineProjectWide, validateScriptData } from './services/geminiService';
import { Scene, SceneStatus } from './types';
import { onAuthStateChanged, User } from './services/firebaseConfig';
import { initAnalytics, trackPageView, setUserId, trackSignIn, trackGenerateConcept, trackGenerateScript, trackGenerateImage, trackGenerateVideo, trackGenerateAudio } from './services/analyticsService';
import { AuthModal } from './components/AuthModal';
import { UserMenu } from './components/UserMenu';
import { HeroView } from './components/HeroView';
import { ConceptView } from './components/ConceptView';
import { PlanningView } from './components/PlanningView';
import { WorkspaceView } from './components/WorkspaceView';
import { Crown, Rocket } from 'lucide-react';

const VIDEO_TYPES = ['Commercial/Ad', 'Story/Narrative', 'Explainer', 'Documentary', 'Social Media Short', 'Educational', 'Product Showcase'];
const TARGET_AUDIENCES = ['General Public', 'Professionals', 'Kids', 'Students', 'Seniors', 'Gamers', 'Tech Enthusiasts'];
const IMAGE_STYLES = ['Cinematic', 'Photorealistic', '3D Animation', 'Flat Illustration', 'Anime', 'Manga', 'Line Drawing', 'Oil Painting', 'Cyberpunk', 'Vintage Film', 'Watercolor', 'Sketch'];
const VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

export default function App() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [projectContext, setProjectContext] = useState('');
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [concept, setConcept] = useState('');
  const [isGeneratingConcept, setIsGeneratingConcept] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<'hero' | 'concept' | 'planning' | 'workspace'>('hero');

  useEffect(() => {
    initAnalytics();
    const unsubscribe = onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (firebaseUser) {
        setUserId(firebaseUser.uid);
        trackSignIn();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      trackPageView(view);
    }
  }, [view, user]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showRawEditor, setShowRawEditor] = useState(false);
  const [rawScriptText, setRawScriptText] = useState('');
  const [rawEditorError, setRawEditorError] = useState<string | null>(null);
  
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [videoType, setVideoType] = useState('Story/Narrative');
  const [targetAudience, setTargetAudience] = useState('General Public');
  const [imageStyle, setImageStyle] = useState('Cinematic');
  const [videoLocation, setVideoLocation] = useState('Dynamic (Auto)');
  const [showCaptions, setShowCaptions] = useState(true);
  const [useCharacterConsistency, setUseCharacterConsistency] = useState(false);
  const [useKenBurnsEffect, setUseKenBurnsEffect] = useState(true);
  const [sceneCount, setSceneCount] = useState(8);

  const handleStartConcept = async () => {
    if (!topic.trim()) return;
    setIsGeneratingConcept(true);
    try {
      const generatedConcept = await generateVideoConcept(topic, videoType, targetAudience, imageStyle);
      setConcept(generatedConcept);
      setView('concept');
      trackGenerateConcept();
    } catch (error) {
      console.error(error);
      alert("Failed to generate concept summary.");
    } finally {
      setIsGeneratingConcept(false);
    }
  };

  const handleConfirmConcept = async () => {
    setIsGeneratingScript(true);
    try {
      const result = await generateStoryScript(concept, videoType, targetAudience, imageStyle, videoLocation, sceneCount, useCharacterConsistency);
      setProjectContext(result.projectContext);
      const initializedScenes: Scene[] = result.scenes.map(s => ({ ...s, status: SceneStatus.IDLE, voice: selectedVoice }));
      setScenes(initializedScenes);
      if (initializedScenes.length > 0) setCurrentSceneId(initializedScenes[0].id);
      setView('planning');
      trackGenerateScript();
    } catch (error: any) {
      console.error(error);
      alert("Script generation failed.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleOpenRawEditor = () => {
    const blueprint = {
      projectContext,
      scenes: scenes.map(s => ({
        description: s.description,
        narrative: s.narrative,
        lastFrameDescription: s.lastFrameDescription
      }))
    };
    setRawScriptText(JSON.stringify(blueprint, null, 2));
    setRawEditorError(null);
    setShowRawEditor(true);
  };

  const handleSaveRawScript = () => {
    try {
      const data = JSON.parse(rawScriptText);
      const validationError = validateScriptData(data);
      if (validationError) {
        setRawEditorError(validationError);
        return;
      }

      setProjectContext(data.projectContext);
      const updatedScenes: Scene[] = data.scenes.map((s: any, i: number) => ({
        id: crypto.randomUUID(),
        order: i,
        description: s.description,
        narrative: s.narrative,
        lastFrameDescription: s.lastFrameDescription,
        status: SceneStatus.IDLE,
        voice: selectedVoice,
        isThumbnail: i === 0
      }));
      setScenes(updatedScenes);
      if (updatedScenes.length > 0) setCurrentSceneId(updatedScenes[0].id);
      setShowRawEditor(false);
    } catch (e: any) {
      setRawEditorError("Invalid JSON format. Please check your syntax.");
    }
  };

  const handleUpdateScene = async (id: string | 'project', instruction: string) => {
    if (id === 'project') {
        const result = await refineProjectWide(scenes, instruction, projectContext);
        setScenes(result.scenes);
        setProjectContext(result.projectContext);
    } else {
        const scene = scenes.find(s => s.id === id);
        if (!scene) return;
        const updated = await refineSceneText(scene, instruction, projectContext);
        setScenes(prev => prev.map(s => s.id === id ? { ...updated, status: SceneStatus.IDLE, imageUrl: undefined, audioUrl: undefined, videoUrl: undefined } : s));
    }
  };

  const processScenesSequentially = async (scenesToProcess: Scene[]) => {
    for (const scene of scenesToProcess) {
      await handleGenerateImage(scene);
      await handleGenerateAudio(scene);
    }
  };

  const handleGenerateImage = async (scene: Scene, isLastFrame: boolean = false) => {
    updateSceneStatus(scene.id, SceneStatus.GENERATING_IMAGE);
    try {
      const prompt = isLastFrame ? (scene.lastFrameDescription || scene.description) : scene.description;
      const imageUrl = await generateSceneImage(prompt, imageStyle, projectContext);
      setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, [isLastFrame ? 'lastFrameImageUrl' : 'imageUrl']: imageUrl, status: s.audioUrl ? SceneStatus.READY : SceneStatus.IDLE } : s));
      trackGenerateImage();
    } catch (error) {
      updateSceneStatus(scene.id, SceneStatus.ERROR);
    }
  };

  const handleGenerateAudio = async (scene: Scene) => {
    updateSceneStatus(scene.id, SceneStatus.GENERATING_AUDIO);
    try {
      const audioUrl = await generateSpeech(scene.narrative, scene.voice || selectedVoice);
      setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, audioUrl, status: s.imageUrl ? SceneStatus.READY : SceneStatus.IDLE } : s));
      trackGenerateAudio();
    } catch (error) {
      updateSceneStatus(scene.id, SceneStatus.ERROR);
    }
  };

  const handleGenerateVideo = async (scene: Scene) => {
    updateSceneStatus(scene.id, SceneStatus.GENERATING_VIDEO);
    try {
      const videoUrl = await generateSceneVideo(scene.description, scene.imageUrl, scene.lastFrameImageUrl);
      setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, videoUrl, status: SceneStatus.READY } : s
      ));
      trackGenerateVideo();
    } catch (error: any) {
      updateSceneStatus(scene.id, SceneStatus.ERROR);
    }
  };

  const handleStartProduction = () => {
    setView('workspace');
    processScenesSequentially(scenes);
  };

  const handleTextChange = (id: string, field: keyof Scene, val: string) => setScenes(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  const updateSceneStatus = (id: string, status: SceneStatus) => setScenes(prev => prev.map(s => s.id === id ? { ...s, status } : s));

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthModal />;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans overflow-hidden relative">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute inset-0 bg-grid-white/[0.04]" />
         <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px]" />
         <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-gold-600/10 rounded-full blur-[100px]" />
      </div>

      <header className={`h-20 flex items-center px-8 justify-between shrink-0 z-40 transition-all duration-500 ${view === 'hero' ? 'bg-transparent py-6' : 'bg-slate-950/80 backdrop-blur-xl border-b border-white/5 py-0'}`}>
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('hero')}>
          <Crown className="text-gold-400 w-8 h-8" />
          <span className="text-2xl font-bold tracking-tight text-white">Lumiere<span className="text-gold-500">.ai</span></span>
        </div>
        <div className="flex items-center gap-6">
          {view !== 'hero' && (
            <>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${view === 'planning' ? 'bg-gold-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                  {view === 'concept' ? 'Creative Intent' : view === 'planning' ? 'Planning Phase' : 'Production Phase'}
                </span>
              </div>
              {view === 'planning' && (
                <button onClick={handleStartProduction} className="px-6 py-2 bg-white text-black rounded-full font-bold text-xs flex items-center gap-2 hover:bg-gold-500 hover:text-white transition-all shadow-lg"><Rocket size={14} /> Start Production</button>
              )}
            </>
          )}
          <UserMenu user={user} />
        </div>
      </header>

      {view === 'hero' && (
        <HeroView 
          topic={topic} setTopic={setTopic} isGeneratingScript={isGeneratingConcept} onGenerate={handleStartConcept}
          config={{ 
            selectedVoice, setSelectedVoice, videoType, setVideoType, targetAudience, setTargetAudience, 
            imageStyle, setImageStyle, useCharacterConsistency, setUseCharacterConsistency,
            useKenBurnsEffect, setUseKenBurnsEffect, sceneCount, setSceneCount
          }}
          options={{ voices: VOICES, videoTypes: VIDEO_TYPES, audiences: TARGET_AUDIENCES, styles: IMAGE_STYLES }}
        />
      )}

      {view === 'concept' && (
        <ConceptView 
          concept={concept}
          setConcept={setConcept}
          isGeneratingScript={isGeneratingScript}
          onConfirm={handleConfirmConcept}
          onBack={() => setView('hero')}
        />
      )}

      {view === 'planning' && (
        <PlanningView 
          scenes={scenes} projectContext={projectContext} currentSceneId={currentSceneId} setCurrentSceneId={setCurrentSceneId}
          onStartProduction={handleStartProduction} onTextChange={handleTextChange} onUpdateScene={handleUpdateScene}
          rawEditor={{
            show: showRawEditor, setShow: setShowRawEditor, text: rawScriptText, setText: setRawScriptText,
            error: rawEditorError, onSave: handleSaveRawScript, onOpen: handleOpenRawEditor
          }}
        />
      )}

      {view === 'workspace' && (
        <WorkspaceView 
          scenes={scenes} currentSceneId={currentSceneId} setCurrentSceneId={setCurrentSceneId} selectedVoice={selectedVoice} 
          setSelectedVoice={setSelectedVoice} onGenerateImage={handleGenerateImage} onGenerateVideo={handleGenerateVideo} 
          onGenerateAudio={handleGenerateAudio} onUpdateScene={handleUpdateScene} onTextChange={handleTextChange} 
          isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} showCaptions={showCaptions} projectContext={projectContext}
          useKenBurnsEffect={useKenBurnsEffect}
        />
      )}
    </div>
  );
}