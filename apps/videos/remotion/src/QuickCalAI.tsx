import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Zap, Upload, CheckCircle, Calendar, Sparkles } from "lucide-react";
import { loadFont as loadPlusJakartaSans } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";

const { fontFamily } = loadPlusJakartaSans();
const { fontFamily: serifFamily } = loadInstrumentSerif();



const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame,
    fps,
    config: { damping: 100 },
  });

  const y = interpolate(frame, [0, 30], [20, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="bg-[#161616] flex items-center justify-center p-20 text-center" style={{ fontFamily }}>
      <div style={{ opacity, transform: `translateY(${y}px)` }}>
        <h1 className="text-8xl font-black tracking-tighter leading-tight text-[#efefef]">
          Stop typing calendar events{" "}
          <span className="text-[#c23326] italic font-normal" style={{ fontFamily: serifFamily }}>
            manually.
          </span>
        </h1>
      </div>
    </AbsoluteFill>
  );
};

const UploadScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, config: { stiffness: 100 } });
  
  return (
    <AbsoluteFill className="bg-[#161616] flex flex-col items-center justify-center p-12" style={{ fontFamily }}>
      <div style={{ opacity: entrance, transform: `scale(${interpolate(entrance, [0, 1], [0.9, 1])})` }} className="w-full">
        <h2 className="text-6xl font-bold text-center mb-16 text-[#efefef]">Upload any image or PDF.</h2>
        
        <div className="bg-[#212121] border-4 border-dashed border-[#333] rounded-[40px] p-12 flex flex-col gap-10">
          <div className="flex items-center gap-4">
            <Sparkles className="text-[#efefef] w-10 h-10" />
            <span className="text-3xl font-semibold text-[#efefef]">Create Calendar Events</span>
          </div>
          <div className="border-4 border-dashed border-[#333] rounded-3xl p-20 text-center flex flex-col items-center gap-6">
            <Upload className="text-[#888] w-16 h-16" />
            <p className="text-4xl font-medium text-[#efefef]">Drop your document here</p>
            <p className="text-2xl text-[#888]">Supports JPEG, PNG, WebP, and PDF</p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const MagicScene: React.FC = () => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [30, 120], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const count = Math.floor(interpolate(frame, [40, 110], [0, 12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  return (
    <AbsoluteFill className="bg-[#161616] flex flex-col items-center justify-center p-12" style={{ fontFamily }}>
      <h2 className="text-6xl font-bold text-center mb-24 text-[#efefef]">AI extracts details instantly.</h2>
      
      <div className="w-full bg-[#c23326] text-white p-10 rounded-3xl flex items-center justify-center gap-6 mb-10 shadow-2xl">
        <Zap className="w-10 h-10 animate-pulse" />
        <span className="text-3xl font-bold">Processing document with AI...</span>
      </div>

      <div className="w-full h-4 bg-[#333] rounded-full overflow-hidden mb-20">
        <div className="h-full bg-[#c23326]" style={{ width: `${progress}%` }} />
      </div>

      <div className="w-full bg-[#212121] p-12 rounded-[32px] text-center border-2 border-[#333]">
        <div className="text-9xl font-black text-[#c23326]">{count}</div>
        <div className="text-2xl font-medium text-[#888] mt-2">Events found</div>
      </div>
    </AbsoluteFill>
  );
};

const ResultScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill className="bg-[#161616] flex flex-col items-center justify-center p-12" style={{ fontFamily }}>
      <h2 className="text-6xl font-bold text-center mb-16 text-[#efefef]">Download your .ics and you're done.</h2>
      
      <div style={{ transform: `scale(${entrance})`, opacity: entrance }} className="w-full bg-[#212121] p-16 rounded-[40px] border-2 border-[#c2332622] text-center flex flex-col items-center gap-8 shadow-2xl">
        <CheckCircle className="text-[#c23326] w-24 h-24" />
        <span className="text-5xl font-extrabold text-[#efefef]">Processing Complete!</span>
        <p className="text-3xl text-[#888]">Successfully extracted 12 calendar events!</p>
        
        <div className="flex flex-col gap-6 w-full mt-10">
          <div className="bg-[#c23326] text-white p-8 rounded-2xl text-3xl font-bold">View Extracted Events</div>
          <div className="border-2 border-[#333] text-[#efefef] p-8 rounded-2xl text-3xl font-bold">Download .ics</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoEntrance = spring({ frame, fps, delay: 10 });
  const textEntrance = spring({ frame, fps, delay: 30 });
  const urlEntrance = spring({ frame, fps, delay: 50, config: { stiffness: 200 } });

  return (
    <AbsoluteFill className="bg-[#161616] flex flex-col items-center justify-center p-12 text-center" style={{ fontFamily }}>
      <div style={{ opacity: logoEntrance, transform: `scale(${logoEntrance})` }} className="flex flex-col items-center gap-6 mb-24">
        <Calendar className="text-[#c23326] w-40 h-40" />
        <h1 className="text-8xl font-black tracking-tighter text-[#efefef]">QuickCalAI</h1>
      </div>

      <div style={{ opacity: textEntrance, transform: `translateY(${interpolate(textEntrance, [0, 1], [20, 0])}px)` }} className="mb-24">
        <h2 className="text-5xl font-bold text-[#efefef] mb-6">Organize your life in seconds.</h2>
        <p className="text-3xl text-[#888]">Start your <span className="text-[#c23326] italic" style={{ fontFamily: serifFamily }}>Free Trial</span> today.</p>
      </div>

      <div style={{ opacity: urlEntrance, transform: `scale(${urlEntrance})` }} className="bg-[#c23326] text-white px-20 py-10 rounded-full text-5xl font-black shadow-2xl">
        QuickCalAI.com
      </div>
    </AbsoluteFill>
  );
};

export const QuickCalAIPromo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={75}>
        <Hook />
      </Sequence>
      <Sequence from={75} durationInFrames={105}>
        <UploadScene />
      </Sequence>
      <Sequence from={180} durationInFrames={120}>
        <MagicScene />
      </Sequence>
      <Sequence from={300} durationInFrames={105}>
        <ResultScene />
      </Sequence>
      <Sequence from={405} durationInFrames={135}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
