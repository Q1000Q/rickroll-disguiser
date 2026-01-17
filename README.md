# Rickroll Disguiser

A browser-based video editor that replaces the first frame of any video with a custom image. Perfect for creating convincing rickroll disguises and other pranks!

## Features

- **Client-side processing** - Everything runs in your browser using FFmpeg.wasm
- **Custom first frame** - Replace the opening frame with any image
- **Flexible scaling** - Scale to video size or image size
- **Frame rate control** - Adjust output frame rate
- **Drag & drop** - Easy file upload interface
- **No server required** - All processing happens locally

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rickroll-disguiser.git
cd rickroll-disguiser

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` in your browser to use the app.

## How to Use

1. Upload a video file (the one you want to disguise)
2. Upload an image file (what people will see as the thumbnail/first frame)
3. Configure settings:
   - **Scale To**: Choose whether to scale to video or image dimensions
   - **Frame Rate**: Set the output video frame rate
4. Click "Process" and wait for the magic to happen
5. Download your disguised video!

## 🛠️ Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **FFmpeg.wasm** - Video processing in the browser
- **react-dropzone** - File upload handling

## Build

```bash
npm run build
```

The built files will be in the `dist` directory.

## License

This project is open source and available under the MIT License.