/**
 * Script Loader Utility
 * Prevents webpack module loading race conditions by ensuring proper script execution order
 * Based on solutions from webpack module loading issues
 */

(function() {
  'use strict';
  
  // Track loaded scripts to prevent race conditions
  const loadedScripts = new Set();
  const scriptQueue = [];
  let isProcessing = false;

  // Load script with proper async handling
  function loadScript(src, options = {}) {
    return new Promise((resolve, reject) => {
      if (loadedScripts.has(src)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = options.async !== false; // Default to async but allow override
      script.defer = options.defer || false;
      
      // Ensure proper loading order for critical scripts
      if (options.critical) {
        script.async = false;
        script.defer = false;
      }

      script.onload = () => {
        loadedScripts.add(src);
        resolve();
      };

      script.onerror = () => {
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  // Load scripts in sequence to prevent race conditions
  async function loadScriptsSequentially(scripts) {
    for (const script of scripts) {
      try {
        await loadScript(script.src, script.options);
      } catch (error) {
        console.error('Script loading error:', error);
        // Continue loading other scripts even if one fails
      }
    }
  }

  // Process queued scripts
  async function processQueue() {
    if (isProcessing || scriptQueue.length === 0) return;
    
    isProcessing = true;
    try {
      await loadScriptsSequentially(scriptQueue);
      scriptQueue.length = 0; // Clear queue
    } finally {
      isProcessing = false;
    }
  }

  // Public API
  window.ScriptLoader = {
    load: loadScript,
    loadSequentially: loadScriptsSequentially,
    queue: (src, options) => {
      scriptQueue.push({ src, options });
      processQueue();
    },
    isLoaded: (src) => loadedScripts.has(src)
  };

  // Auto-process queue when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processQueue);
  } else {
    processQueue();
  }
})(); 