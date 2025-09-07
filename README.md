# The Code Reviewer

A modern, AI-powered code review application I built using React, TypeScript, and Google's Gemini API. This tool provides intelligent code analysis, actionable feedback, and interactive follow-up conversations for multiple programming languages.

## 🚀 What I Built

I developed this application to demonstrate my skills in modern web development, AI integration, and security best practices. The app combines a sleek, responsive UI with powerful AI capabilities to provide comprehensive code reviews.

### Key Features I Implemented

- **🌐 Multi-language Support**: Built support for JavaScript, TypeScript, Python, Java, C#, Go, Rust, Ruby, HTML, CSS, and more
- **📁 Flexible Input Methods**: Implemented both file upload (drag & drop) and direct code pasting functionality
- **🤖 AI-Powered Analysis**: Integrated Google Gemini API for comprehensive code reviews covering bugs, performance, security, style, and best practices
- **💬 Interactive Chat**: Created a context-aware follow-up chat system for deeper code discussions
- **🔒 Secure History Management**: Implemented encrypted local storage with dynamic key generation for privacy
- **📱 Responsive Design**: Crafted a mobile-first, responsive interface that works seamlessly across devices
- **🛡️ Security-First Approach**: Built with input sanitization, file validation, and XSS protection

## 🏗️ Technical Architecture

I designed this application with modern best practices and scalability in mind:

- **Frontend**: React 19 with TypeScript for type safety and developer experience
- **Styling**: Tailwind CSS for rapid, consistent UI development
- **AI Integration**: Google Gemini API with custom service abstraction layer
- **State Management**: React hooks with custom state management patterns
- **Security**: Multi-layer security with input sanitization, file validation, and encrypted storage
- **Testing**: Comprehensive test suite using Vitest with mocked AI services
- **Performance**: Code splitting and lazy loading for optimal bundle size

## 🛠️ Development Setup

### Prerequisites
- Node.js (v18 or higher)
- Google Gemini API Key ([Get one here](https://ai.google.dev/))

### Installation Steps

1. **Clone my repository**:
   ```bash
   git clone https://github.com/Umer86/code-reviewer-app.git
   cd code-reviewer-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   Create `.env.local` in the root directory:
   ```env
   API_KEY=your_gemini_api_key_here
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to `http://localhost:5173`

## 🎯 How to Use

I designed the interface to be intuitive and user-friendly:

1. **📤 Upload Code**: Drag & drop files or use the file browser to select code files
2. **✏️ Paste Code**: Alternatively, paste code directly using the "Paste Code" tab
3. **🔧 Select AI Model**: Choose your preferred AI model (currently Gemini, with Claude and ChatGPT coming soon)
4. **🔍 Get Review**: Click "Review" to receive comprehensive AI-powered feedback
5. **💭 Follow-up Chat**: Ask questions about the review or request clarifications
6. **📚 Browse History**: Access previous reviews from the encrypted history sidebar

## 🧪 Testing

I implemented a comprehensive testing strategy:

```bash
# Run all tests
npm test

# Run security audit
npm run security:audit

# Run vulnerability scan
npm run security:snyk
```

## 🔐 Security Features I Implemented

Security was a top priority in my development process:

- **🔑 Dynamic Encryption**: History is encrypted with session-based dynamic keys
- **🛡️ Input Sanitization**: All user inputs are sanitized to prevent XSS attacks
- **📋 File Validation**: Strict file type, size, and content validation
- **🚫 Content Security Policy**: CSP headers to prevent malicious script injection
- **🔍 Malware Detection**: Pattern-based detection for potentially malicious content
- **⚡ Rate Limiting**: Built-in exponential backoff for API calls

## 🏆 Technical Highlights

What I'm particularly proud of in this implementation:

- **Clean Architecture**: Modular service layer with dependency injection patterns
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Performance**: Optimized bundle size with code splitting and lazy loading
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Responsive Design**: Mobile-first approach with seamless cross-device experience

## 📁 Project Structure

```
code-reviewer-app/
├── components/           # React components
│   ├── icons/           # Custom SVG icons
│   ├── CodeInput.tsx    # File upload & paste interface
│   ├── ReviewOutput.tsx # AI feedback display
│   └── HistoryPanel.tsx # Review history sidebar
├── services/            # Business logic layer
│   ├── ai/             # AI service implementations
│   ├── geminiService.ts # Google Gemini integration
│   └── historyService.ts # Encrypted storage management
├── utils/              # Utility functions
├── test/               # Test suites
└── types.ts            # TypeScript definitions
```

## 🚀 Future Enhancements

Features I plan to implement:

- **🤝 Multi-AI Support**: Complete Claude and ChatGPT integrations
- **👥 User Authentication**: Account-based history and preferences
- **📊 Advanced Analytics**: Code quality metrics and trends
- **🔄 Git Integration**: Direct repository analysis
- **📱 Mobile App**: React Native implementation
- **🎨 Themes**: Dark/light mode and custom themes

## 🤝 Contributing

I welcome contributions to improve this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google AI team for the excellent Gemini API
- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- The open-source community for inspiration and tools

---

**Built with ❤️ by [Umer Farooq](https://github.com/Umer86)**

*Showcasing modern web development, AI integration, and security best practices*