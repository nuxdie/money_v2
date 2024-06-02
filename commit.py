#!/usr/bin/env python3

import os
import subprocess
import json

API_KEY = os.getenv("GROQ_API_KEY", "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")
API_URL = os.getenv("API_URL", "https://api.groq.com/openai")
MODEL = os.getenv("MODEL", "llama3-70b-8192")

DEFAULT_GIT_EMAIL = "you@example.com"
DEFAULT_GIT_NAME = "Your Name"

def get_diff(cached=True):
    command = ["git", "diff"]
    if cached:
        command.append("--cached")
    result = subprocess.run(command, capture_output=True, text=True)
    return result.stdout.strip()

def commit(message, unstaged=False):
    command = ["git", "commit"]
    if unstaged:
        command.append("--all")
    command.extend(["-m", message])
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error committing changes: {result.stderr}")
        exit(1)

def prompt(diff):
    return (
        "Write a commit message for these changes (output just the commit message itself without any markup or quotes):\n\n"
        + diff
    )

def call_api(message):
    data = {
        "messages": [{"role": "user", "content": message}],
        "model": MODEL,
    }
    command = [
        "curl",
        "-X",
        "POST",
        f"{API_URL}/v1/chat/completions",
        "-H",
        f"Authorization: Bearer {API_KEY}",
        "-H",
        "Content-Type: application/json",
        "-d",
        json.dumps(data),
    ]
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error calling API: {result.stderr}")
        exit(1)

    response_data = json.loads(result.stdout)
    return response_data["choices"][0]["message"]["content"]

def check_and_set_git_credentials():
    email_result = subprocess.run(["git", "config", "user.email"], capture_output=True, text=True)
    name_result = subprocess.run(["git", "config", "user.name"], capture_output=True, text=True)
    
    if not email_result.stdout.strip():
        subprocess.run(["git", "config", "--global", "user.email", DEFAULT_GIT_EMAIL])
        
    if not name_result.stdout.strip():
        subprocess.run(["git", "config", "--global", "user.name", DEFAULT_GIT_NAME])

def add_new_files():
    result = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
    lines = result.stdout.strip().split("\n")
    new_files = [line[3:] for line in lines if line.startswith("?? ")]
    if new_files:
        subprocess.run(["git", "add"] + new_files)

def main():
    check_and_set_git_credentials()

    # Step 1: Check if there are staged changes
    diff_staged = get_diff(cached=True)
    if diff_staged:
        commit_message = call_api(prompt(diff_staged))
        print(commit_message)
        if not commit_message:
            print("Failed to generate commit message")
            exit(1)
        commit(commit_message, unstaged=False)
        exit(0)
    
    # Step 2: Check if there are unstaged changes
    diff_unstaged = get_diff(cached=False)
    if diff_unstaged:
        commit_message = call_api(prompt(diff_unstaged))
        print(commit_message)
        if not commit_message:
            print("Failed to generate commit message")
            exit(1)
        commit(commit_message, unstaged=True)
        exit(0)
    
    # Step 3: Check for new files, stage them, and commit if found
    add_new_files()
    diff_new_files = get_diff(cached=True)
    if diff_new_files:
        commit_message = call_api(prompt(diff_new_files))
        print(commit_message)
        if not commit_message:
            print("Failed to generate commit message")
            exit(1)
        commit(commit_message, unstaged=False)
        exit(0)

    # No changes to commit
    print("No changes to commit")
    exit(0)

if __name__ == "__main__":
    main()