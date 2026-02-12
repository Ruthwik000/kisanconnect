# ML Backend Setup and Integration Guide

This guide will help you set up the ML backend for cotton disease detection and integrate it with your frontend.

## Prerequisites

- Python 3.9 or higher
- At least 4GB RAM (8GB recommended)
- GPU (optional, but recommended for faster training)

## Step 1: Setup ML Backend

### Windows

1. Open Command Prompt in the project root directory

2. Navigate to ml-backend:
```cmd
cd ml-backend
```

3. Run the setup script:
```cmd
setup.bat
```

This will:
- Create a virtual environment
- Install all required dependencies (TensorFlow, FastAPI, etc.)

### Manual Setup (Linux/Mac)

```bash
cd ml-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Step 2: Prepare Training Data

Your training data is already organized in `ml-backend/Cotton-Original/`:

```
Cotton-Original/
├── bacterial blight/
│   ├── critical/    (19 images)
│   ├── moderate/    (50 images)
│   └── mild/        (50 images)
└── healthy/         (if available)
```

**Note:** For best results, you should have:
- At least 100 images per class
- Balanced dataset (similar number of images in each category)
- High-quality images with clear disease symptoms

## Step 3: Train the Model

### Windows

```cmd
train.bat
```

### Manual Training

```bash
cd ml-backend
python train_model.py
```

**Training Process:**
- Phase 1: Trains with frozen EfficientNetB3 base (15 epochs)
- Phase 2: Fine-tunes unfrozen layers (up to 50 epochs with early stopping)
- Expected time: 30-60 minutes (CPU), 10-20 minutes (GPU)
- Expected accuracy: >90% with proper dataset

**Output:**
- Model file: `models/cotton_disease_model.h5`
- Metadata: `models/model_metadata.json`
- Training metrics and classification report in console

## Step 4: Start the API Server

### Windows

```cmd
start.bat
```

### Manual Start

```bash
cd ml-backend
python app.py
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## Step 5: Test the API

### Using the test script:

```bash
cd ml-backend
python test_api.py path/to/test/image.jpg
```

### Using curl:

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/image.jpg"
```

### Using the interactive docs:

1. Open http://localhost:8000/docs
2. Click on POST /predict
3. Click "Try it out"
4. Upload an image
5. Click "Execute"

## Step 6: Connect Frontend

The frontend is already configured to use the ML backend!

1. Make sure your `.env` file has:
```
VITE_ML_API_URL=http://localhost:8000
```

2. Start your frontend:
```cmd
npm run dev
```

3. Navigate to the Disease Detection page
4. Upload or capture an image
5. The app will automatically use the ML backend for predictions

## API Endpoints

### GET /
Root endpoint with API information

### GET /health
Check API and model status
```json
{
  "status": "healthy",
  "model_loaded": true,
  "metadata": {...}
}
```

### POST /predict
Predict disease from image

**Request:**
- Content-Type: multipart/form-data
- Body: file (image)

**Response:**
```json
{
  "disease": "bacterial blight - moderate",
  "confidence": 0.95,
  "severity": "moderate",
  "all_predictions": [
    {"disease": "bacterial blight - moderate", "confidence": 0.95},
    {"disease": "bacterial blight - mild", "confidence": 0.03}
  ],
  "recommendations": [
    "Apply copper-based fungicides every 7-10 days",
    "Remove infected leaves and destroy them",
    "Improve air circulation by proper spacing"
  ]
}
```

### GET /classes
Get all available disease classes

## Model Architecture

- **Base Model:** EfficientNetB3 (pretrained on ImageNet)
- **Input Size:** 300x300x3
- **Custom Layers:**
  - GlobalAveragePooling2D
  - BatchNormalization
  - Dense(512, relu) + Dropout(0.5)
  - BatchNormalization
  - Dense(256, relu) + Dropout(0.3)
  - Dense(num_classes, softmax)

## Training Features

- **Transfer Learning:** Uses EfficientNetB3 pretrained weights
- **Data Augmentation:** Rotation, shifts, zoom, flips
- **Two-Phase Training:** Frozen base → Fine-tuning
- **Callbacks:**
  - ModelCheckpoint: Saves best model
  - EarlyStopping: Prevents overfitting
  - ReduceLROnPlateau: Adaptive learning rate

## Improving Model Accuracy

1. **Add More Data:**
   - Collect more images (aim for 200+ per class)
   - Ensure balanced dataset
   - Include diverse lighting and angles

2. **Data Quality:**
   - Use high-resolution images
   - Ensure clear disease symptoms
   - Remove blurry or unclear images

3. **Augmentation:**
   - Already implemented in training script
   - Helps model generalize better

4. **Hyperparameter Tuning:**
   - Adjust learning rate in `train_model.py`
   - Modify batch size based on your hardware
   - Experiment with different architectures

## Troubleshooting

### Model not loading
- Ensure you've trained the model first
- Check that `models/cotton_disease_model.h5` exists

### Low accuracy
- Need more training data
- Dataset might be imbalanced
- Images might be low quality

### API connection failed
- Ensure backend is running on port 8000
- Check firewall settings
- Verify VITE_ML_API_URL in .env

### Out of memory during training
- Reduce BATCH_SIZE in train_model.py
- Use smaller image size (reduce IMG_SIZE)
- Close other applications

## Production Deployment

For production deployment:

1. Use a production WSGI server (already using uvicorn)
2. Set up proper CORS origins (update app.py)
3. Add authentication if needed
4. Use environment variables for configuration
5. Deploy on cloud (AWS, GCP, Azure) or VPS
6. Consider using Docker for easier deployment

## Next Steps

1. ✅ Setup backend environment
2. ✅ Train the model
3. ✅ Start API server
4. ✅ Test predictions
5. ✅ Connect with frontend
6. 🎯 Collect more training data
7. 🎯 Improve model accuracy
8. 🎯 Deploy to production

## Support

If you encounter issues:
1. Check the console output for error messages
2. Verify all dependencies are installed
3. Ensure training data is properly organized
4. Test API endpoints using the docs interface
5. Check frontend console for connection errors
