#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract all questions from the occupational safety exam file
"""

import re
import json

def extract_questions(filename):
    """Extract all questions with their answers and options"""
    questions = []

    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    current_question = None

    for i, line in enumerate(lines):
        # Remove line number prefix (e.g., "  92→")
        content = re.sub(r'^\s*\d+→', '', line).strip()

        if not content:
            continue

        # Check if line starts with an answer marker (A, B, C, D, AB, etc.)
        answer_match = re.match(r'^([A-D]+)\s+(.+)$', content)

        if answer_match:
            answer = answer_match.group(1)
            question_text = answer_match.group(2).strip()

            # Check if this is a question (contains question number pattern)
            # Questions typically start with numbers like "1", "1-1", "2", etc.
            question_num_match = re.match(r'^(\d+[\-\d]*)[\.、\s]+(.+)$', question_text)

            if question_num_match:
                # Save previous question if exists
                if current_question and current_question.get('text'):
                    questions.append(current_question)

                # Start new question
                current_question = {
                    'id': question_num_match.group(1),
                    'text': question_num_match.group(2).strip(),
                    'answer': answer,
                    'options': {},
                    'full_text': question_text
                }
            elif current_question:
                # Continue previous question text
                current_question['text'] += ' ' + question_text
                current_question['full_text'] += ' ' + question_text
        else:
            # Check for option lines (A), (B), (C), (D)
            option_match = re.match(r'^\(([A-D])\)\s*(.+)$', content)
            if option_match and current_question:
                option_letter = option_match.group(1)
                option_text = option_match.group(2).strip()
                current_question['options'][option_letter] = option_text
            elif current_question and current_question.get('text'):
                # Continue question or option text
                if not content.startswith('HIT') and not content.startswith('第'):
                    if current_question['options']:
                        # Append to last option
                        last_option = list(current_question['options'].keys())[-1]
                        current_question['options'][last_option] += ' ' + content
                    else:
                        # Append to question text
                        current_question['text'] += ' ' + content

    # Add last question
    if current_question and current_question.get('text'):
        questions.append(current_question)

    return questions

def main():
    filename = '/Users/doeshing/Documents/GitHub/mock_exam_app/693732162-丙種職業安全衛生業務主管筆記4版.txt'

    print("Extracting questions from file...")
    questions = extract_questions(filename)

    print(f"\nTotal questions extracted: {len(questions)}")

    # Save to JSON
    output_file = '/Users/doeshing/Documents/GitHub/mock_exam_app/extracted_questions.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"Questions saved to: {output_file}")

    # Print first 5 questions as sample
    print("\n=== Sample Questions (first 5) ===")
    for i, q in enumerate(questions[:5], 1):
        print(f"\nQuestion {i}:")
        print(f"ID: {q['id']}")
        print(f"Question: {q['text'][:100]}...")
        print(f"Answer: {q['answer']}")
        print(f"Options: {len(q['options'])} options")
        for opt_key, opt_val in q['options'].items():
            print(f"  ({opt_key}) {opt_val[:50]}...")

if __name__ == '__main__':
    main()
