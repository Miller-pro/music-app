(function() {
  const containers = document.querySelectorAll('[data-audioverse-player]');
  
  containers.forEach((container) => {
    const apiKey = container.getAttribute('data-api-key');
    
    if (!apiKey) {
      console.error('AudioVerse: Missing API key');
      return;
    }

    // Create player HTML
    const player = document.createElement('div');
    player.innerHTML = `
      <div style="background: #1e293b; border: 1px solid #475569; border-radius: 8px; padding: 20px; color: white; font-family: system-ui;">
        <h3 style="margin: 0 0 15px 0;">🎵 AudioVerse Music</h3>
        <p style="font-size: 14px; color: #cbd5e1;">Music player loading...</p>
      </div>
    `;
    
    container.appendChild(player);
  });
})();