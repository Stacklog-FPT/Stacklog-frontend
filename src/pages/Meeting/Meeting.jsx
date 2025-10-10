import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Meeting.scss';

// Lightweight helper to parse query params
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Meeting = () => {
  const containerRef = useRef(null);
  const query = useQuery();
  const navigate = useNavigate();

  useEffect(() => {
    const room = query.get('room');
    const displayName = query.get('displayName') || '';
    const type = query.get('type') || 'video';

    if (!room) {
      // Nothing to join — go back
      console.warn('Meeting: missing room param');
      navigate(-1);
      return;
    }

    // Dynamically load the Jitsi External API script if needed
    const loadJitsi = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) return resolve(window.JitsiMeetExternalAPI);
        const s = document.createElement('script');
        s.src = 'https://meet.jit.si/external_api.js';
        s.async = true;
        s.onload = () => resolve(window.JitsiMeetExternalAPI);
        s.onerror = (e) => reject(e);
        document.head.appendChild(s);
      });
    };

    let api = null;
    let mounted = true;

    loadJitsi()
      .then((Jitsi) => {
        if (!mounted) return;
        try {
          const domain = 'meet.jit.si';
          const options = {
            roomName: room,
            parentNode: containerRef.current,
            userInfo: { displayName },
            configOverwrite: { startWithAudioMuted: false, startWithVideoMuted: type === 'audio' },
            interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false },
          };
          api = new Jitsi(domain, options);
        } catch (e) {
          console.error('Failed to init Jitsi', e);
        }
      })
      .catch((err) => {
        console.error('Jitsi script load failed', err);
      });

    return () => {
      mounted = false;
      try {
        if (api && typeof api.dispose === 'function') api.dispose();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="meeting-page">
      <header className="meeting-header">
        <button className="meeting-back" onClick={() => window.history.back()}>Quay lại</button>
        <h1 className="meeting-title">Phòng họp</h1>
      </header>
      <main className="meeting-main">
        <div className="meeting-container" ref={containerRef} />
      </main>
    </div>
  );
};

export default Meeting;
