import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const { socket, connected } = useSocket();

  const [showHostModal, setShowHostModal] = useState(false);
  const [hostPw, setHostPw] = useState('');
  const [hostPwError, setHostPwError] = useState('');
  const [creating, setCreating] = useState(false);
  const pwRef = useRef('');

  useEffect(() => {
    if (!socket) return;
    socket.on('room:created', ({ roomId }) => {
      // Remember the password for this tab so the host isn't asked
      // to re-enter it immediately after setting it.
      sessionStorage.setItem(`tambola_host_pw_${roomId}`, pwRef.current);
      navigate(`/host/${roomId}`);
    });
    socket.on('error', ({ message }) => {
      setCreating(false);
      setHostPwError(message || 'Something went wrong.');
    });
    return () => {
      socket.off('room:created');
      socket.off('error');
    };
  }, [socket, navigate]);

  function openHostModal() {
    if (!socket || !connected) {
      alert("Server is not connected. Please try again.");
      return;
    }
    setHostPw('');
    setHostPwError('');
    setCreating(false);
    setShowHostModal(true);
  }

  function submitHostModal(e) {
    e.preventDefault();
    const pw = hostPw.trim();
    if (!pw) {
      setHostPwError('Enter the host password.');
      return;
    }
    pwRef.current = pw;
    setHostPwError('');
    setCreating(true);
    socket.emit('room:create', { password: pw });
  }

  return (
    <div className="landing">
      {/* Background grid */}
      <div className="landing-grid" />
      <div className="landing-glow" />

      {/* Sponsor / organizer logo bar */}
      <div className="brand-bar">
        <img src="/vit-logo.svg" alt="VIT" className="brand-logo brand-logo--vit" />
        <div className="brand-bar-right">
          <img src="/stellar-logo.webp" alt="VIT-Stellar" className="brand-logo" />
          <img src="/sbi-logo.webp" alt="SBI" className="brand-logo" />
        </div>
      </div>

      <div className="landing-content animate-fadeUp">

        {/* Title */}
        <div className="landing-title">
          <h1>
            <span className="title-main">TAMBOLA</span>
          </h1>
          <p className="title-sub">The official housie game for tambola lovers</p>
        </div>

        {/* Connection status */}
        <div className="conn-status">
          <span className={`dot ${connected ? 'dot-green' : 'dot-red'}`} />
          <span>{connected ? 'Server connected' : 'Connecting...'}</span>
        </div>

        {/* CTA cards */}
        <div className="landing-cards">
          <button className="landing-card landing-card--play" onClick={() => navigate('/play')}>
            <div className="lcard-icon">
              <span className="material-icons">grid_on</span>
            </div>
            <div className="lcard-text">
              <h2>Join Game</h2>
              <p>Enter your name, get your ticket and play!</p>
            </div>
            <span className="material-icons lcard-arrow">arrow_forward</span>
          </button>

          <button className="landing-card landing-card--host" onClick={openHostModal}>
            <div className="lcard-icon">
              <span className="material-icons">manage_accounts</span>
            </div>
            <div className="lcard-text">
              <h2>Host Game</h2>
              <p>Control the game, call numbers and manage winners.</p>
            </div>
            <span className="material-icons lcard-arrow">arrow_forward</span>
          </button>
        </div>

        {/* Rules teaser */}
        <div className="rules-strip">
          {[
            { icon: 'looks_one', label: 'Top Line' },
            { icon: 'looks_two', label: 'Middle Line' },
            { icon: 'looks_3', label: 'Bottom Line' },
            { icon: 'crop_square', label: 'Corners' },
            { icon: 'filter_5', label: 'Early Five' },
            { icon: 'home', label: 'Full House' },
          ].map(r => (
            <div className="rule-chip" key={r.label}>
              <span className="material-icons">{r.icon}</span>
              <span>{r.label}</span>
            </div>
          ))}
        </div>

        <p className="footer-note">
          COPYRIGHT © 2026 | VIT STELLAR
        </p>
      </div>

      {/* Host password modal */}
      {showHostModal && (
        <div className="modal-overlay" onClick={() => !creating && setShowHostModal(false)}>
          <div className="modal-card animate-fadeUp" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Host Password</h2>
              <button className="icon-btn" onClick={() => setShowHostModal(false)} disabled={creating}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <p className="auth-desc" style={{ textAlign: 'left', marginBottom: 0 }}>
              Enter the host password to create a room. You won't need to enter it again in this browser unless you reload the page or switch devices.
            </p>
            <form onSubmit={submitHostModal} className="auth-form">
              <input
                type="password"
                className="auth-input"
                placeholder="Host password"
                value={hostPw}
                onChange={e => setHostPw(e.target.value)}
                autoFocus
                disabled={creating}
              />
              {hostPwError && <p className="auth-error">{hostPwError}</p>}
              <button type="submit" className="btn btn-gold btn-lg" disabled={!connected || creating}>
                <span className="material-icons">{creating ? 'hourglass_top' : 'lock'}</span>
                {creating ? 'Creating…' : 'Create Room'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
