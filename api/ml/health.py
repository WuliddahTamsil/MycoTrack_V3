"""
Vercel serverless function for ML service health check
"""

from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/ml/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ml-api',
        'platform': 'vercel'
    })

# Export for Vercel
def handler(request):
    return app(request.environ, lambda status, headers: None)

