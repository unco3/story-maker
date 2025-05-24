# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Story Generator web application that helps users create structured fiction stories using Google's Gemini AI. The app guides users through generating character profiles, story settings, narrative structure, and detailed outlines following the "Save the Cat" storytelling framework.

## Commands

### Development
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variable (required)
export GEMINI_API_KEY="your-api-key"

# Run the application
python app.py
```

The application runs on http://localhost:5000 in debug mode.

## Architecture

### Backend Structure
- **app.py**: Flask server with RESTful API endpoints for each story generation phase
- **prompts.py**: Centralized prompt templates for Gemini API interactions
- All API endpoints expect JSON requests and return JSON responses
- Uses Google Gemini API (gemini-2.0-flash-exp model) for content generation

### API Endpoints
- `/generate-profiles` - Generates character profiles based on age/gender inputs
- `/update-fields` - Updates specific character fields dynamically
- `/generate-scenarios` - Creates 3 story setting options
- `/generate-story-structure` - Generates "Save the Cat" beat sheet
- `/generate-outline` - Creates detailed chapter-by-chapter outline

### Frontend Flow
The application follows a 5-step progressive workflow:
1. Select number of characters (1-10)
2. Generate and customize character profiles
3. Generate and select from 3 story scenarios
4. Generate story structure with 15 beats
5. Generate complete chapter outline

### Key Constraints
- Character names must follow specific Japanese naming conventions (no specific patterns like 田中太郎)
- Jobs are selected from a curated list, explicitly excluding programmers
- All prompts and UI are in Japanese
- Story generation follows strict "Save the Cat" methodology