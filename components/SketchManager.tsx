
import React, { useContext } from 'react';
import { AppContext } from '../App';
import { TrashIcon } from './icons';

const SketchManager: React.FC = () => {
    const context = useContext(AppContext);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || !context) return;

        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const url = e.target?.result as string;
                if(url) {
                    const img = new Image();
                    img.onload = () => {
                        const newSketch = {
                            id: `${Date.now()}-${Math.random()}`,
                            url,
                            width: img.width,
                            height: img.height,
                        };
                        context.addSketch(newSketch);
                    };
                    img.src = url;
                }
            };
            reader.readAsDataURL(file);
        }
    };

    if (!context) return null;
    const { sketches, deleteSketch } = context;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-2">Upload Sketches</h2>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">PNG files with transparent background</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" accept=".png" multiple onChange={handleFileUpload} />
                    </label>
                </div> 
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Existing Sketches ({sketches.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {sketches.map(sketch => (
                        <div key={sketch.id} className="relative group aspect-square bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                            <img src={sketch.url} alt={`Sketch ${sketch.id}`} className="object-contain w-full h-full p-2 invert" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => deleteSketch(sketch.id)} className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors">
                                    <TrashIcon className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SketchManager;
