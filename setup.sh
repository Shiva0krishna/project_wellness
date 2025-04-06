#!/bin/bash

echo "📦 Setting up frontend dependencies..."
npm install

echo ""
echo "📦 Setting up backend dependencies..."
cd backend
npm install
cd ..

echo ""
echo "✅ Project setup complete!"
echo "npm run dev to start the development server."
echo "cd backend && npm run dev to start the backend server."