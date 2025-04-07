# Medical and Health Assistant

## Overview
The Medical and Health Assistant is an AI-powered chatbot that provides medical guidance, health-related information, and basic diagnostic assistance. It helps users with general health inquiries, diet and nutrition recommendations, and tracking of various health metrics.

## Features
- AI-driven chatbot for medical assistance  
- Symptom-based health guidance  
- Diet and nutrition recommendations  
- Calorie, weight, and sleep tracking  
- Medical precautions and alerts  
- Integration with Supabase and PostgreSQL for secure data storage  
- User authentication (including Google Sign-In)  
- Health analysis with visual graph dashboards  
- Web-based UI for user interaction  

## Architecture

### High-Level Architecture
1. **Frontend** – Built with Next.js and TypeScript  
2. **Backend** – REST API and business logic using Node.js and Express.js  
3. **Database** – Supabase with PostgreSQL  
4. **Authentication** – Firebase Auth (including Google Sign-In)  
5. **AI/ML** – NLP powered by Transformer models such as Gemini  
6. **Deployment** – Managed through Supabase and Vercel  

### Workflow
1. **User Interaction**
   - Users interact through a web-based UI  
   - Authentication managed by Firebase Auth  

2. **Data Handling**
   - Health metrics, preferences, and other user data stored in Supabase (PostgreSQL)  
   - Backend APIs retrieve and update data securely  

3. **AI/ML Processing**
   - Transformer models analyze queries and deliver personalized medical advice  

4. **Visualization**
   - Frontend displays health data and analysis using interactive graphs  

## Technologies Used
- **Backend:** Node.js, Express.js  
- **Frontend:** Next.js with TypeScript  
- **Database:** Supabase (PostgreSQL)  
- **Authentication:** Firebase Auth (Google Sign-In)  
- **Machine Learning:** Transformer models for NLP  
- **Deployment:** Supabase, Vercel  

## Setup Instructions

### Clone the Repository
```sh
git clone https://github.com/Shiva0krishna/project_wellness.git
cd project_wellness

### Install Dependencies (Frontend)
```sh
npm install
```

### Set Up Environment Variables (Frontend)
Create a `.env` file and add the required keys (Supabase credentials, Firebase credentials, API keys, etc.).

### Run the Application (Frontend)
```sh
npm run dev
```

### Access the Application (Frontend)
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Install Dependencies (Backend)
```sh
cd project_wellness/backend
npm install
```

### Set Up Environment Variables (Backend)
Create a `.env` file and add the required keys (Supabase credentials, Firebase credentials, API keys, etc.).

### Run the Application (Backend)
```sh
npm run dev
```

### Access the Application (Backend)
Open [http://localhost:5000](http://localhost:5000) in your browser.

### Connect to Supabase
Ensure to connect to Supabase and update the details in the `.env` files.

## Future Enhancements
- Implementing Retrieval-Augmented Generation (RAG) to provide personalized assistance based on user data
- Integration with wearable health devices
- Voice-based interaction
- Advanced AI diagnostics

## Contribution
Feel free to contribute by submitting issues or pull requests.

## License
This project is licensed under the MIT License.
