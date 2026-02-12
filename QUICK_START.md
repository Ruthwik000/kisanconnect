# Quick Start Guide - Cotton Disease Detection

Get your ML-powered cotton disease detection system running in minutes!

## 🚀 Quick Setup (Windows)

### Step 1: Setup ML Backend (5 minutes)

```cmd
cd ml-backend
setup.bat
```

This installs all required Python packages.

### Step 2: Train the Model (30-60 minutes)

```cmd
train.bat
```

The model will train on your cotton disease images. Grab a coffee! ☕

### Step 3: Start the API (1 minute)

```cmd
start.bat
```

Your ML API is now running at http://localhost:8000

### Step 4: Start the Frontend (1 minute)

Open a new terminal in the project root:

```cmd
npm install
npm run dev
```

Your app is now running at http://localhost:5173

## ✅ Test It Out

1. Open http://localhost:5173 in your browser
2. Navigate to the Disease Detection page
3. Upload or capture a cotton leaf image
4. Get instant AI-powered disease diagnosis!

## 🐳 Docker Setup (Alternative)

If you prefer Docker:

```cmd
cd ml-backend
docker-compose up --build
```

Then start the frontend as usual.

## 📊 Expected Results

With the provided dataset:
- **Training Time:** 30-60 minutes (CPU), 10-20 minutes (GPU)
- **Model Accuracy:** 85-95% (depends on dataset quality)
- **Prediction Time:** <2 seconds per image
- **Supported Diseases:** Bacterial blight (critical, moderate, mild)

## 🔧 Troubleshooting

### "Python not found"
Install Python 3.9+ from https://www.python.org/

### "Model not found"
Run `train.bat` first to train the model

### "API connection failed"
Ensure the backend is running on port 8000

### "Low accuracy"
You need more training images (aim for 200+ per class)

## 📚 Full Documentation

For detailed information, see:
- [ML_BACKEND_GUIDE.md](ML_BACKEND_GUIDE.md) - Complete ML backend guide
- [ml-backend/README.md](ml-backend/README.md) - API documentation

## 🎯 Next Steps

1. ✅ Get it running (you're here!)
2. 📸 Collect more training images
3. 🎓 Retrain with larger dataset
4. 🚀 Deploy to production
5. 📱 Share with farmers!

## 💡 Tips for Better Accuracy

1. **More Data:** Collect 200+ images per disease type
2. **Quality Images:** Clear, well-lit photos of disease symptoms
3. **Balanced Dataset:** Similar number of images for each class
4. **Diverse Angles:** Multiple angles and lighting conditions
5. **Regular Retraining:** Update model as you collect more data

## 🆘 Need Help?

Check the console output for detailed error messages. Most issues are related to:
- Missing Python installation
- Not running training before starting API
- Port conflicts (8000 or 5173 already in use)

Happy farming! 🌱
