import { useState, useEffect, useRef, useMemo } from "react"
import Dropzone from 'react-dropzone'
import { FFmpeg, type FileData } from "@ffmpeg/ffmpeg";
import { toBlobURL } from '@ffmpeg/util';
import processReplacement from "../utils/processReplacement";
import type { Options } from '../utils/interfaces';
import Settings from "./Settings";
import { convertToMov, convertToMkv } from "../utils/convert";

const ReplaceFirstFrame = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [processedFile, setProcessedFile] = useState<FileData | null>(null);
    const [processedFileSize, setProcessedFileSize] = useState<number | null>(null);
    const [processedUrl, setProcessedUrl] = useState<string>('');
    const [ffmpegLoaded, setFfmpegLoaded] = useState<boolean>(false);
    const [options, setOptions] = useState<Options>({ scaleTo: 1, framerate: 30, videoLenght: 10, fileName: "totally-not-a-rickroll"});
    const [movFile, setMovFile] = useState<FileData | null>(null);
    const [movLink, setMovLink] = useState<string | null>(null);
    const [mkvFile, setMkvFile] = useState<FileData | null>(null);
    const [mkvLink, setMkvLink] = useState<string | null>(null);

    const ffmpegRef = useRef(new FFmpeg());
    useEffect(() => {
        const ffmpeg = ffmpegRef.current;
        const load = async () => {
            try {
                console.log("Starting FFmpeg load...");
                if (!ffmpeg.loaded) {
                    const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.6/dist/esm'
                    console.log("Fetching FFmpeg core files from:", baseURL);
                    
                    await ffmpeg.load({
                        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
                        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
                    });
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
            }
        }
    }

    const downloadFile = (data: FileData, extension: string, setLink: React.Dispatch<React.SetStateAction<string | null>>) => {
        const url = URL.createObjectURL(
            new Blob([new Uint8Array(data as Uint8Array)], { type: `video/${extension.slice(1)}` })
        );
        setLink(url);

        const a = document.createElement('a');
        a.href = url;
        a.download = options.fileName + extension;
        a.click();
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
            <button className="px-24 h-12 w-full mt-8" onClick={process} disabled={!ffmpegLoaded || !videoFile || !imageFile}>
                {ffmpegLoaded ? 'Process' : 'Loading FFmpeg...'}
            </button>
            <Settings options={options} setOptions={setOptions}></Settings>
            {processedFile && processedUrl ? (
                <div className="flex my-6 bg-slate-700/20 border border-slate-600/50 rounded-lg">
                    <div className="w-3/4">
                        <video src={processedUrl ?? ""} controls></video>
                    </div>
                    <div className="w-1/4 p-6 flex flex-col gap-4">
                        <a href={processedUrl} download={options.fileName + ".mp4"}><button className="w-full text-white">Download MP4 ({((processedFileSize ?? 0) / 1024 / 1024).toFixed(1)} MB)</button></a>
                        {movLink ? (<a href={movLink} download={options.fileName + ".mov"}><button className="w-full text-white">Download MOV ({((movFile?.length ?? 0) / 1024 / 1024).toFixed(1)} MB)</button></a>) : (<button className="w-full" onClick={async () => {const file = await convertToMov(ffmpegRef.current, processedFile); setMovFile(file); downloadFile(file, ".mov", setMovLink)}}>Convert to MOV</button>)}
                        {mkvLink ? (<a href={mkvLink} download={options.fileName + ".mkv"}><button className="w-full text-white">Download MKV ({((mkvFile?.length ?? 0) / 1024 / 1024).toFixed(1)} MB)</button></a>) : (<button className="w-full" onClick={async () => {const file = await convertToMkv(ffmpegRef.current, processedFile); setMkvFile(file); downloadFile(file, ".mkv", setMkvLink)}}>Convert to MKV</button>)}
                    </div>
                </div>
            ): ""}
        </div>
    )
}

export default ReplaceFirstFrame