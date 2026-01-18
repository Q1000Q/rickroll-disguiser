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
            try {
                const data = await processReplacement(ffmpegRef.current, videoFile, imageFile, options) ?? '';
                setProcessedFile(data);
                URL.revokeObjectURL(processedUrl ?? "");
                const url = URL.createObjectURL(
                    new Blob([new Uint8Array(data as Uint8Array)], { type: "video/mp4" })
                );
                setProcessedUrl(url);
                setProcessedFileSize(data.length)
            } catch (error) {
                console.error("Error processing:", error);
            } finally {
                setIsProcessing(false);
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
            <button className="px-24 h-12 w-full mt-8" onClick={process} disabled={!ffmpegLoaded || !videoFile || !imageFile || isProcessing}>
                {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </span>
                ) : (ffmpegLoaded ? 'Process' : 'Loading FFmpeg...')}
            </button>
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