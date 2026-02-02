// Auto Update Checker
class UpdateChecker {
  constructor() {
    this.checkInterval = 5 * 60 * 1000; // 5 minutes
    this.currentVersion = localStorage.getItem('appVersion');
    this.checking = false;
  }

  async checkForUpdates() {
    if (this.checking) return;
    
    try {
      this.checking = true;
      const response = await fetch('/version.json?' + Date.now());
      const data = await response.json();
      
      if (!this.currentVersion) {
        localStorage.setItem('appVersion', data.version);
        this.currentVersion = data.version;
        return;
      }
      
      if (data.version !== this.currentVersion) {
        console.log('🔄 New version available:', data.version);
        this.showUpdateNotification(data.version);
      }
    } catch (error) {
      console.error('Update check failed:', error);
    } finally {
      this.checking = false;
    }
  }

  showUpdateNotification(newVersion) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
      padding: 20px 30px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 350px;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
        <div style="font-size: 24px;">🚀</div>
        <div>
          <div style="font-weight: 700; font-size: 16px;">New Update Available!</div>
          <div style="font-size: 13px; opacity: 0.9;">Version ${newVersion}</div>
        </div>
      </div>
      <button id="updateNowBtn" style="
        width: 100%;
        padding: 10px;
        background: white;
        color: #16a34a;
        border: none;
        border-radius: 8px;
        font-weight: 700;
        cursor: pointer;
        font-size: 14px;
      ">
        Update Now
      </button>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    document.getElementById('updateNowBtn').onclick = () => {
      localStorage.setItem('appVersion', newVersion);
      window.location.reload(true);
    };
    
    // Auto-reload after 10 seconds
    setTimeout(() => {
      localStorage.setItem('appVersion', newVersion);
      window.location.reload(true);
    }, 10000);
  }

  start() {
    this.checkForUpdates();
    setInterval(() => this.checkForUpdates(), this.checkInterval);
    
    // Check on visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates();
      }
    });
  }
}

const updateChecker = new UpdateChecker();
export default updateChecker;
