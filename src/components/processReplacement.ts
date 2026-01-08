import { fetchFile } from "@ffmpeg/util";
import type { FFmpeg } from "@ffmpeg/ffmpeg";

const processReplacement = (ffmpeg: FFmpeg, outputUrl: string, videoFile: File, imageFile: File) => { 
    const process = async (videoFile: File, imageFile: File) => {
        ffmpeg.deleteFile?.("output.mp4");
        URL.revokeObjectURL(outputUrl ?? "");

        await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));
        await ffmpeg.writeFile("image.png", await fetchFile(imageFile));

        await ffmpeg.exec([
            "-loop", "1",
            "-i", "image.png",
            "-i", "input.mp4",
            "-map", "0:v",
            "-map", "1:a?",
            "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
            "-t", "0.04",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "frame.mp4"
        ]);

        await ffmpeg.exec([
            "-i", "input.mp4",
            "-ss", "0.04",
            "-c", "copy",
            "rest.mp4"
        ]);

        await ffmpeg.writeFile(
            "list.txt",
            "file 'frame.mp4'\nfile 'rest.mp4'\n"
        );

        await ffmpeg.exec([
            "-f", "concat",
            "-safe", "0",
            "-i", "list.txt",
            "-c", "copy",
            "output.mp4"
        ]);

        const data = await ffmpeg.readFile("output.mp4");
        const url = URL.createObjectURL(
            new Blob([new Uint8Array(data as Uint8Array)], { type: "video/mp4" })
        );

        return url;
    }

    if (videoFile && imageFile) {
        return process(videoFile, imageFile);
    }
}

export default processReplacement;