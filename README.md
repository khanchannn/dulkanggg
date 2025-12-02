# 🛡️ Dulkanggg's Corner

> "Welcome to my Corner. Where I share my insights on Cybersecurity, IT, and everything in between."

![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)
![Build](https://img.shields.io/badge/build-passing-success?style=flat-square)
![Tech](https://img.shields.io/badge/stack-Node.js%20|%20Markdown-blueviolet?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

## 🌐 Introduction

Welcome to the source code of **Dulkanggg's Corner** - my personal cybersecurity portfolio and blog.

Unlike typical blogs built on WordPress or Wix, this project is a **custom-built Static Site Generator (SSG)** engineered with Node.js. It compiles raw **Markdown** files into a lightweight, high-performance static website, hosted directly on GitHub Pages.

🚀 **Live Demo:** [https://khanchannn.github.io/dulkanggg/](https://khanchannn.github.io/dulkanggg/)

## 👨‍💻 About Me

I am **Khang** (a.k.a Dulkanggg).

* 🚩 **Role:** Cybersecurity Fresher & Aspiring IT Security Officer.
* 🕵️ **Focus:** DevOps, Operating System, and Blue Team.
* 🛠️ **Hobbies:** Building automating script, self-hosted solutions, and analyzing malware.

## ⚙️ Tech Stack

This project uses a "Keep It Simple" architecture:

* **Core Engine:** Node.js (Custom build scripts).
* **Content Management:** Markdown (`.md`) with Front Matter.
* **Templating:** Custom HTML/JS injection.
* **Styling:** CSS variables (Dark Mode / VS Code Theme inspired).
* **Highlighting:** Syntax highlighting for code blocks (Bash, JS, Python...).
* **Deployment:** Automated via `gh-pages`.

## 📂 Project Structure

```bash
dulkanggg/
├── posts/          # 📝 Where I write my blogs (Markdown files)
├── public/         # 🖼️ Static assets (images, css, logo)
├── views/          # 📐 HTML Layouts & Templates
├── build.js        # ⚙️ The Engine: Compiles MD -> HTML
├── server.js       # 🖥️ Local Dev Server
├── dist/           # 📦 Production build (Auto-generated)
└── package.json    # 📦 Project metadata & scripts
