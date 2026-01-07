import { useState, useEffect } from "react"
import Dropzone from 'react-dropzone'

const ReplaceFirstFrame = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)

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

    const videoUrl = videoFile ? URL.createObjectURL(videoFile) + "#t=1" : "";
    const imageUrl = imageFile ? URL.createObjectURL(imageFile) + "#t=1" : "";

    return (
        <div>
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
            <button className="px-24 h-12 w-full mt-8">Process</button>
        </div>
    )
}

export default ReplaceFirstFrame