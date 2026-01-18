import { useState, useEffect, useRef, useMemo } from "react"
import Dropzone from 'react-dropzone'
import { FFmpeg, type FileData } from "@ffmpeg/ffmpeg";
import processReplacement from "../utils/processReplacement";
import type { Options } from '../utils/interfaces';
import Settings from "./Settings";
import ConvertButton from "./ConvertButton";

const ReplaceFirstFrame = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [processedFile, setProcessedFile] = useState<FileData | null>(null);
    const [processedFileSize, setProcessedFileSize] = useState<number | null>(null);
    const [processedUrl, setProcessedUrl] = useState<string>('');
    const [ffmpegLoaded, setFfmpegLoaded] = useState<boolean>(false);
    const [options, setOptions] = useState<Options>({ scaleTo: 1, framerate: 10, videoLenght: 5, fileName: "totally-not-a-rickroll"});
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [showSlowMessage, setShowSlowMessage] = useState<boolean>(false);
    const [processingProgress, setProcessingProgress] = useState<number>(0);

    const ffmpegRef = useRef(new FFmpeg());
    useEffect(() => {
        const ffmpeg = ffmpegRef.current;
        const load = async () => {
            try {
                console.log("Starting FFmpeg load...");
                if (!ffmpeg.loaded) {
                    await ffmpeg.load();
                    console.log("ffmpeg.load() completed");
                    setFfmpegLoaded(true);
                    console.log("FFmpeg loaded successfully");
                }
            } catch (error) {
                console.error("FFmpeg loading failed:", error);
            }
        }
        load();
    }, [])

    const loadFileFromAssets = async (path: string, filename: string): Promise<File> => {
        const response = await fetch(path)
        const blob = await response.blob()
        return new File([blob], filename, { type: blob.type })
    }

    useEffect(() => {
        loadFileFromAssets('/rickroll.mp4', 'rickroll.mp4')
            .then(file => setVideoFile(file))
            .catch(console.error)
    }, [])

    const videoUrl = useMemo(() => videoFile ? URL.createObjectURL(videoFile) + "#t=1" : "", [videoFile]);
    const imageUrl = useMemo(() => imageFile ? URL.createObjectURL(imageFile) + "#t=1" : "", [imageFile]);

    const process = async () => {
        if (videoFile && imageFile) {
            setIsProcessing(true);
            setShowSlowMessage(false);
            setProcessingProgress(0);
            
            const slowMessageTimer = setTimeout(() => {
                setShowSlowMessage(true);
            }, 30000);
            
            const progressInterval = setInterval(() => {
                setProcessingProgress(prev => {
                    if (prev >= 95) return prev;
                    
                    const randomJump = Math.random() * 3.5 + 0.5;
                    
                    if (Math.random() < 0.15) {
                        return prev;
                    }
                    
                    const isBigJump = Math.random() < 0.08;
                    const increment = (isBigJump ? randomJump * 2.5 : randomJump) / (options.framerate * options.videoLenght * 0.03);
                    
                    return Math.min(prev + increment, 95);
                });
            }, Math.random() * 150 + 100);
            
            try {
                const data = await processReplacement(ffmpegRef.current, videoFile, imageFile, options) ?? '';
                setProcessedFile(data);
                URL.revokeObjectURL(processedUrl ?? "");
                const url = URL.createObjectURL(
                    new Blob([new Uint8Array(data as Uint8Array)], { type: "video/mp4" })
                );
                setProcessedUrl(url);
                setProcessedFileSize(data.length)
                setProcessingProgress(100);
            } catch (error) {
                console.error("Error processing:", error);
            } finally {
                clearTimeout(slowMessageTimer);
                clearInterval(progressInterval);
                setIsProcessing(false);
                setShowSlowMessage(false);
                setTimeout(() => setProcessingProgress(0), 500);
            }
        }
    }

    return (
        <div className="flex flex-col items-center">
            <div className="flex gap-12">
                <Dropzone onDrop={acceptedFiles => setVideoFile(acceptedFiles[0])}>
                    {({getRootProps, getInputProps, isDragActive, }) => (
                        <section>
                        <div {...getRootProps()} className={"px-12 py-8 border-slate-500 border rounded bg-slate-700/30 transition-all hover:bg-slate-700/40 cursor-pointer " + (isDragActive ? "bg-slate-700/80" : "")}>
                            <input {...getInputProps()} accept="video/*" />
                            <p>Drag 'n' drop original video here, or click to select</p>
                            {videoUrl ? (
                                <video src={videoUrl ?? ""} width={320} height={180} className="mt-6 mx-auto"></video>
                            ) : (<></>)}
                        </div>
                        </section>
                    )}
                </Dropzone>
                <div className="my-auto text-5xl">+</div>
                <Dropzone onDrop={acceptedFiles => setImageFile(acceptedFiles[0])}>
                    {({getRootProps, getInputProps, isDragActive}) => (
                        <section>
                        <div {...getRootProps()} className={"px-12 py-8 border-slate-500 border rounded bg-slate-700/30 transition-all hover:bg-slate-700/40 cursor-pointer " + (isDragActive ? "bg-slate-700/80" : "")}>
                            <input {...getInputProps()} accept="image/*" />
                            <p>Drag 'n' drop image you want to disguise video as here, or click to select</p>
                            {imageUrl ? (
                                <img src={imageUrl ?? ""} width={320} className="mt-6 mx-auto"></img>
                            ) : (<></>)}
                        </div>
                        </section>
                    )}
                </Dropzone>
            </div>
            <button className="px-24 h-12 w-full mt-8 relative overflow-hidden" onClick={process} disabled={!ffmpegLoaded || !videoFile || !imageFile || isProcessing}>
                {isProcessing && (
                    <div 
                        className="absolute inset-0 bg-blue-500/30 transition-all duration-200 ease-linear"
                        style={{ width: `${processingProgress}%` }}
                    />
                )}
                <span className="relative z-10">
                    {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                            Processing...
                        </span>
                    ) : (ffmpegLoaded ? 'Process' : 'Loading FFmpeg...')}
                </span>
            </button>
            {showSlowMessage && (
                <div className="mt-4 text-yellow-400 text-sm text-center">
                    FFmpeg is still running in your browser. This may take a while depending on quality settings and device performance.
                </div>
            )}
            <Settings options={options} setOptions={setOptions}></Settings>
            {processedFile && processedUrl ? (
                <div className="flex my-6 bg-slate-700/20 border border-slate-600/50 rounded-lg">
                    <div className="w-3/4">
                        <video src={processedUrl ?? ""} controls></video>
                    </div>
                    <div className="w-1/4 p-6 flex flex-col gap-4">
                        <a href={processedUrl} download={options.fileName + ".mp4"}><button className="w-full text-white">Download MP4 ({((processedFileSize ?? 0) / 1024 / 1024).toFixed(1)} MB)</button></a>
                        <ConvertButton extension="mov" ffmpeg={ffmpegRef.current} fileName={options.fileName} processedFile={processedFile}></ConvertButton>
                        <ConvertButton extension="mkv" ffmpeg={ffmpegRef.current} fileName={options.fileName} processedFile={processedFile}></ConvertButton>
                    </div>
                </div>
            ): ""}
        </div>
    )
}

export default ReplaceFirstFrame