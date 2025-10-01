#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract all questions from the occupational safety exam file - Version 2
Improved to handle the specific format of this file
"""

import re
import json

def clean_line(line):
    """Remove line number prefix and clean the line"""
    # Remove line number (e.g., "  92→")
    cleaned = re.sub(r'^\s*\d+→', '', line)
    return cleaned.strip()

def extract_questions(filename):
    """Extract all questions with their answers and options"""
    questions = []

    with open(filename, 'r', encoding='utf-8') as f:
        lines = [clean_line(line) for line in f.readlines()]

    i = 0
    while i < len(lines):
        line = lines[i]

        # Skip empty lines, HIT markers, section headers
        if not line or line.startswith('HIT') or line.startswith('===') or line.startswith('---'):
            i += 1
            continue

        # Look for question pattern: starts with number followed by question
        # Examples: "1 question text", "1-1 question text", "2. question text"
        question_match = re.match(r'^(\d+[\-\d]*)[\.、\s]+(.+)', line)

        if question_match:
            question_id = question_match.group(1)
            question_text = question_match.group(2)

            # Look ahead for answer (usually on next line or same line)
            answer = None
            options = []

            # Check if answer is at the end of current line
            parts = question_text.rsplit('(D)', 1)
            if len(parts) == 2:
                # Has all options in the question text
                pass

            # Move to next line to find answer
            i += 1
            if i < len(lines):
                next_line = lines[i]

                # Check if next line is an answer (single letter A, B, C, D or combination like AB)
                answer_match = re.match(r'^([A-D]+)$', next_line.strip())
                if answer_match:
                    answer = answer_match.group(1)
                    i += 1  # Move past answer line

                    # Continue reading question text if it continues after answer
                    while i < len(lines):
                        cont_line = lines[i]
                        # Stop if we hit a new question, HIT marker, or another answer
                        if (re.match(r'^\d+[\-\d]*[\.、\s]+', cont_line) or
                            cont_line.startswith('HIT') or
                            re.match(r'^[A-D]+$', cont_line.strip()) or
                            cont_line.startswith('模擬試題') or
                            cont_line.startswith('要有印象')):
                            break
                        if cont_line and not cont_line.startswith('第') and len(cont_line) > 3:
                            question_text += ' ' + cont_line
                        i += 1
                else:
                    # Answer might be on same line as question start
                    answer_in_text = re.search(r'\(D\)[^\(]*$', question_text)
                    if answer_in_text:
                        # Try to extract answer from context or set as unknown
                        pass

            # Extract options from question text
            # Look for patterns like (A)text (B)text (C)text (D)text
            option_pattern = r'\(([A-D])\)\s*([^\(]+?)(?=\s*\([A-D]\)|$)'
            option_matches = re.findall(option_pattern, question_text)

            options_dict = {}
            for opt_letter, opt_text in option_matches:
                options_dict[opt_letter] = opt_text.strip()

            # Clean up question text - remove options if they're clearly marked
            clean_question = question_text
            if options_dict:
                # Try to split question from options
                first_option_pos = question_text.find('(A)')
                if first_option_pos > 20:  # Ensure there's actual question before options
                    clean_question = question_text[:first_option_pos].strip()
                    # Remove trailing punctuation
                    clean_question = re.sub(r'[?？。]\s*$', '?', clean_question)

            # Only add if we have an answer
            if answer:
                question_obj = {
                    'id': question_id,
                    'question': clean_question,
                    'options': options_dict,
                    'answer': answer,
                    'full_text': question_text[:500]  # Limit length
                }
                questions.append(question_obj)
        else:
            i += 1

    return questions

def main():
    filename = '693732162-丙種職業安全衛生業務主管筆記4版.txt'

    print("Extracting questions from file...")
    questions = extract_questions(filename)

    print(f"\nTotal questions extracted: {len(questions)}")

    # Save to JSON
    output_file = 'extracted_questions_v2.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"Questions saved to: {output_file}")

    # Print statistics
    questions_with_4_options = sum(1 for q in questions if len(q['options']) == 4)
    print(f"\nStatistics:")
    print(f"Questions with 4 options: {questions_with_4_options}")
    print(f"Questions with other number of options: {len(questions) - questions_with_4_options}")

    # Print first 10 questions as sample
    print("\n=== Sample Questions (first 10) ===")
    for i, q in enumerate(questions[:10], 1):
        print(f"\n[Question {i}] ID: {q['id']}")
        print(f"Question: {q['question'][:150]}...")
        print(f"Answer: {q['answer']}")
        print(f"Options: {len(q['options'])}")
        for opt_key in sorted(q['options'].keys()):
            opt_val = q['options'][opt_key]
            print(f"  ({opt_key}) {opt_val[:80]}...")

    # Print summary by answer
    answer_counts = {}
    for q in questions:
        ans = q['answer']
        answer_counts[ans] = answer_counts.get(ans, 0) + 1
    print(f"\nAnswer distribution:")
    for ans in sorted(answer_counts.keys()):
        print(f"  {ans}: {answer_counts[ans]} questions")

if __name__ == '__main__':
    main()
