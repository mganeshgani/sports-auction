import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Auction', href: '/' },
    { name: 'Teams', href: '/teams' },
    { name: 'Players', href: '/players' },
    { name: 'Unsold', href: '/unsold' },
    { name: 'Results', href: '/results' },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{
      background: 'linear-gradient(160deg, #000000 0%, #0a0a0a 25%, #1a1a1a 50%, #0f172a 75%, #1a1a1a 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Premium Header */}
      <header className="flex-shrink-0" style={{
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(26, 26, 26, 0.9) 50%, rgba(0, 0, 0, 0.95) 100%)',
        backdropFilter: 'blur(25px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(25px) saturate(1.5)',
        borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.1)'
      }}>
        <div className="max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between h-20">
            {/* Logo Section */}
            <div className="flex items-center -ml-2">
              <div className="flex-shrink-0 flex items-center gap-3">
                <div style={{
                  width: '64px',
                  height: '64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src="/logo.png" 
                    alt="College Logo" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      // Fallback to lightning emoji if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.fallback-icon')) {
                        const fallback = document.createElement('span');
                        fallback.className = 'fallback-icon';
                        fallback.textContent = '⚡';
                        fallback.style.fontSize = '24px';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h1 style={{
                    fontSize: '1.75rem',
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontWeight: 700,
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F0 30%, #FFD700 60%, #D4AF37 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '0.05em',
                    filter: 'drop-shadow(0 2px 10px rgba(212, 175, 55, 0.3))',
                    lineHeight: '1.2'
                  }}>
                    VOLLEY BALL AUCTION
                  </h1>
                  <p style={{
                    fontSize: '0.75rem',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    color: '#D4AF37',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    opacity: 0.9
                  }}>
                    St Aloysius (Deemed To Be University)
                  </p>
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:ml-10 lg:flex lg:space-x-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="group relative"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px 16px',
                        fontSize: '0.8125rem',
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: isActive ? '#FFD700' : '#FFFFFF',
                        background: isActive 
                          ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(255, 215, 0, 0.1) 100%)'
                          : 'transparent',
                        backdropFilter: isActive ? 'blur(10px)' : 'none',
                        border: isActive 
                          ? '1px solid rgba(212, 175, 55, 0.4)'
                          : '1px solid transparent',
                        borderRadius: '10px',
                        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                        textShadow: isActive ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)';
                          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                          e.currentTarget.style.color = '#FFD700';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'transparent';
                          e.currentTarget.style.color = '#FFFFFF';
                        }
                      }}
                    >
                      {item.name}
                      {isActive && (
                        <div style={{
                          position: 'absolute',
                          bottom: '-2px',
                          left: '20px',
                          right: '20px',
                          height: '2px',
                          background: 'linear-gradient(90deg, transparent 0%, #FFD700 50%, transparent 100%)',
                          boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)'
                        }} />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Side - Status/User Area */}
            <div className="flex items-center gap-4">
              <div className="relative" style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, rgba(176, 139, 79, 0.08) 0%, rgba(125, 75, 87, 0.05) 100%)',
                border: '1.5px solid rgba(176, 139, 79, 0.3)',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#B08B4F',
                animation: 'liveBorderGlow 3s ease-in-out infinite',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Animated Border Glow */}
                <span style={{
                  position: 'absolute',
                  inset: '-2px',
                  background: 'linear-gradient(135deg, #B08B4F 0%, #C99D5F 50%, #B08B4F 100%)',
                  backgroundSize: '200% 200%',
                  borderRadius: '20px',
                  filter: 'blur(6px)',
                  opacity: 0.15,
                  animation: 'liveGlowShift 3s ease-in-out infinite',
                  zIndex: -1
                }}></span>
                
                {/* Text with gradient animation */}
                <span style={{
                  background: 'linear-gradient(135deg, #B08B4F 0%, #C99D5F 50%, #B08B4F 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'liveTextShimmer 3s ease-in-out infinite',
                  fontWeight: 700,
                  filter: 'drop-shadow(0 2px 4px rgba(176, 139, 79, 0.3))'
                }}>
                  ● LIVE
                </span>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes liveBorderGlow {
            0%, 100% {
              border-color: rgba(176, 139, 79, 0.25);
              filter: drop-shadow(0 2px 8px rgba(176, 139, 79, 0.15));
            }
            50% {
              border-color: rgba(176, 139, 79, 0.45);
              filter: drop-shadow(0 4px 12px rgba(176, 139, 79, 0.25)) drop-shadow(0 0 20px rgba(176, 139, 79, 0.15));
            }
          }
          
          @keyframes liveGlowShift {
            0%, 100% {
              background-position: 0% 50%;
              opacity: 0.12;
            }
            50% {
              background-position: 100% 50%;
              opacity: 0.2;
            }
          }
          
          @keyframes liveTextShimmer {
            0%, 100% {
              background-position: 0% 50%;
              filter: drop-shadow(0 2px 4px rgba(176, 139, 79, 0.3));
            }
            50% {
              background-position: 100% 50%;
              filter: drop-shadow(0 2px 6px rgba(176, 139, 79, 0.4));
            }
          }
        `}</style>

        {/* Mobile Navigation - Below header */}
        <div className="lg:hidden border-t" style={{
          borderColor: 'rgba(212, 175, 55, 0.2)',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <nav className="flex overflow-x-auto px-4 py-2 gap-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 14px',
                    fontSize: '0.75rem',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: isActive ? '#FFD700' : '#FFFFFF',
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(255, 215, 0, 0.1) 100%)'
                      : 'transparent',
                    border: isActive 
                      ? '1px solid rgba(212, 175, 55, 0.4)'
                      : '1px solid transparent',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                    transition: 'all 300ms'
                  }}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default Layout;