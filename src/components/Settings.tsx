import type { Options } from "../utils/interfaces";

const Settings = ({ options, setOptions }: { options: Options, setOptions: React.Dispatch<React.SetStateAction<Options>> }) => {

    const setOption = <K extends keyof Options>(key: K, value: Options[K]) => {
        setOptions((prev) => ({...prev, [key]: value}))
    }

    return (
        <div className="mt-8 w-full">
            <div className="flex gap-6 justify-center items-end bg-slate-700/20 rounded-lg p-6 border border-slate-600/50">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Scale To:</label>
                    <select 
                        value={options.scaleTo} 
                        onChange={e => setOption("scaleTo", parseInt(e.currentTarget.value))}
                        className="px-4 h-10 bg-slate-700 border border-slate-500 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer transition-all"
                    >
                        <option value="0">Video</option>
                        <option value="1">Image</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Framerate (fps):</label>
                    <input 
                        type="number" 
                        min={5} 
                        max={60} 
                        value={options.framerate} 
                        onChange={e => setOption("framerate", parseInt(e.currentTarget.value))}
                        className="px-4 h-10 w-24 bg-slate-700 border border-slate-500 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Video Length (s):</label>
                    <input 
                        type="number" 
                        min={1} 
                        value={options.videoLenght} 
                        onChange={e => setOption("videoLenght", parseInt(e.currentTarget.value))}
                        className="px-4 h-10 w-24 bg-slate-700 border border-slate-500 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                    />
                </div>
            </div>
        </div>
    )
}

export default Settings;