'use client'

import { useState, useEffect, useCallback } from 'react'

export default function CinematicComet() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showFlash, setShowFlash] = useState(false)
  const [shake, setShake] = useState(false)

  const triggerAnimation = useCallback(() => {
    if (isAnimating) return
    
    setIsAnimating(true)
    
    // Flash and shake at midpoint (~0.8s into 2s animation)
    setTimeout(() => {
      setShowFlash(true)
      setShake(true)
      
      setTimeout(() => setShowFlash(false), 500)
      setTimeout(() => setShake(false), 250)
    }, 800)
    
    // Animation complete - comet has exited
    setTimeout(() => {
      setIsAnimating(false)
    }, 2500)
  }, [isAnimating])

  // Initial play after short delay
  useEffect(() => {
    const timer = setTimeout(triggerAnimation, 800)
    return () => clearTimeout(timer)
  }, []) // Only on mount

  // Random loop every 15-45 seconds
  useEffect(() => {
    if (isAnimating) return
    
    const randomDelay = 15000 + Math.random() * 30000 // 15-45 seconds
    const timer = setTimeout(triggerAnimation, randomDelay)
    return () => clearTimeout(timer)
  }, [isAnimating, triggerAnimation])

  return (
    <>
      {/* Flash/bloom overlay - subtle with fade out */}
      <div 
        className={`fixed inset-0 pointer-events-none z-[6] transition-opacity duration-300 ease-out ${
          showFlash ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 35%, rgba(255,180,120,0.10) 0%, rgba(255,100,50,0.04) 50%, transparent 75%)'
        }}
      />

      {/* Comet container - behind content */}
      <div 
        className={`fixed top-0 left-0 w-full h-screen pointer-events-none z-[5] overflow-hidden ${shake ? 'shake-screen' : ''}`}
        style={{ perspective: '1000px' }}
      >
        {/* The comet itself */}
        <div className={`comet-streaker ${isAnimating ? 'animate' : ''}`}>
          <svg 
            width="300" 
            height="120" 
            viewBox="0 0 300 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: 'visible' }}
          >
            <defs>
              {/* Long horizontal tail gradient */}
              <linearGradient id="streakTail" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="30%" stopColor="rgba(139, 32, 16, 0.1)" />
                <stop offset="60%" stopColor="rgba(200, 70, 40, 0.3)" />
                <stop offset="85%" stopColor="rgba(255, 130, 60, 0.6)" />
                <stop offset="100%" stopColor="rgba(255, 180, 100, 0.9)" />
              </linearGradient>
              
              {/* Hot inner streak */}
              <linearGradient id="streakHot" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="rgba(255, 150, 80, 0.4)" />
                <stop offset="80%" stopColor="rgba(255, 200, 140, 0.8)" />
                <stop offset="100%" stopColor="rgba(255, 240, 220, 1)" />
              </linearGradient>
              
              {/* Core gradient */}
              <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#fff0d0" />
                <stop offset="50%" stopColor="#ffb060" />
                <stop offset="70%" stopColor="#e05030" />
                <stop offset="100%" stopColor="#801008" />
              </radialGradient>
              
              {/* Glow */}
              <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255, 160, 80, 0.9)" />
                <stop offset="50%" stopColor="rgba(255, 100, 50, 0.4)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              
              <filter id="blazeGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            
            {/* Wide diffuse tail */}
            <ellipse 
              cx="140" cy="60" rx="130" ry="25" 
              fill="url(#streakTail)"
              opacity="0.6"
            />
            
            {/* Main tail streak */}
            <ellipse 
              cx="160" cy="60" rx="120" ry="14" 
              fill="url(#streakTail)"
              opacity="0.85"
            />
            
            {/* Hot inner streak */}
            <ellipse 
              cx="180" cy="60" rx="100" ry="7" 
              fill="url(#streakHot)"
              opacity="0.95"
            />
            
            {/* Core streak line */}
            <ellipse 
              cx="200" cy="60" rx="70" ry="3" 
              fill="url(#streakHot)"
            />
            
            {/* Outer glow around head */}
            <circle cx="280" cy="60" r="30" fill="url(#coreGlow)" filter="url(#blazeGlow)" />
            
            {/* Head glow layers */}
            <circle cx="280" cy="60" r="18" fill="rgba(255, 130, 70, 0.7)" filter="url(#blazeGlow)" />
            <circle cx="280" cy="60" r="12" fill="rgba(255, 180, 120, 0.85)" />
            
            {/* Core */}
            <circle cx="280" cy="60" r="8" fill="url(#coreGrad)" filter="url(#blazeGlow)" />
            
            {/* Hot center */}
            <circle cx="280" cy="60" r="4" fill="#fff8f0" />
            <circle cx="280" cy="60" r="2" fill="#ffffff" />
          </svg>
        </div>
      </div>

      <style jsx global>{`
        /* Screen shake */
        .shake-screen {
          animation: screen-shake 0.3s ease-out;
        }
        
        @keyframes screen-shake {
          0%, 100% { transform: translate(0, 0); }
          15% { transform: translate(-3px, 2px); }
          30% { transform: translate(3px, -2px); }
          45% { transform: translate(-2px, 3px); }
          60% { transform: translate(2px, -1px); }
          75% { transform: translate(-1px, 2px); }
          90% { transform: translate(1px, -1px); }
        }
        
        /* Comet streaker - diagonal path top-right to bottom-left */
        .comet-streaker {
          position: absolute;
          top: -5%;
          right: -350px;
          opacity: 0;
          /* Flip horizontally so tail points back to top-right, then rotate for diagonal */
          transform: scaleX(-1) rotate(35deg);
          filter: drop-shadow(0 0 20px rgba(255, 120, 60, 0.8));
          will-change: transform, opacity, top, right;
        }
        
        .comet-streaker.animate {
          animation: streak-diagonal 2s linear forwards;
        }
        
        @keyframes streak-diagonal {
          0% {
            right: -350px;
            top: -5%;
            opacity: 0;
            filter: drop-shadow(0 0 15px rgba(255, 120, 60, 0.6));
          }
          5% {
            opacity: 1;
          }
          50% {
            filter: drop-shadow(0 0 40px rgba(255, 150, 80, 1)) drop-shadow(0 0 70px rgba(255, 100, 50, 0.7));
          }
          95% {
            opacity: 1;
          }
          100% {
            right: calc(100% + 150px);
            top: 70%;
            opacity: 0;
            filter: drop-shadow(0 0 15px rgba(255, 80, 40, 0.4));
          }
        }
        
        /* Mobile - smaller comet, same diagonal */
        @media (max-width: 768px) {
          .comet-streaker {
            transform: scaleX(-1) rotate(35deg) scale(0.6);
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .comet-streaker.animate {
            animation: none;
          }
          .shake-screen {
            animation: none;
          }
        }
      `}</style>
    </>
  )
}
