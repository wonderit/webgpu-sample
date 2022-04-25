# webgpu-sample

## Setup
First install:
- Git 
- Node.js

```shell
# 🐑 Clone the repo
git clone https://github.com/wonderit/webgpu-sample

# 💿 go inside the folder
cd webgpu-sample

# 🔨 Start installing dependencies, building, and running live server at localhost:8080
npm start

# 🔨 When ts file is modified, run build while running live server:
npm run build 

```

## Project Layout
```shell
├─ 📂 node_modules/   # 👶 Dependencies
│  ├─ 📁 gl-matrix      # ➕ Linear Algebra
│  └─ 📁 ...            # 🕚 Other Dependencies (TypeScript, Webpack, etc.)
├─ 📂 src/            # 🌟 Source Files
│  ├─ 📄 index.html     #  📇 Main HTML file
│  └─ 📄 mm.ts        # 🔺 Matrix Multiplication
├─ 📄 .gitignore      # 👁️ Ignore certain files in git repo
├─ 📄 package.json    # 📦 Node Package File
└─ 📃readme.md        # 📖 Read Me!
```