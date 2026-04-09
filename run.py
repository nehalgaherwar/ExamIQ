from app import create_app

if __name__ == '__main__':
    app = create_app()
    print("[*] Starting ExamIQ Backend...")
    print("[*] Server running on http://localhost:5000")
    print("[*] API documentation available in README.md")
    app.run(debug=True, host='0.0.0.0', port=5000)
