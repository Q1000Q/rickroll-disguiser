import { useEffect, useState } from "react";
import { convertToMkv, convertToMov } from "../utils/convert";
import type { FFmpeg, FileData } from "@ffmpeg/ffmpeg";

const ConvertButton = ({ffmpeg, processedFile, fileName, extension}: {ffmpeg: FFmpeg, processedFile: FileData, fileName: string, extension: string}) => {
    const [link, setLink] = useState<string | null>(null);
    const [isConverting, setIsConverting] = useState<boolean>(false);
    const [file, setFile] = useState<FileData | null>(null);

    const downloadFile = (data: FileData) => {
        const url = URL.createObjectURL(
            new Blob([new Uint8Array(data as Uint8Array)], { type: `video/${extension}` })
        );
        setLink(url);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName + "." + extension;
        a.click();
    }

    useEffect(() => {
        setFile(null);
        setLink(null);
    }, [processedFile])

    return (
        <>
            {link ? (
                <a href={link} download={fileName + `.${extension}`}><button className="w-full text-white">Download {extension.toUpperCase()} ({((file?.length ?? 0) / 1024 / 1024).toFixed(1)} MB)</button></a>
            ) : (
                <button className="w-full" onClick={async () => {
                    setIsConverting(true);
                    try {
                        if (extension == "mov") {
                            const data = await convertToMov(ffmpeg, processedFile);
                            setFile(data);
                            downloadFile(data);
                        } else if (extension == "mkv") {
                            const data = await convertToMkv(ffmpeg, processedFile);
                            setFile(data);
                            downloadFile(data);
                        }
                    } finally {
                        setIsConverting(false);
                    }
                }} disabled={isConverting}>
                    {isConverting ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Converting...
                        </span>
                    ) : `Convert to ${extension}`}
                </button>
            )}
        </>
    )
}

export default ConvertButton;