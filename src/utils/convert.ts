import type { FFmpeg, FileData } from "@ffmpeg/ffmpeg";

export const convertToMov = async (ffmpeg: FFmpeg, videoFile: FileData): Promise<FileData> => {
    ffmpeg.deleteFile?.("output.mov");

    const videoCopy = new Uint8Array(videoFile as Uint8Array);
    await ffmpeg.writeFile("input.mp4", videoCopy);

    await ffmpeg.exec([
        "-i", "input.mp4",
        "output.mov"
    ])
    const data = await ffmpeg.readFile("output.mov");

    return data;
}

export const convertToMkv = async (ffmpeg: FFmpeg, videoFile: FileData): Promise<FileData> => {
    ffmpeg.deleteFile?.("output.mov");

    const videoCopy = new Uint8Array(videoFile as Uint8Array);
    await ffmpeg.writeFile("input.mp4", videoCopy);

    await ffmpeg.exec([
        "-i", "input.mp4",
        "output.mkv"
    ])
    const data = await ffmpeg.readFile("output.mkv");
    
    return data;
}