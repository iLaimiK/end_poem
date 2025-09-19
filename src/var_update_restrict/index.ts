/**
 * MVU Variable Update Restriction Script
 *
 * Function: Intercept and delete _.set() commands that update complex variables (arrays, objects)
 * Keep _.set() commands that update simple variables (numbers, strings, booleans)
 * Does not affect _.insert, _.delete and other MVU commands
 */

// Configuration

interface FilterConfig {
  /** Enable debug logging */
  enableDebugLog: boolean;
}

const config: FilterConfig = {
  enableDebugLog: true,
};

// Utility Functions

/**
 * Debug logging output
 */
function debugLog(message: string, ...args: any[]): void {
  if (config.enableDebugLog) {
    console.log(`[MVU Filter] ${message}`, ...args);
  }
}

/**
 * Safely get variable value
 * @param mvuData MVU data object
 * @param path Variable path
 * @returns Variable value, or undefined if failed
 */
function safeGetVariable(mvuData: Mvu.MvuData, path: string): any {
  try {
    return _.get(mvuData.stat_data, path);
  } catch (error) {
    debugLog(`Failed to get variable value: ${path}`, error);
    return undefined;
  }
}

/**
 * Check if value is complex type (object or array)
 * @param value Value to check
 * @returns true if complex type, false otherwise
 */
function isComplexType(value: any): boolean {
  // Check for null first (typeof null === 'object')
  if (value === null || value === undefined) {
    return false;
  }

  // Check for array or object
  return Array.isArray(value) || typeof value === 'object';
}

/**
 * Clean path argument, remove quotes and whitespace
 * @param pathArg Raw path argument
 * @returns Cleaned path string
 */
function cleanPath(pathArg: string): string {
  let path = pathArg.trim();

  // Remove surrounding quotes (single or double)
  if ((path.startsWith('"') && path.endsWith('"')) || (path.startsWith("'") && path.endsWith("'"))) {
    path = path.slice(1, -1);
  }

  return path;
}

// Core Filter Function

/**
 * Filter _.set() commands that try to update complex variables
 * @param text Original text
 * @returns Filtered text
 */
function filterComplexSetCommands(text: string): string {
  try {
    // Get current MVU data at chat level
    const mvuData = Mvu.getMvuData({ type: 'chat' });

    // Regex: Match _.set(..., ...);//... format
    // Support optional semicolon and comment parts
    const setCommandRegex = /_\.set\s*\(\s*([^,]+)\s*,\s*[^)]+\)\s*;?\s*(?:\/\/.*)?/g;

    let filteredCount = 0;

    const filteredText = text.replace(setCommandRegex, (match, pathArg) => {
      try {
        // Clean and extract variable path
        const path = cleanPath(pathArg);
        debugLog(`Checking variable path: "${path}"`);

        // Get current variable value
        const currentValue = safeGetVariable(mvuData, path);

        // If variable doesn't exist, conservative approach: keep command
        if (currentValue === undefined) {
          debugLog(`Variable does not exist, keeping command: ${path}`);
          return match;
        }

        // Check if current value is complex type
        if (isComplexType(currentValue)) {
          debugLog(`Found complex variable update command, removing: "${path}"`, {
            currentValue: currentValue,
            valueType: Array.isArray(currentValue) ? 'array' : 'object',
            command: match.trim(),
          });

          filteredCount++;
          return ''; // Delete entire command
        }

        // Simple type variable, keep command
        debugLog(`Simple variable update, keeping: "${path}" (${typeof currentValue})`);
        return match;
      } catch (error) {
        // Error parsing single command, conservative approach: keep command
        debugLog(`Error parsing command, keeping original: ${match.trim()}`, error);
        return match;
      }
    });

    // Show notification if any commands were filtered
    if (filteredCount > 0) {
      toastr.info(`已删除 ${filteredCount} 个不合规的 _.set 复杂变量更新命令`);
    }

    return filteredText;
  } catch (error) {
    // Overall filtering error, return original text
    debugLog('Serious error during filtering process, returning original text', error);
    return text;
  }
}

// ==================== Event Listeners ====================

/**
 * Initialize event listeners
 */
function initializeEventListeners(): void {
  debugLog('Initializing message interception event listeners...');

  // Listen to message received event, execute before all other listeners
  eventMakeFirst(tavern_events.MESSAGE_RECEIVED, async (message_id: number) => {
    try {
      debugLog(`Intercepted message: ${message_id}`);

      // Get message content
      const messages = getChatMessages(message_id);
      if (!messages || messages.length === 0) {
        debugLog(`Message ${message_id} does not exist or is empty`);
        return;
      }

      const message = messages[0];
      const originalContent = message.message;

      // If message content is empty, return directly
      if (!originalContent || originalContent.trim() === '') {
        debugLog(`Message ${message_id} content is empty, skipping processing`);
        return;
      }

      // Execute filtering
      const filteredContent = filterComplexSetCommands(originalContent);

      // If content has changed, update message
      if (filteredContent !== originalContent) {
        debugLog(`Message ${message_id} content filtered, updating...`);

        await setChatMessages(
          [
            {
              message_id: message_id,
              message: filteredContent,
            },
          ],
          { refresh: 'none' },
        );

        debugLog(`Message ${message_id} update completed`);
      } else {
        debugLog(`Message ${message_id} needs no filtering`);
      }
    } catch (error) {
      debugLog(`Error processing message ${message_id}:`, error);
    }
  });

  debugLog('Event listeners initialization completed');
}

// ==================== Main Entry Point ====================

/**
 * Script main entry point
 */
$(() => {
  debugLog('MVU variable update restriction script starting...');

  // Wait for MVU framework initialization
  waitGlobalInitialized('Mvu')
    .then(() => {
      debugLog('MVU framework initialized, setting up filter');

      // Initialize event listeners
      initializeEventListeners();

      // Show startup success message
      debugLog('MVU variable update restriction script startup completed');
    })
    .catch(error => {
      debugLog('Error waiting for MVU initialization:', error);
    });
});

// ==================== Cleanup on Unload ====================

/**
 * Cleanup work when page unloads
 */
$(window).on('pagehide', () => {
  debugLog('MVU variable update restriction script unloaded');
});
