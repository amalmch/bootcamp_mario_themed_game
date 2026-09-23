import React, { useRef, useEffect } from 'react';

/**
 * Mobile virtual joystick + jump/interact buttons.
 * Drives the same `playerController.keys` object used by WASD.
 */
export function MobileControls({ playerControllerRef }) {
  const joystickBase = useRef(null);
  const joystickKnob = useRef(null);
  const touchId = useRef(null);
  const baseCenter = useRef({ x: 0, y: 0 });
  const MAX_DIST = 48;

  useEffect(() => {
    const base = joystickBase.current;
    if (!base) return;

    const getKeys = () => playerControllerRef?.current?.keys;

    const resetJoystick = () => {
      const knob = joystickKnob.current;
      if (knob) { knob.style.transform = 'translate(-50%, -50%)'; }
      touchId.current = null;
      const k = getKeys();
      if (k) { k.forward = k.backward = k.left = k.right = false; }
    };

    const onTouchStart = (e) => {
      if (touchId.current !== null) return;
      const touch = e.changedTouches[0];
      touchId.current = touch.identifier;
      const rect = base.getBoundingClientRect();
      baseCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      processTouch(touch);
    };

    const onTouchMove = (e) => {
      for (const touch of e.changedTouches) {
        if (touch.identifier === touchId.current) {
          processTouch(touch);
          break;
        }
      }
    };

    const onTouchEnd = (e) => {
      for (const touch of e.changedTouches) {
        if (touch.identifier === touchId.current) {
          resetJoystick();
          break;
        }
      }
    };

    const processTouch = (touch) => {
      const dx = touch.clientX - baseCenter.current.x;
      const dy = touch.clientY - baseCenter.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clampedDist = Math.min(dist, MAX_DIST);
      const angle = Math.atan2(dy, dx);
      const nx = Math.cos(angle) * clampedDist;
      const ny = Math.sin(angle) * clampedDist;

      const knob = joystickKnob.current;
      if (knob) {
        knob.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
      }

      const k = getKeys();
      if (!k) return;

      const deadzone = 10;
      k.forward  = dy < -deadzone;
      k.backward = dy > deadzone;
      k.left     = dx < -deadzone;
      k.right    = dx > deadzone;
    };

    base.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      base.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  const handleJumpStart = () => {
    const k = playerControllerRef?.current?.keys;
    if (k) k.jump = true;
    // trigger jump velocity immediately
    const pc = playerControllerRef?.current;
    if (pc && pc.isGrounded) {
      pc.velocity.y = pc.jumpForce;
      pc.isGrounded = false;
    }
  };

  const handleJumpEnd = () => {
    const k = playerControllerRef?.current?.keys;
    if (k) k.jump = false;
  };

  const handleRunStart = () => {
    const k = playerControllerRef?.current?.keys;
    if (k) k.run = true;
  };

  const handleRunEnd = () => {
    const k = playerControllerRef?.current?.keys;
    if (k) k.run = false;
  };

  return (
    <div className="mobile-controls-overlay" aria-hidden="true">
      {/* Left: Joystick */}
      <div className="mobile-joystick-zone">
        <div className="mobile-joystick-base" ref={joystickBase}>
          <div className="mobile-joystick-knob" ref={joystickKnob} />
        </div>
      </div>

      {/* Right: Action buttons */}
      <div className="mobile-action-zone">
        <button
          className="mobile-btn mobile-run-btn"
          onTouchStart={handleRunStart}
          onTouchEnd={handleRunEnd}
          onMouseDown={handleRunStart}
          onMouseUp={handleRunEnd}
        >
          🏃 RUN
        </button>
        <button
          className="mobile-btn mobile-jump-btn"
          onTouchStart={handleJumpStart}
          onTouchEnd={handleJumpEnd}
          onMouseDown={handleJumpStart}
          onMouseUp={handleJumpEnd}
        >
          ⬆ JUMP
        </button>
      </div>
    </div>
  );
}

export default MobileControls;
