import React, { useState, useEffect, useRef } from 'react';
import { UserRole } from '../types';
import { ArrowRight, User, Store, Mail, AlertCircle, Info, Sparkles } from 'lucide-react';
import { isValidEmail } from '../../shared/email';
import { motion } from 'motion/react';
import heroBgImage from '../assets/images/hero_cleansing_ritual.jpg';
import { useLightMotion } from '../hooks/useLightMotion';
// Types only — erased at build time. Three.js itself is imported dynamically
// below so it never lands in the initial bundle.
import type { Scene, WebGLRenderer } from 'three';

interface HeroProps {
  waitlistCount: number;
  onSuccessRegistration: (data: any) => void;
  onOpenDiagnostic?: () => void;
  selectedRole?: UserRole;
}

export const Hero = React.forwardRef<HTMLDivElement, HeroProps>(({
  waitlistCount,
  onSuccessRegistration,
  selectedRole = 'seeker',
}, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | undefined>(undefined);
  const rendererRef = useRef<WebGLRenderer | undefined>(undefined);
  const animationIdRef = useRef<number | undefined>(undefined);

  const [role, setRole] = useState<UserRole>(selectedRole);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');

  // Phones and reduced-motion visitors get the still, lightweight version.
  const lightMotion = useLightMotion();

  // Synchronize role if prop changes
  useEffect(() => {
    if (selectedRole) {
      setRole(selectedRole);
    }
  }, [selectedRole]);

  // Ambient WebGL light beams. Three.js is loaded on demand, and only on
  // larger screens — phones and reduced-motion visitors never download or run
  // it, which is the single biggest saving on mobile.
  useEffect(() => {
    if (lightMotion || !mountRef.current) return;

    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      const {
        Scene,
        PerspectiveCamera,
        WebGLRenderer,
        QuadraticBezierCurve3,
        Vector3,
        TubeGeometry,
        ShaderMaterial,
        Mesh,
        AdditiveBlending,
        DoubleSide,
        Color,
        PlaneGeometry,
      } = await import('three');

      if (cancelled || !mountRef.current) return;

    const scene = new Scene();
    sceneRef.current = scene;

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
    rendererRef.current = renderer;

    // Rendering at the full retina pixel count is wasted work for a soft,
    // out-of-focus background.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xfaf7f2, 0); // Transparent canvas on top of warm alabaster background
    mountRef.current.appendChild(renderer.domElement);

    // Create warm terracotta & amber curved light geometries
    const curves = [
      new QuadraticBezierCurve3(
        new Vector3(-15, -3, 0),
        new Vector3(0, 1.5, 0),
        new Vector3(12, -2, 0)
      ),
      new QuadraticBezierCurve3(
        new Vector3(-14, -2, 0),
        new Vector3(1, 2.5, 0),
        new Vector3(10, -1, 0)
      ),
      new QuadraticBezierCurve3(
        new Vector3(-16, -4, 0),
        new Vector3(-1, 0.5, 0),
        new Vector3(11, -3, 0)
      )
    ];

    // Navy Blue, Rich Brown, & Ash Slate colors
    const colors = [
      new Color(0x0F172A), // Deep Navy Blue
      new Color(0x8C4A27), // Rich Brown
      new Color(0x64748B), // Ash Slate
    ];

    curves.forEach((curve, index) => {
      // Fewer segments: these are blurred glows, the extra detail is invisible.
      const tubeGeometry = new TubeGeometry(curve, 80, index === 0 ? 0.7 : 0.5, 16, false);

      const vertexShader = `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

      const fragmentShader = `
        uniform float time;
        uniform vec3 color;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vec3 baseColor = color;
          float pulse = sin(time * 1.2 + ${index}.0) * 0.12 + 0.88;
          float gradient = smoothstep(0.0, 1.0, vUv.x);
          float glow = 1.0 - abs(vUv.y - 0.5) * 2.0;
          glow = pow(glow, 2.2);
          
          float fade = 1.0;
          if (vUv.x > 0.75) {
            fade = 1.0 - smoothstep(0.75, 1.0, vUv.x);
          } else if (vUv.x < 0.25) {
            fade = smoothstep(0.0, 0.25, vUv.x);
          }
          
          vec3 finalColor = baseColor * gradient * pulse * glow * fade * 0.7;
          gl_FragColor = vec4(finalColor, glow * fade * 0.35);
        }
      `;

      const material = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          time: { value: 0 },
          color: { value: colors[index] }
        },
        transparent: true,
        blending: AdditiveBlending,
        side: DoubleSide,
      });

      const lightStreak = new Mesh(tubeGeometry, material);
      lightStreak.rotation.z = index * 0.12;
      scene.add(lightStreak);
    });

    // Background gradient plane
    const backgroundGeometry = new PlaneGeometry(80, 55);
    const backgroundMaterial = new ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float time;
        void main() {
          vec3 bg1 = vec3(0.98, 0.97, 0.95);
          vec3 bg2 = vec3(0.96, 0.93, 0.89);
          float timeFactor = sin(time * 0.2) * 0.04;
          vec3 color = mix(bg1, bg2, vUv.x + timeFactor);
          gl_FragColor = vec4(color, 0.25);
        }
      `,
      uniforms: { time: { value: 0 } },
      transparent: true,
      side: DoubleSide,
    });

    const background = new Mesh(backgroundGeometry, backgroundMaterial);
    background.position.z = -5;
    background.position.x = -1;
    scene.add(background);

    camera.position.z = 7;
    camera.position.y = -0.5;
    camera.position.x = 0;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      scene.traverse((object) => {
        if (object instanceof Mesh && object.material instanceof ShaderMaterial) {
          if (object.material.uniforms.time) {
            object.material.uniforms.time.value = time;
          }
        }
      });

      scene.children.forEach((child, index) => {
        if (child instanceof Mesh && index < curves.length) {
          child.rotation.z = Math.sin(time * 0.08 + index * 0.4) * 0.04;
        }
      });

      renderer.render(scene, camera);
    };

    const start = () => {
      if (animationIdRef.current == null) animate();
    };
    const stop = () => {
      if (animationIdRef.current != null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = undefined;
      }
    };

    start();

    // Stop rendering while the tab is in the background.
    const handleVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', handleVisibility);

    // Stop rendering once the hero is scrolled past — no point drawing
    // frames nobody can see.
    const container = mountRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    observer.observe(container);

    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

      cleanup = () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibility);
        observer.disconnect();
        stop();
        if (container && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
        scene.traverse((object) => {
          if (object instanceof Mesh) {
            object.geometry.dispose();
            if (object.material instanceof ShaderMaterial) object.material.dispose();
          }
        });
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [lightMotion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setNoticeMessage('');

    // Same rule the server enforces, so incomplete addresses such as
    // "chiemerie321@gmail" are caught before a request is made.
    if (!isValidEmail(email)) {
      setErrorMessage('Please enter a complete email address, like name@gmail.com.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || data.error || 'Failed to join waitlist. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // The server keeps one row per email, so a repeat signup is reported
      // back rather than being celebrated as a new one.
      if (data.alreadyRegistered) {
        setNoticeMessage(data.message || 'This email is already on the KAHRÀH waitlist.');
        setIsSubmitting(false);
        return;
      }

      onSuccessRegistration(data);
      setEmail('');
    } catch (err) {
      console.error('Waitlist submission error:', err);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // On phones and for reduced-motion visitors the content is simply present —
  // no fade-and-rise on load, which is what makes a page feel sluggish.
  const rise = (delay: number) =>
    lightMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: 'easeOut' as const },
        };

  return (
    <section ref={ref} id="waitlist-hero" className="relative pt-20 sm:pt-32 pb-14 sm:pb-20 overflow-hidden bg-[#2C1D18]">
      {/* Background Hero Image */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <img
          src={heroBgImage}
          alt="Gentle skincare facial cleanse ritual for melanin-rich skin"
          referrerPolicy="no-referrer"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-top sm:object-center"
        />
        {/* Kept light so the photograph stays clearly visible while the
            headline and form above it remain legible. */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#180E0B]/55 via-[#2C1D18]/30 to-[#2C1D18]/70" />
      </div>

      {/* Ambient WebGL canvas — mounted on larger screens only */}
      {!lightMotion && (
        <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-50 mix-blend-screen" style={{ zIndex: 1 }} />
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Hero Title */}
        <motion.h1
          {...rise(0.1)}
          className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#FFFDF9] tracking-tight leading-[1.1] mb-5 drop-shadow-md"
        >
          Skincare that finally <br className="hidden sm:inline" />
          <span className="text-[#F2C4A2] drop-shadow-sm">understands your skin.</span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          {...rise(0.2)}
          className="font-sans text-base sm:text-lg text-[#F5EBE1] max-w-2xl mx-auto leading-relaxed mb-8 drop-shadow-sm font-medium"
        >
          Get early access to KAHRÀH — precision AI skin diagnostics and algorithmic formulation matching built specifically for melanin-rich skin.
        </motion.p>

        {/* Glassmorphism Waitlist Card */}
        <motion.div
          {...rise(0.3)}
          className="max-w-xl mx-auto bg-white/95 sm:backdrop-blur-xl border border-[#E8DFD3] p-5 sm:p-8 rounded-[5px] shadow-xl relative z-10 text-left"
        >
          {/* Role Toggle Selector */}
          <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-0 bg-[#FAF6F0] p-1.5 rounded-[5px] mb-6 border border-[#E8DFD3]">
            <button
              type="button"
              onClick={() => setRole('seeker')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-[5px] transition-all duration-200 cursor-pointer ${
                role === 'seeker'
                  ? 'bg-[#8C4A27] text-[#FFFDF9] shadow-xs'
                  : 'text-[#64748B] hover:text-[#2C1D18]'
              }`}
            >
              <User className={`w-4 h-4 ${role === 'seeker' ? 'text-[#FFFDF9]' : ''}`} />
              <span>I'm a Skincare Seeker</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('vendor')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-[5px] transition-all duration-200 cursor-pointer ${
                role === 'vendor'
                  ? 'bg-[#8C4A27] text-[#FFFDF9] shadow-xs'
                  : 'text-[#64748B] hover:text-[#2C1D18]'
              }`}
            >
              <Store className={`w-4 h-4 ${role === 'vendor' ? 'text-[#FFFDF9]' : ''}`} />
              <span>Verified Vendor / Brand</span>
            </button>
          </div>

          {/* Explains which of the two signup types the visitor is choosing */}
          <div className="flex items-start gap-2.5 mb-5 p-3 rounded-[5px] bg-[#FAF6F0] border border-[#E8DFD3]">
            {role === 'seeker' ? (
              <User className="w-4 h-4 text-[#8C4A27] shrink-0 mt-0.5" />
            ) : (
              <Store className="w-4 h-4 text-[#8C4A27] shrink-0 mt-0.5" />
            )}
            <p className="text-xs text-[#64748B] leading-relaxed">
              {role === 'seeker' ? (
                <>
                  <span className="font-semibold text-[#2C1D18]">Skincare Seeker</span> — you're
                  joining as a customer. Get AI skin diagnostics, personalised routines, and early
                  access to products matched to your skin.
                </>
              ) : (
                <>
                  <span className="font-semibold text-[#2C1D18]">Vendor / Brand</span> — you're
                  joining as a seller. Apply to list your lab-tested, bleach-free formulations on the
                  KAHRÀH marketplace and reach matched customers.
                </>
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="hero-email" className="block text-xs font-eyebrow font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                Email Address <span className="text-[#8C4A27]">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  id="hero-email"
                  type="email"
                  required
                  placeholder={role === 'seeker' ? 'amara@example.com' : 'brand@verifiedskincare.com'}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                    if (noticeMessage) setNoticeMessage('');
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-[#FFFDF9] border border-[#E8DFD3] rounded-[5px] text-sm text-[#2C1D18] placeholder-[#94A3B8] focus:outline-none input-warm-focus transition-all"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 p-2.5 rounded-[5px] border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {noticeMessage && (
              <div className="flex items-center gap-2 text-xs text-[#8C4A27] bg-[#FAF6F0] p-2.5 rounded-[5px] border border-[#E8DFD3]">
                <Info className="w-4 h-4 shrink-0" />
                <span>{noticeMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 font-sans font-bold text-sm text-[#FFFDF9] bg-[#8C4A27] hover:bg-[#70381C] active:bg-[#582B14] rounded-[5px] shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer border border-[#8C4A27]"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {role === 'seeker' ? 'Join Priority Waitlist' : 'Submit Vendor Application'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#FFFDF9] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
});

Hero.displayName = 'Hero';
