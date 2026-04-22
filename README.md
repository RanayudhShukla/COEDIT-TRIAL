# 🚀 CoEdit Studio
CoEdit Studio is a robust, multi-file, real-time cooperative IDE built with modern web architecture. It allows numerous developers to jump into isolated code rooms via WebSockets to write syntax-highlighted code, collaborate simultaneously using CRDTs, and text-chat seamlessly side-by-side!

## ✨ Key Features
- **Real-Time Collaboration**: Built on **[Yjs](https://yjs.dev/)** Conflict-free Replicated Data Types (CRDTs). Changes from dozens of users merge perfectly with mathematical guarantees, preventing overwritten lines even under high latency!
- **State-of-the-Art Code Editor**: Powered by **Microsoft's Monaco Editor** (the same engine under VS Code). Enjoy syntax highlighting, folding, and seamless cursor tracking!
- **Dynamic File Explorer**: Switch between active codebase files instantaneously. WebSockets automatically isolate broadcasts so you only receive cursor/chat payloads from users viewing the exact same file!
- **Live Markdown Preview**: Create `*.md` files and watch the Monaco layout slice securely into a split-pane, rendering your Markdown into gorgeous HTML natively as you type.
- **Embedded Developer Chat**: Message teammates right from the workspace. The STOMP Java backend manages real-time messaging pipelines alongside Editor CRDT states efficiently!

## 🛠 Tech Stack
| Tier | Technology | Function |
| --- | --- | --- |
| **Frontend** | React + Vite + Monaco | Lightning-fast static UI client |
| **Backend** | Java Spring Boot | Heavy-lifting REST API & Websocket Broker |
| **Storage** | H2 Database (JPA) | File storage & automated snapshots (5-sec interval) |
| **Real-time Sync** | STOMP WS + Yjs | Bidirectional Socket infrastructure & Conflict Muting |
| **Security** | JWT Tokens | Stateless session and Room Authorization security |
| **Cloud Hosting** | Vercel & Render | Cross-platform decoupled production hosting pipeline |

## 💻 Local Development

### 1: Running the Java Spring Boot Backend (Port 8080)
Ensure you have Maven installed (the repository ships with an Apache Maven local binary fallback!).
```bash
# Clean previously compiled assets and launch the backend Server
./apache-maven-3.9.6/bin/mvn clean spring-boot:run
```
*Your Spring Boot endpoint will light up at `http://localhost:8080`.*

### 2: Running the React Frontend (Port 5173)
Ensure you have `Node.js` installed.
```bash
# Navigate to the frontend directory
cd frontend/

# Install the necessary UI framework modules
npm install

# Instigate the local dev server
npm run dev
```

## ☁️ Cloud Deployment
CoEdit Studio is configured for 1-click deployments to global CDNs!
- **Backend (Render):** A custom `render.yaml` blueprint is positioned at the root repo. By connecting this repository to Render.com, it will autonomously compile a Java 21 `Dockerfile` container and expose a secure HTTPS backend hook.
- **Frontend (Vercel):** Connect your GitHub to Vercel and input 2 environment variables (`VITE_API_URL`, `VITE_WS_URL`) containing your Render endpoints!

## 🤝 Roadmap / Missing Goals
- Persist user presence objects (Cursors + Names) explicitly above characters in the code.
- Migrate from in-memory H2 DB to persistent remote PostgreSQL to maintain codefiles permanently after container sleep periods.
