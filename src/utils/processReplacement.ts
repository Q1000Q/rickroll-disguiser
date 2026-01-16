import { fetchFile } from "@ffmpeg/util";
import type { FFmpeg } from "@ffmpeg/ffmpeg";
import type { Options } from "../utils/interfaces";

const processReplacement = (ffmpeg: FFmpeg, videoFile: File, imageFile: File, options: Options, outputUrl?: string) => { 
    const process = async (videoFile: File, imageFile: File) => {
        // Deleting file from previous processing and revoking its URL
        ffmpeg.deleteFile?.("output.mp4");
        URL.revokeObjectURL(outputUrl ?? "");

        // Writing input photo and video into files
        await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));
        await ffmpeg.writeFile("image.png", await fetchFile(imageFile));

        if (options.scaleTo == 0) {
            // Get the probe frame from input video
            await ffmpeg.exec([
                "-i", "input.mp4",
                "-vf", "scale=iw:ih",
                "-frames:v", "1",
                "probe.png"
            ]);
        }
        // Get the dimensions of probe frame
        const probe = await ffmpeg.readFile(options.scaleTo ? "image.png" : "probe.png");
        const img = new Image();
        img.src = URL.createObjectURL(new Blob([new Uint8Array(probe as Uint8Array)]));
        await img.decode();
        const width  = Math.floor(img.width / 2) * 2;
        const height = Math.floor(img.height / 2) * 2;

        // Converting input image to video frame
        const imageInputProcess = [
            "-loop", "1",
            "-i", "image.png",
            "-i", "input.mp4",
            "-map", "0:v",
            "-map", "1:a?",
            "-vf", `scale=${width}:${height}:force_original_aspect_ratio=disable,setsar=1`,
            "-t", "0.04",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p"
        ];
        if (options.framerate) imageInputProcess.push("-r", `${options.framerate}`);
        imageInputProcess.push("frame.mp4");
        await ffmpeg.exec(imageInputProcess);

        // Converting input video into desired type
        const videoInputProcess = [
            "-i", "input.mp4",
            "-ss", "0.04",
        ];
        if (options.videoLenght) videoInputProcess.push("-t", `${options.videoLenght - 0.04}`);
        if (options.scaleTo == 1) videoInputProcess.push("-vf", `scale=${width}:${height}:force_original_aspect_ratio=disable,setsar=1`);
        if (options.framerate) videoInputProcess.push("-r", `${options.framerate}`);
        if (options.framerate || options.scaleTo == 1) {
            videoInputProcess.push("-c:v", "libx264", "-c:a", "copy");
        } else {
            videoInputProcess.push("-c", "copy");
        }
        videoInputProcess.push("rest.mp4");
        await ffmpeg.exec(videoInputProcess);

        // Saving photo frame and input video into list file
        await ffmpeg.writeFile(
            "list.txt",
            "file 'frame.mp4'\nfile 'rest.mp4'\n"
        );

        // Concatinating photo frame and input video
        const concatProcess = [
            "-f", "concat",
            "-safe", "0",
            "-i", "list.txt",
            "-c", "copy",
            "output.mp4"
        ];
        await ffmpeg.exec(concatProcess);

        // Creating URL from result video
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