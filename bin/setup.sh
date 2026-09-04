set -e

echo "== Cash Cow Setup =="

# backend
cd backend

if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python -m venv .venv
fi

source .venv/Scripts/activate
pip install -r requirements.txt

if [ ! -f ".env" ]; then
    echo "No .env found - create backend/.env with DATABASE_URL, SECRET_KEY, FRONTEND_ORIGIN, and S3_BUCKET_NAME before running the app."
    exit 1
fi

# frontend setup
cd ../frontend
npm install

echo "Setup complete"
