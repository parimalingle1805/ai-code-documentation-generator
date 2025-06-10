# AI Code Documentation Generator 🤖📄

[![Build and Push Docker Images](https://github.com/parimalingle1805/ai-code-documentation-generator/actions/workflows/docker-build-push.yml/badge.svg)](https://github.com/parimalingle1805/ai-code-documentation-generator/actions)
A full-stack application that leverages the Google Gemini API to automatically generate professional documentation for any given code function. This project is fully containerized with Docker and features a complete CI/CD pipeline for automated builds and cloud deployments.

## 🚀 Live Demo

**Check out the live application here:** **[https://ai-doc-client.onrender.com](https://ai-doc-client.onrender.com)**
---

## 🎬 Application Demo

<img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDZ3MG1lNzJ3cjViZHptMnQ1b3FibnF0MmwyMmhxMmJkdGxvODB5bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lyPdcB5Gs0WPNTgEI1/giphy.gif" alt="AI Code Documentation Generator Demo">
---

## ✨ Key Features

* **🤖 AI-Powered Documentation:** Integrates with the Google Gemini API to generate clear and professional documentation for code snippets.
* **💻 Interactive Code Editor:** Features a rich, themed Monaco editor (the engine behind VS Code) for a professional coding experience.
* **🎨 Polished & Responsive UI:** A sleek dark-themed UI built with React that looks great on all devices.
* **🐳 Fully Containerized:** Both frontend and backend services are containerized using Docker for consistency, portability, and easy setup.
* **🚀 Automated CI/CD:** Every push to the `main` branch triggers a GitHub Actions workflow to automatically build and publish new Docker images to Docker Hub.

---

## 🛠️ Tech Stack

| Category           | Technologies & Concepts                                                               |
| ------------------ | ------------------------------------------------------------------------------------- |
| **Frontend** | `React`, `Vite`, `Monaco Editor` (VS Code's editor engine)                            |
| **Backend** | `Node.js`, `Express.js`, `REST API`                                                   |
| **AI Integration** | `Google Gemini API`                                                                   |
| **Containerization**| `Docker`, `Docker Compose`, `Multi-stage Dockerfiles`, `Nginx`                        |
| **CI/CD & DevOps** | `GitHub Actions`, `Docker Hub`                                                        |
| **Cloud Deployment**| `Render (PaaS)`                                                                       |

---

## ⚙️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* **Node.js** (v18 or later)
* **Docker** and **Docker Compose**
* A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Local Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/parimalingle1805/ai-code-documentation-generator.git](https://github.com/parimalingle1805/ai-code-documentation-generator.git)
    # Replace with your actual repo URL
    cd ai-code-documentation-generator
    ```
2.  **Create the Root Environment File:**
    Create a `.env` file in the project's root directory. This is used by Docker Compose.
    ```env
    # /.env
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```
3.  **Create the Backend Environment File:**
    Create a `.env` file inside the `backend` directory. This is used for running the backend locally without Docker.
    ```env
    # /backend/.env
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```
4.  **Build and Run with Docker Compose:**
    The simplest way to run the entire application stack is with Docker Compose.
    ```sh
    docker-compose up --build
    ```
5.  **Access the Application:**
    * The frontend will be available at `http://localhost:5173`
    * The backend API will be available at `http://localhost:5001`

---

## 🏗️ Deployment Pipeline

This project is configured for Continuous Integration and Continuous Deployment.

* **Trigger:** Every push to the `main` branch triggers the GitHub Actions workflow located in `.github/workflows/`.
* **Process:** The workflow builds new, optimized Docker images for the frontend and backend services.
* **Publish:** Upon a successful build, the images are pushed and tagged on Docker Hub.
* **Deploy:** The hosting provider, [Render](https://render.com/), is configured to watch for new images on Docker Hub and automatically deploys the latest version, ensuring the live application is always up-to-date.

---

## 🗺️ Future Improvements

This project has a solid foundation for future enhancements, including:
* [ ] Implementing a `localStorage`-based history panel to view past generations.
* [ ] Adding a language selector dropdown to improve syntax highlighting accuracy.
* [ ] Architecting and building a full user authentication system with JWTs and a MongoDB database to provide persistent, user-specific history.