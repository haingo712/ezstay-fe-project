/**
 * Notification utility to replace native alert() with custom notifications
 * Prevents "localhost:3000 says" browser alert messages
 */

class Notification {
  constructor() {
    this.toastContainer = null;
    this.initContainer();
  }

  initContainer() {
    if (typeof window === 'undefined') return;
    
    // Create toast container if it doesn't exist
    if (!document.getElementById('toast-container')) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
      this.toastContainer = container;
    } else {
      this.toastContainer = document.getElementById('toast-container');
    }
  }

  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {string} type - Type of notification: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in milliseconds (default: 4000)
   */
  toast(message, type = 'info', duration = 4000) {
    if (typeof window === 'undefined') return;
    
    this.initContainer();
    
    const toast = document.createElement('div');
    toast.className = `pointer-events-auto transform transition-all duration-300 ease-in-out opacity-0 translate-x-full`;
    
    const bgColors = {
      success: 'bg-green-600',
      error: 'bg-red-600',
      warning: 'bg-yellow-600',
      info: 'bg-blue-600'
    };
    
    const icons = {
      success: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
      error: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`,
      warning: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
      info: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`
    };
    
    toast.innerHTML = `
      <div class="${bgColors[type] || bgColors.info} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md">
        <div class="flex-shrink-0">
          ${icons[type] || icons.info}
        </div>
        <div class="flex-1 text-sm font-medium break-words">
          ${this.escapeHtml(message)}
        </div>
        <button class="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors" onclick="this.closest('div').parentElement.remove()">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;
    
    this.toastContainer.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('opacity-0', 'translate-x-full');
    });
    
    // Auto remove after duration
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-full');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /**
   * Show a modal dialog (replacement for alert/confirm)
   * @param {string} message - The message to display
   * @param {object} options - Options: { title, type, confirmText, cancelText, onConfirm, onCancel }
   */
  modal(message, options = {}) {
    if (typeof window === 'undefined') return Promise.resolve(false);
    
    return new Promise((resolve) => {
      const {
        title = 'Notification',
        type = 'info',
        confirmText = 'OK',
        cancelText = 'Cancel',
        showCancel = false,
        onConfirm = null,
        onCancel = null
      } = options;
      
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in';
      overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center;';
      
      const iconColors = {
        success: 'text-green-600',
        error: 'text-red-600',
        warning: 'text-yellow-600',
        info: 'text-blue-600'
      };
      
      const icons = {
        success: `<svg class="w-16 h-16 mx-auto ${iconColors.success}" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
        error: `<svg class="w-16 h-16 mx-auto ${iconColors.error}" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`,
        warning: `<svg class="w-16 h-16 mx-auto ${iconColors.warning}" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
        info: `<svg class="w-16 h-16 mx-auto ${iconColors.info}" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`
      };
      
      // Build modal HTML without extra whitespace
      const modalContent = document.createElement('div');
      modalContent.className = 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-scale-in';
      
      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'p-8';
      
      const iconDiv = document.createElement('div');
      iconDiv.className = 'mb-6';
      iconDiv.innerHTML = icons[type] || icons.info;
      
      const titleEl = document.createElement('h3');
      titleEl.className = 'text-xl font-bold text-gray-900 dark:text-white text-center mb-4';
      titleEl.textContent = title;
      
      const messageEl = document.createElement('p');
      messageEl.className = 'text-gray-600 dark:text-gray-300 text-center';
      messageEl.textContent = message;
      
      bodyDiv.appendChild(iconDiv);
      bodyDiv.appendChild(titleEl);
      bodyDiv.appendChild(messageEl);
      
      const footerDiv = document.createElement('div');
      footerDiv.className = `border-t border-gray-200 dark:border-gray-700 p-4 flex gap-3 ${showCancel ? 'justify-end' : 'justify-center'}`;
      
      if (showCancel) {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium';
        cancelBtn.dataset.action = 'cancel';
        cancelBtn.textContent = cancelText;
        footerDiv.appendChild(cancelBtn);
      }
      
      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl';
      confirmBtn.dataset.action = 'confirm';
      confirmBtn.textContent = confirmText;
      footerDiv.appendChild(confirmBtn);
      
      modalContent.appendChild(bodyDiv);
      modalContent.appendChild(footerDiv);
      overlay.appendChild(modalContent);
      
      const handleClose = (confirmed) => {
        overlay.classList.add('animate-fade-out');
        setTimeout(() => {
          overlay.remove();
          resolve(confirmed);
          if (confirmed && onConfirm) onConfirm();
          if (!confirmed && onCancel) onCancel();
        }, 200);
      };
      
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay && !showCancel) {
          handleClose(false);
        }
      });
      
      overlay.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          handleClose(btn.dataset.action === 'confirm');
        });
      });
      
      document.body.appendChild(overlay);
    });
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Convenience methods
  success(message, duration) {
    this.toast(message, 'success', duration);
  }

  error(message, duration) {
    this.toast(message, 'error', duration);
  }

  warning(message, duration) {
    this.toast(message, 'warning', duration);
  }

  info(message, duration) {
    this.toast(message, 'info', duration);
  }

  confirm(message, title = 'Confirm') {
    return this.modal(message, {
      title,
      type: 'warning',
      confirmText: 'Yes',
      cancelText: 'No',
      showCancel: true
    });
  }

  alert(message, title = 'Notification', type = 'info') {
    return this.modal(message, {
      title,
      type,
      confirmText: 'OK',
      showCancel: false
    });
  }
}

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes scaleIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
    }
    .animate-fade-out {
      animation: fadeOut 0.2s ease-out;
    }
    .animate-scale-in {
      animation: scaleIn 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}

// Create singleton instance
const notification = new Notification();

export default notification;

// Also export as named exports for convenience
export const toast = notification.toast.bind(notification);
export const modal = notification.modal.bind(notification);
export const success = notification.success.bind(notification);
export const error = notification.error.bind(notification);
export const warning = notification.warning.bind(notification);
export const info = notification.info.bind(notification);
export const confirm = notification.confirm.bind(notification);
export const alert = notification.alert.bind(notification);
