# Code Companion: AI-Powered Debugging Assistant

Code Companion is a modern web application that uses AI to help developers debug, analyze, and improve their code. With features like real-time bug detection, code suggestions, and an AI chatbot assistant, it streamlines the debugging process and helps developers write better code.

![Code Companion](https://placeholder-for-screenshot.com/code-companion-screenshot.png)

## Features

- **Multimodal Code Input**

  - Drag & Drop support for files and folders
  - GitHub repository URL integration
  - Multiple programming language support

- **AI-Powered Analysis**

  - Automatic bug detection and suggestions
  - Real-time code improvements
  - Severity-based issue categorization

- **Interactive Editor**

  - Monaco Editor (VS Code-like) integration
  - Theme switching (light/dark)
  - Line number toggling
  - Code formatting
  - Copy to clipboard functionality
  - Accept/Reject/Modify suggestions inline
  - One-click "Fix All" option

- **Intelligent Chat Assistant**
  - Contextual coding help
  - Syntax highlighted code snippets in responses
  - Persistent conversation history

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/code-companion.git
cd code-companion
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables
   Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_ai_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
```

4. Start the development server

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Framer Motion
- **Editor**: Monaco Editor
- **AI Integration**: Langchain, Google Generative AI, OpenAI
- **File Handling**: JSZip, react-dropzone

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the **Code Companion Personal Project License** - see the [LICENSE](LICENSE) file for details. This custom license:

- Permits display in portfolios, resumes, and job applications
- Acknowledges the use of third-party open-source components
- Covers usage of AI services and APIs
- Clarifies attribution requirements
- Restricts redistribution without permission
