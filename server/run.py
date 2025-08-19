#!/usr/bin/env python3
"""
Simple script to run the Agricultural ML API
"""
from src.app import create_app

if __name__ == "__main__":
    app = create_app()
    app.run()