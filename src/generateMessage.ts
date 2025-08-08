import { execSync, spawnSync } from 'child_process';

/**
 * Helper function to trim and split output lines safely.
 */
function getLines(output: Buffer | string): string[] {
  return output
    .toString()
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.length > 0);
}

/**
 * Generate a commit message based on the current staged changes.
 *
 * The message is built from the statuses of each file. For example, if a file
 * is added (A), it will appear under the "Added" section. Modified (M),
 * Deleted (D), Renamed (R) and others are handled similarly. Up to
 * maxFiles are listed in the message; additional files are summarized by count.
 *
 * @param maxFiles Maximum number of file names to include in the message.
 * @returns A commit message string.
 */
export function generateCommitMessage(maxFiles = 5): string {
  try {
    // Check for staged changes. Use --name-status to get short status codes.
    const diffResult = spawnSync('git', ['diff', '--cached', '--name-status'], {
      encoding: 'utf8'
    });
    if (diffResult.error) {
      throw diffResult.error;
    }
    const lines = getLines(diffResult.stdout);
    if (lines.length === 0) {
      // No staged changes; attempt to determine overall status.
      return 'chore: no staged changes';
    }

    // Categorize file changes by status letter.
    const categories: Record<string, string[]> = {};
    for (const line of lines) {
      // line format: "<status>\t<file>"; status can include multiple letters (e.g. "R100" for renamed with similarity index)
      const [statusCode, ...fileParts] = line.split(/\s+/);
      const fileName = fileParts.join(' ').trim();
      if (!statusCode || !fileName) continue;
      const status = statusCode[0]; // first character
      const key = status;
      if (!categories[key]) categories[key] = [];
      categories[key].push(fileName);
    }

    const statusLabels: Record<string, string> = {
      A: 'added',
      M: 'modified',
      D: 'deleted',
      R: 'renamed',
      C: 'copied',
      U: 'updated'
    };

    let summaryParts: string[] = [];
    for (const status of Object.keys(categories)) {
      const files = categories[status];
      const label = statusLabels[status] || 'changed';
      const displayFiles = files.slice(0, maxFiles);
      let part = `${label} ${displayFiles.join(', ')}`;
      if (files.length > maxFiles) {
        const remaining = files.length - maxFiles;
        part += ` and ${remaining} more`;
      }
      summaryParts.push(part);
    }

    const message = `chore: ${summaryParts.join('; ')}`;
    return message;
  } catch (err: any) {
    return `chore: auto commit`;
  }
}