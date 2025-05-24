import os
import traceback
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from google import genai
from google.genai import types
import json
from prompts import (
    get_profiles_prompt,
    get_partial_update_prompt,
    get_scenarios_prompt,
    get_story_structure_prompt,
    get_outline_prompt
)

app = Flask(__name__)
CORS(app)

# Gemini API設定
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

def extract_json_from_response(response):
    """Helper function to extract JSON content from Gemini response text."""
    response_text = response.text
    start = response_text.find('{')
    end = response_text.rfind('}') + 1
    if start >= 0 and end > start:
        json_str = response_text[start:end]
        return json.loads(json_str)
    return None

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/generate-profiles', methods=['POST'])
def generate_profiles():
    try:
        data = request.json
        profiles_input = data.get('profiles', [])
        
        if not profiles_input:
            return jsonify({'error': 'No profiles provided'}), 400

        print(f"Received profiles input: {profiles_input}")
        prompt = get_profiles_prompt(profiles_input)
        print(f"Sending prompt to Gemini: {prompt}")

        response = client.models.generate_content(
            model='gemini-2.5-flash-preview-05-20',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json'
            )
        )
        print(f"Received response from Gemini: {response}")

        profiles_data = extract_json_from_response(response)
        if profiles_data and 'profiles' in profiles_data:
            print(f"Extracted profiles data: {profiles_data['profiles']}")
            return jsonify({'profiles': profiles_data['profiles']})
        
        print("No valid JSON found in response")
        return jsonify({'error': 'Invalid response format'}), 500

    except Exception as e:
        print(f"Error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

def build_partial_update_prompt(profile, changed_field):
    affected_map = {
        "age": ["job", "personality", "history"],
        "gender": ["name", "personality", "history"],
        "name": [],
        "job": ["personality", "history"],
        "personality": ["history"],
        "history": []
    }

    fields_to_update = affected_map.get(changed_field, [])
    if changed_field not in fields_to_update:
        fields_to_update.append(changed_field)
    
    return get_partial_update_prompt(profile, changed_field, fields_to_update)

@app.route('/update-fields', methods=['POST'])
def update_fields():
    try:
        data = request.json
        profile = data.get('profile', {})
        changed_field = data.get('changed_field', None)

        if not changed_field or changed_field not in ["age", "gender", "name", "job", "personality", "history"]:
            return jsonify({'error': 'Invalid changed_field'}), 400

        prompt = build_partial_update_prompt(profile, changed_field)
        print(f"Partial update prompt: {prompt}")

        response = client.models.generate_content(
            model='gemini-2.5-flash-preview-05-20',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json'
            )
        )

        updated_data = extract_json_from_response(response)
        if updated_data and 'updated_fields' in updated_data:
            return jsonify(updated_data)
        
        return jsonify({'error': 'Invalid response format'}), 500

    except Exception as e:
        print(f"Error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/generate-scenarios', methods=['POST'])
def generate_scenarios():
    try:
        data = request.json
        profiles = data.get('profiles', [])

        if not profiles or len(profiles) == 0:
            return jsonify({'error': 'No profiles provided'}), 400

        prompt = get_scenarios_prompt(profiles)
        print("Sending scenario prompt:", prompt)
        response = client.models.generate_content(
            model='gemini-2.5-flash-preview-05-20',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json'
            )
        )

        scenario_data = extract_json_from_response(response)
        if scenario_data and 'scenarios' in scenario_data:
            return jsonify(scenario_data)

        return jsonify({'error': 'Invalid response format'}), 500

    except Exception as e:
        print(f"Error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/generate-story-structure', methods=['POST'])
def generate_story_structure():
    try:
        data = request.json
        scenario = data.get('selected_scenario', {})
        profiles = data.get('profiles', [])

        if not scenario or 'title' not in scenario or 'description' not in scenario:
            return jsonify({'error': 'No valid scenario provided'}), 400

        prompt = get_story_structure_prompt(scenario, profiles)
        print("Sending story structure prompt:", prompt)
        response = client.models.generate_content(
            model='gemini-2.5-flash-preview-05-20',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json'
            )
        )

        structure_data = extract_json_from_response(response)
        if structure_data and 'story_beats' in structure_data:
            return jsonify(structure_data)

        return jsonify({'error': 'Invalid response format'}), 500

    except Exception as e:
        print(f"Error generating story structure: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/generate-outline', methods=['POST'])
def generate_outline():
    try:
        data = request.json
        scenario = data.get('selected_scenario', {})
        profiles = data.get('profiles', [])
        structure = data.get('story_beats', [])

        if not scenario or 'title' not in scenario or 'description' not in scenario:
            return jsonify({'error': 'No valid scenario provided'}), 400

        if not profiles or len(profiles) == 0:
            return jsonify({'error': 'No profiles provided'}), 400

        if not structure or len(structure) == 0:
            return jsonify({'error': 'No story beats provided'}), 400

        prompt = get_outline_prompt(scenario, profiles, structure)
        print("Sending outline prompt:", prompt)
        response = client.models.generate_content(
            model='gemini-2.5-flash-preview-05-20',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json'
            )
        )

        outline_data = extract_json_from_response(response)
        if outline_data and 'outline' in outline_data:
            return jsonify(outline_data)

        return jsonify({'error': 'Invalid response format'}), 500

    except Exception as e:
        print(f"Error generating outline: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
