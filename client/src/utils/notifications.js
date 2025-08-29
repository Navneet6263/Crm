// Better notification system instead of basic alerts

export const showNotification = (message, type = 'info', duration = 3000) => {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    font-size: 14px;
    z-index: 10000;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;

  // Set background color based on type
  const colors = {
    success: '#10b981',
    error: '#ef4444', 
    warning: '#f59e0b',
    info: '#3b82f6'
  };
  
  notification.style.backgroundColor = colors[type] || colors.info;
  notification.textContent = message;

  // Add to DOM
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  // Remove after duration
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
};

export const showSuccess = (message) => showNotification(message, 'success');
export const showError = (message) => showNotification(message, 'error');
export const showWarning = (message) => showNotification(message, 'warning');
export const showInfo = (message) => showNotification(message, 'info');

export const confirmAction = (message, onConfirm, onCancel) => {
  // Create custom confirm dialog
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
  `;

  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: white;
    padding: 24px;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
    text-align: center;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  `;

  dialog.innerHTML = `
    <div style="margin-bottom: 20px; font-size: 16px; color: #374151;">${message}</div>
    <div style="display: flex; gap: 12px; justify-content: center;">
      <button id="confirm-yes" style="
        background: #ef4444;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
      ">Yes, Delete</button>
      <button id="confirm-no" style="
        background: #6b7280;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
      ">Cancel</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  // Handle clicks
  dialog.querySelector('#confirm-yes').onclick = () => {
    document.body.removeChild(overlay);
    if (onConfirm) onConfirm();
  };

  dialog.querySelector('#confirm-no').onclick = () => {
    document.body.removeChild(overlay);
    if (onCancel) onCancel();
  };

  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
      if (onCancel) onCancel();
    }
  };
};