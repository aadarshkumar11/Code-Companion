# GitHub Integration Guide

Code Companion allows you to import code directly from GitHub repositories for analysis. This guide explains how to use this feature effectively.

## How to Import Code from GitHub

1. In the main Code Companion interface, select the "GitHub URL" tab in the File Uploader section.
2. Enter the full GitHub repository URL in the input field. For example:
   ```
   https://github.com/username/repository
   ```
3. Click the "Import" button to fetch code from the repository.

## Supported Repository Formats

The GitHub integration supports public repositories in the following formats:

- `https://github.com/username/repository`
- `https://github.com/username/repository/tree/branch-name`

## Limitations

The current implementation has the following limitations:

- Only public repositories are supported
- A maximum of 10 files will be imported to prevent performance issues
- Only text-based files are supported (.js, .ts, .py, .java, etc.)
- GitHub API rate limits may apply

## Troubleshooting

If you encounter issues importing from GitHub:

1. Verify the repository is public and accessible
2. Check that the URL is correctly formatted
3. Ensure you have an active internet connection
4. Try importing a specific file or smaller repository

For further assistance, please open an issue on the Code Companion GitHub repository.
