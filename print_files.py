#!/usr/bin/python3

import os
import fnmatch

# Read the .gitignore file and parse the patterns
def read_gitignore(gitignore_path=".gitignore"):
    patterns = []
    if os.path.exists(gitignore_path):
        with open(gitignore_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    patterns.append(line)
    return patterns

# Check if a file or directory matches any pattern in .gitignore or additional patterns
def is_ignored(path, patterns):
    for pattern in patterns:
        if fnmatch.fnmatch(path, pattern) or fnmatch.fnmatch(path, f"*/{pattern}"):
            return True
    return False

# Read file contents with fallback encoding
def read_file_contents(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except UnicodeDecodeError:
        with open(file_path, "r", encoding="latin-1") as f:
            return f.read()

# Traverse directories and write file contents to output
def write_files_to_output(output_file="output.txt", additional_patterns=None):
    if additional_patterns is None:
        additional_patterns = []
    patterns = read_gitignore()
    patterns.extend(additional_patterns)
    with open(output_file, "w") as out:
        for root, dirs, files in os.walk("."):
            # Exclude directories listed in .gitignore or additional patterns
            dirs[:] = [d for d in dirs if not is_ignored(os.path.join(root, d), patterns)]
            for file in files:
                file_path = os.path.join(root, file)
                # Exclude files listed in .gitignore or additional patterns
                if not is_ignored(file_path, patterns):
                    out.write(f"{file_path}\n")
                    file_contents = read_file_contents(file_path)
                    out.write(file_contents)
                    out.write("\n\n")

if __name__ == "__main__":
    additional_patterns = [
        ".git",
        ".gitignore",
        "*.py",
        "*.lock",
        "*.lockb",
        "*-lock.json",
        ".devcontainer",
        ".vscode",
        "node_modules",
        "prisma/migrations",
    ]
    write_files_to_output(additional_patterns=additional_patterns)