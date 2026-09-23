import React from 'react';

export function WorldTransitionOverlay({ targetWorld }) {
  const getMessage = () => {
    switch (targetWorld) {
      case 2:
        return {
          title: 'DIMENSIONAL GLITCH DETECTED',
          subtitle: 'Entering Corrupted Mushroom Kingdom...',
          icon: '⚠️',
          color: '#ff0055',
        };
      case 3:
        return {
          title: 'ACCESS CLEARANCE VERIFIED',
          subtitle: 'Approaching the Grand Code Castle...',
          icon: '🏰',
          color: '#00f0ff',
        };
      default:
        return {
          title: 'WARPING REALITY',
          subtitle: 'Loading World Dimension...',
          icon: '✨',
          color: '#38bdf8',
        };
    }
  };

  const info = getMessage();

  return (
    <div className="world-transition-overlay animate-fade-in">
      <div className="transition-glitch-lines" />
      <div className="transition-content animate-pulse">
        <div className="transition-icon">{info.icon}</div>
        <h2 className="transition-title" style={{ color: info.color }}>
          {info.title}
        </h2>
        <p className="transition-subtitle">{info.subtitle}</p>
        <div className="transition-bar">
          <div className="transition-bar-fill" style={{ backgroundColor: info.color }} />
        </div>
      </div>
    </div>
  );
}

export default WorldTransitionOverlay;
