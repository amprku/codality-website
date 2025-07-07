class InteractiveCrosshairLogo {
    constructor(container) {
        this.container = container;
        this.canvas = container.querySelector('.background-logo-canvas');
        this.mouse = new THREE.Vector2();
        this.isAnimating = false;
        this.time = 0;
        this.particles = [];
        this.energyLevel = 0;
        this.lastClickTime = 0;
        this.isLoading = true;
        this.loadProgress = 0;
        this.loadStartTime = Date.now();
        
        // Add loading class to body to disable scrolling during intro animation
        document.body.classList.add('loading');
        
        this.init();
        this.createParticleSystem();
        this.createLighting();
        this.createLogo();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.container.offsetWidth / this.container.offsetHeight, 
            0.1, 
            1000
        );
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.camera.position.z = 8;
    }
    
    createLighting() {
        // Enhanced ambient light for better material visibility
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(this.ambientLight);
        
        // Point light that follows mouse
        this.pointLight = new THREE.PointLight(0xff7700, 1.5, 15);
        this.pointLight.position.set(0, 0, 5);
        this.scene.add(this.pointLight);
        
        // Primary directional light for main illumination
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        this.directionalLight.position.set(5, 5, 5);
        this.directionalLight.castShadow = true;
        this.scene.add(this.directionalLight);
        
        // Secondary directional light for fill
        this.fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        this.fillLight.position.set(-3, -2, 3);
        this.scene.add(this.fillLight);
        
        // Rim light for edge highlighting - enhanced blue
        this.rimLight = new THREE.DirectionalLight(0x00a8ff, 0.8);
        this.rimLight.position.set(0, 0, -2);
        this.scene.add(this.rimLight);
        
        // Bottom rim light for underside illumination - same color
        this.bottomRimLight = new THREE.DirectionalLight(0x00a8ff, 0.8);
        this.bottomRimLight.position.set(0, -2, 0);
        this.scene.add(this.bottomRimLight);
        
        // Additional blue accent light
        this.blueAccentLight = new THREE.DirectionalLight(0x00a8ff, 0.4);
        this.blueAccentLight.position.set(2, -2, 2);
        this.scene.add(this.blueAccentLight);
        
        // Create environment map for reflections
        this.createEnvironmentMap();
    }
    
    createEnvironmentMap() {
        // Create a simple environment map for reflections
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Create a gradient environment
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, '#e0e0e0');
        gradient.addColorStop(0.7, '#404040');
        gradient.addColorStop(1, '#000000');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        // Add some industrial-looking elements
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = 5 + Math.random() * 15;
            
            ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.2})`;
            ctx.fillRect(x, y, size, size);
        }
        
        const envTexture = new THREE.CanvasTexture(canvas);
        envTexture.mapping = THREE.EquirectangularReflectionMapping;
        
        this.scene.environment = envTexture;
    }
    
    createParticleSystem() {
        this.particleGroup = new THREE.Group();
        
        // Create particle geometry
        const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0xff7700,
            transparent: true,
            opacity: 0.8
        });
        
        // Create particles in a sphere around the logo
        for (let i = 0; i < 50; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
            
            // Random position in a sphere
            const radius = 4 + Math.random() * 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            
            particle.position.x = radius * Math.sin(phi) * Math.cos(theta);
            particle.position.y = radius * Math.sin(phi) * Math.sin(theta);
            particle.position.z = radius * Math.cos(phi);
            
            particle.userData = {
                originalPosition: particle.position.clone(),
                speed: 0.01 + Math.random() * 0.02,
                angle: Math.random() * Math.PI * 2,
                radius: radius
            };
            
            this.particles.push(particle);
            this.particleGroup.add(particle);
        }
        
        this.scene.add(this.particleGroup);
    }
    
    createRing(innerRadius, outerRadius, segments = 64) {
        const shape = new THREE.Shape();
        shape.arc(0, 0, outerRadius, 0, Math.PI * 2, false);
        
        const hole = new THREE.Path();
        hole.arc(0, 0, innerRadius, 0, Math.PI * 2, true);
        shape.holes.push(hole);
        
        return new THREE.ShapeGeometry(shape, segments);
    }
    
    createSegmentedRing(innerRadius, outerRadius, segments = 8, gapAngle = 0.3, ringIndex = 0) {
        const group = new THREE.Group();
        const segmentAngle = (Math.PI * 2) / segments;
        
        for (let i = 0; i < segments; i++) {
            const startAngle = i * segmentAngle + gapAngle / 2;
            const endAngle = (i + 1) * segmentAngle - gapAngle / 2;
            
            const shape = new THREE.Shape();
            shape.arc(0, 0, outerRadius, startAngle, endAngle, false);
            shape.arc(0, 0, innerRadius, endAngle, startAngle, true);
            
            // Extrude the shape to give it depth
            const extrudeSettings = {
                depth: 0.1,
                bevelEnabled: true,
                bevelThickness: 0.02,
                bevelSize: 0.01,
                bevelOffset: 0,
                bevelSegments: 3
            };
            
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const material = this.createIndustrialMaterial(ringIndex, i);
            const segment = new THREE.Mesh(geometry, material);
            
            // Add subtle random rotation for more organic feel
            segment.rotation.z = (Math.random() - 0.5) * 0.1;
            
            group.add(segment);
        }
        
        return group;
    }
    
    createIndustrialMaterial(ringIndex, segmentIndex) {
        // Create industrial texture with metallic properties
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Base color based on ring index - much more subtle
        let baseColor, highlightColor, shadowColor;
        
        if (ringIndex === 0) { // Outer ring - very subtle steel
            baseColor = '#3a3a3a';
            highlightColor = '#5a5a5a';
            shadowColor = '#2a2a2a';
        } else if (ringIndex === 1) { // Middle ring - subtle aluminum
            baseColor = '#4a5a6a';
            highlightColor = '#6a7a8a';
            shadowColor = '#3a4a5a';
        } else { // Inner ring - subtle blue
            baseColor = '#004466';
            highlightColor = '#006688';
            shadowColor = '#003344';
        }
        
        // Create industrial texture pattern
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 512, 512);
        
        // Add brushed metal effect
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const length = 20 + Math.random() * 60;
            const width = 1 + Math.random() * 3;
            const angle = Math.random() * Math.PI * 2;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            
            const gradient = ctx.createLinearGradient(-length/2, 0, length/2, 0);
            gradient.addColorStop(0, 'rgba(0,0,0,0.1)');
            gradient.addColorStop(0.5, highlightColor);
            gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(-length/2, -width/2, length, width);
            ctx.restore();
        }
        
        // Add subtle noise pattern
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 2;
            
            ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`;
            ctx.fillRect(x, y, size, size);
        }
        
        // Add directional highlights for depth
        const highlightGradient = ctx.createLinearGradient(0, 0, 512, 512);
        highlightGradient.addColorStop(0, `rgba(255,255,255,0.1)`);
        highlightGradient.addColorStop(0.5, 'rgba(0,0,0,0)');
        highlightGradient.addColorStop(1, `rgba(0,0,0,0.2)`);
        
        ctx.fillStyle = highlightGradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Create normal map for better lighting
        const normalCanvas = document.createElement('canvas');
        normalCanvas.width = 512;
        normalCanvas.height = 512;
        const normalCtx = normalCanvas.getContext('2d');
        
        // Generate normal map from the texture
        const imageData = ctx.getImageData(0, 0, 512, 512);
        const normalData = normalCtx.createImageData(512, 512);
        
        for (let i = 0; i < imageData.data.length; i += 4) {
            const x = (i / 4) % 512;
            const y = Math.floor((i / 4) / 512);
            
            // Sample neighboring pixels for normal calculation
            const left = x > 0 ? imageData.data[i - 4] : imageData.data[i];
            const right = x < 511 ? imageData.data[i + 4] : imageData.data[i];
            const up = y > 0 ? imageData.data[i - 512 * 4] : imageData.data[i];
            const down = y < 511 ? imageData.data[i + 512 * 4] : imageData.data[i];
            
            const dx = (right - left) / 255;
            const dy = (down - up) / 255;
            const dz = 0.5;
            
            // Normalize and convert to RGB
            const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
            normalData.data[i] = ((dx / length) + 1) * 127.5;     // R
            normalData.data[i + 1] = ((dy / length) + 1) * 127.5; // G
            normalData.data[i + 2] = ((dz / length) + 1) * 127.5; // B
            normalData.data[i + 3] = 255;                         // A
        }
        
        normalCtx.putImageData(normalData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        const normalMap = new THREE.CanvasTexture(normalCanvas);
        
        // Create metallic material with proper lighting - much more subtle
        return new THREE.MeshStandardMaterial({
            map: texture,
            normalMap: normalMap,
            metalness: 0.6,
            roughness: 0.5 + Math.random() * 0.3, // More rough for subtlety
            transparent: true,
            opacity: 0.4, // Much lower opacity
            envMapIntensity: 0.3 // Lower environment map intensity
        });
    }
    
    createCrosshairCircle(radius, thickness = 0.1, color = 0xffffff) {
        const geometry = new THREE.RingGeometry(radius - thickness, radius + thickness, 128);
        
        // Create textured material with animated properties
        const material = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const circle = new THREE.Mesh(geometry, material);
        
        // Add animation properties
        circle.userData = {
            originalRadius: radius,
            pulseSpeed: 0.02 + Math.random() * 0.01,
            pulsePhase: Math.random() * Math.PI * 2,
            rotationSpeed: 0.005 + Math.random() * 0.01,
            opacitySpeed: 0.03 + Math.random() * 0.02,
            opacityPhase: Math.random() * Math.PI * 2
        };
        
        return circle;
    }
    
    createCrosshairLine(length, width, gap = 0.4) {
        // Create two segments with a gap in the center
        const group = new THREE.Group();
        const segmentLength = (length - gap) / 2;
        // Left/Top segment
        const geometry1 = new THREE.PlaneGeometry(segmentLength, width);
        const material1 = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 1.0, // Full opacity for maximum visibility
            side: THREE.DoubleSide // Ensure visibility from both sides
        });
        const mesh1 = new THREE.Mesh(geometry1, material1);
        // Right/Bottom segment
        const geometry2 = new THREE.PlaneGeometry(segmentLength, width);
        const material2 = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 1.0, // Full opacity for maximum visibility
            side: THREE.DoubleSide // Ensure visibility from both sides
        });
        const mesh2 = new THREE.Mesh(geometry2, material2);
        // Position segments
        mesh1.position.x = -(gap / 2 + segmentLength / 2);
        mesh2.position.x = (gap / 2 + segmentLength / 2);
        group.add(mesh1);
        group.add(mesh2);
        // Add animation properties to group for compatibility
        group.userData = {
            originalLength: length,
            originalWidth: width,
            gap: gap,
            segmentLength: segmentLength,
            pulseSpeed: 0.015 + Math.random() * 0.01,
            pulsePhase: Math.random() * Math.PI * 2,
            rotationSpeed: 0.003 + Math.random() * 0.005,
            opacitySpeed: 0.025 + Math.random() * 0.015,
            opacityPhase: Math.random() * Math.PI * 2,
            waveSpeed: 0.02 + Math.random() * 0.01,
            wavePhase: Math.random() * Math.PI * 2
        };
        return group;
    }
    
    createCenterDot() {
        const geometry = new THREE.CircleGeometry(0.2, 32); // Increased size
        
        // Create a more interesting material with glow effect
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xff9933,
            transparent: true,
            opacity: 1.0, // Full opacity
            side: THREE.DoubleSide // Ensure it's visible from both sides
        });
        
        const centerDot = new THREE.Mesh(geometry, material);
        
        // Add a glow ring around the center dot
        const glowGeometry = new THREE.RingGeometry(0.25, 0.35, 32); // Increased size
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff9933,
            transparent: true,
            opacity: 0.6, // Increased opacity
            side: THREE.DoubleSide
        });
        
        const glowRing = new THREE.Mesh(glowGeometry, glowMaterial);
        centerDot.add(glowRing);
        
        // Add inner detail ring
        const innerRingGeometry = new THREE.RingGeometry(0.12, 0.18, 16); // Increased size
        const innerRingMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8, // Increased opacity
            side: THREE.DoubleSide
        });
        
        const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
        centerDot.add(innerRing);
        
        return centerDot;
    }
    
    createSemiCircle(radius, colorStart, colorEnd, arcLength = 0.85) {
        const geometry = new THREE.RingGeometry(radius- 0.05, radius + 0.05, 64, 1, (Math.PI * 2) * .5, (Math.PI * 2) * arcLength);
        const material = new THREE.MeshBasicMaterial({
            color: colorStart,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        const semiCircle = new THREE.Mesh(geometry, material);
        semiCircle.userData = {
            rotationSpeed: 0.01 + Math.random() * 0.01,
            colorStart: new THREE.Color(colorStart),
            colorEnd: new THREE.Color(colorEnd)
        };
        return semiCircle;
    }
    
    createLogo() {
        this.logoGroup = new THREE.Group();
        
        // Create rings with proper z-layering and depth - much more separation
        this.outerRing = this.createSegmentedRing(2.8, 3.5, 8, 0.4, 0);
        this.outerRing.position.z = -1.25;
        this.logoGroup.add(this.outerRing);
        
        this.middleRing = this.createSegmentedRing(2.2, 2.6, 8, 0.3, 1);
        this.middleRing.position.z = -0.75;
        this.logoGroup.add(this.middleRing);
        
        this.innerRing = this.createSegmentedRing(1.5, 1.8, 6, 0.5, 2);
        this.innerRing.position.z = -0.5;
        this.logoGroup.add(this.innerRing);
        
        // Create crosshair circles
        // Small inner circle at the gap
        this.innerGapCircle = this.createCrosshairCircle(0.6, 0.04,  0xffff66); // aligns with gap start
        this.innerGapCircle.position.z = 0.15;
        this.logoGroup.add(this.innerGapCircle);

        // Main outer circle just inside the line ends
        this.outerMainCircle = this.createCrosshairCircle(2.2, 0.05, 0xffcc33); // smaller, inside the lines
        this.outerMainCircle.position.z = 0.15;
        this.logoGroup.add(this.outerMainCircle);

        // Supplemental, less pronounced outer circle, with a bigger gap
        this.outerSubtleCircle = this.createCrosshairCircle(1.7, 0.03, 0xff9933); // much smaller, bigger gap
        this.outerSubtleCircle.material.opacity = 0.25;
        this.outerSubtleCircle.position.z = 0.15;
        this.logoGroup.add(this.outerSubtleCircle);
        
        // Add semi-circles to the logo group
        this.innerSemiCircle = this.createSemiCircle(0.6, 0xffff66, 0xffff00, .85);
        this.innerSemiCircle.position.z = 0.16;
        this.logoGroup.add(this.innerSemiCircle);

        this.outerMainSemiCircle = this.createSemiCircle(1.7, 0xffcc33, 0xffcc00, .75);
        this.outerMainSemiCircle.position.z = 0.16;
        this.logoGroup.add(this.outerMainSemiCircle);

        this.outerSemiCircle = this.createSemiCircle(2.2, 0xff9933, 0xff7700, .70);
        this.outerSemiCircle.position.z = 0.16;
        this.logoGroup.add(this.outerSemiCircle);

        // Create crosshair lines
        this.horizontalLine = this.createCrosshairLine(6, 0.2, 1.5); // increase gap to 1.2 units
        this.horizontalLine.position.z = 0.4;
        this.logoGroup.add(this.horizontalLine);
        this.verticalLine = this.createCrosshairLine(6, 0.2, 1.5); // increase gap to 1.2 units
        this.verticalLine.rotation.z = Math.PI / 2;
        this.verticalLine.position.z = 0.4;
        this.logoGroup.add(this.verticalLine);
        
        // Create center dot
        this.centerDot = this.createCenterDot();
        this.centerDot.position.z = 0.6;
        this.logoGroup.add(this.centerDot);
        
        
        // Set initial states for loading animation
        this.setInitialLoadStates();
        
        this.scene.add(this.logoGroup);
    }
    
    setInitialLoadStates() {
        // Make logo group visible but elements start hidden
        this.logoGroup.visible = true;
        
        // Set crosshair elements to zero scale and opacity
        [this.innerGapCircle, this.outerMainCircle, this.outerSubtleCircle].forEach(circle => {
            if (circle) {
                circle.material.opacity = 0;
            }
        });
        
        [this.horizontalLine, this.verticalLine].forEach((line, i) => {
            if (line) {
                line.scale.set(0, 0, 0); // Start with zero scale
                line.rotation.z = i === 0 ? 0 : Math.PI / 2;
                line.children.forEach(segment => segment.material.opacity = 0); // Start with zero opacity
            }
        });
        
        // Start center dot with a more visible scale for debugging
        this.centerDot.scale.set(0.3, 0.3, 0.3); // Start with more visible scale
        this.centerDot.material.opacity = 0.8; // Start with higher opacity
        
        // Also set children to visible state
        if (this.centerDot.children[0]) {
            this.centerDot.children[0].material.opacity = 0.4;
        }
        if (this.centerDot.children[1]) {
            this.centerDot.children[1].material.opacity = 0.5;
        }
        
        // Set rings to zero opacity and scale, but maintain subtle metallic properties
        [this.outerRing, this.middleRing, this.innerRing].forEach((ring, ringIndex) => {
            if (ring) {
                ring.children.forEach((segment, segmentIndex) => {
                    segment.material.opacity = 0;
                    
                    // Ensure subtle metallic properties are set from the start
                    if (ringIndex === 0) { // Outer ring - very subtle steel
                        segment.material.metalness = 0.6;
                        segment.material.roughness = 0.5 + Math.random() * 0.3;
                    } else if (ringIndex === 1) { // Middle ring - subtle aluminum
                        segment.material.metalness = 0.5;
                        segment.material.roughness = 0.6 + Math.random() * 0.3;
                    } else { // Inner ring - subtle blue
                        segment.material.metalness = 0.7;
                        segment.material.roughness = 0.4 + Math.random() * 0.3;
                    }
                    
                    // Ensure lower environment map intensity for subtlety
                    segment.material.envMapIntensity = 0.3;
                });
            }
        });

        [this.innerSemiCircle, this.outerMainSemiCircle, this.outerSemiCircle].forEach(semiCircle => {
            if (semiCircle && semiCircle.userData) {
                semiCircle.material.opacity = 0;
            }
        });
        
    }
    
    setupEventListeners() {
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('click', this.onClick);
        window.addEventListener('resize', this.onWindowResize);
    }
    
    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
        
        // Update point light position
        this.pointLight.position.x = this.mouse.x * 3;
        this.pointLight.position.y = this.mouse.y * 3;
        
        // Create subtle particle trail
        if (Math.random() < 0.1) {
            this.createTrailParticle(event.clientX, event.clientY);
        }
    }
    
    createTrailParticle(x, y) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.01, 4, 4),
            new THREE.MeshBasicMaterial({
                color: 0xff7700,
                transparent: true,
                opacity: 1
            })
        );
        
        // Convert screen coordinates to world coordinates
        const vector = new THREE.Vector3();
        vector.set(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1,
            0.5
        );
        vector.unproject(this.camera);
        const dir = vector.sub(this.camera.position).normalize();
        const distance = -this.camera.position.z / dir.z;
        const pos = this.camera.position.clone().add(dir.multiplyScalar(distance));
        
        particle.position.copy(pos);
        particle.userData = {
            life: 1.0,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01
            )
        };
        
        this.scene.add(particle);
        
        // Animate and remove particle
        const animateParticle = () => {
            if (particle.userData.life > 0) {
                particle.userData.life -= 0.02;
                particle.position.add(particle.userData.velocity);
                particle.material.opacity = particle.userData.life;
                particle.scale.setScalar(1 + (1 - particle.userData.life) * 2);
                requestAnimationFrame(animateParticle);
            } else {
                this.scene.remove(particle);
            }
        };
        animateParticle();
    }
    
    onClick(event) {
        // Disable click animations during loading
        if (this.isLoading) {
            return;
        }
        
        // Check if the click was on a CTA button
        const isCTAClick = event.target.closest('.cta-primary, .cta-secondary, .submit-btn, .industry-cta');
        
        if (isCTAClick) {
            // CTA click - rapid spinning animation
            this.isAnimating = !this.isAnimating;
            this.lastClickTime = Date.now();
            
            // Create explosion effect
            this.createExplosion();
            
            // Activate energy field
            const energyField = document.querySelector('.energy-field');
            if (energyField) {
                if (this.isAnimating) {
                    energyField.classList.add('active');
                } else {
                    energyField.classList.remove('active');
                }
            }
            
            // Create ripple effect
            this.createRippleEffect();
        } else {
            // Non-CTA click - subtle effect
            this.createSubtleClickEffect();
        }
    }
    
    createRippleEffect() {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 0;
            height: 0;
            border: 2px solid rgba(255, 119, 0, 0.8);
            border-radius: 50%;
            pointer-events: none;
            z-index: 999;
            animation: rippleExpand 1s ease-out forwards;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rippleExpand {
                0% {
                    width: 0;
                    height: 0;
                    opacity: 1;
                }
                100% {
                    width: 300px;
                    height: 300px;
                    opacity: 0;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            document.body.removeChild(ripple);
        }, 1000);
    }
    
    createSubtleClickEffect() {
        // Create a more visible ripple
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 0;
            height: 0;
            border: 2px solid rgba(255, 119, 0, 0.6);
            border-radius: 50%;
            pointer-events: none;
            z-index: 999;
            animation: subtleRippleExpand 1.2s ease-out forwards;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes subtleRippleExpand {
                0% {
                    width: 0;
                    height: 0;
                    opacity: 1;
                }
                100% {
                    width: 200px;
                    height: 200px;
                    opacity: 0;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(ripple);
        
        // Create more visible particles
        for (let i = 0; i < 8; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.015, 6, 6),
                new THREE.MeshBasicMaterial({
                    color: 0xff7700,
                    transparent: true,
                    opacity: 0.8
                })
            );
            
            particle.position.copy(this.centerDot.position);
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.04,
                (Math.random() - 0.5) * 0.04,
                (Math.random() - 0.5) * 0.04
            );
            particle.life = 1.5;
            
            this.scene.add(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                this.scene.remove(particle);
            }, 1500);
        }
        
        // Enhanced logo pulse
        const originalScale = this.logoGroup.scale.clone();
        this.logoGroup.scale.multiplyScalar(1.08);
        
        // Animate scale back to normal
        const animatePulse = () => {
            this.logoGroup.scale.lerp(originalScale, 0.05);
            if (this.logoGroup.scale.distanceTo(originalScale) > 0.01) {
                requestAnimationFrame(animatePulse);
            }
        };
        animatePulse();
        
        // Animate outer rings with a quick spin
        const originalRotations = {
            outer: this.outerRing.rotation.z,
            middle: this.middleRing.rotation.z,
            inner: this.innerRing.rotation.z
        };
        
        // Quick spin animation for rings
        const spinDuration = 1200; // 1.2 seconds
        const startTime = Date.now();
        
        const animateRings = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            
            // Easing function for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            // Rotate rings with decreasing speed
            this.outerRing.rotation.z = originalRotations.outer + (Math.PI * 2 * easeOut);
            this.middleRing.rotation.z = originalRotations.middle - (Math.PI * 1.5 * easeOut);
            this.innerRing.rotation.z = originalRotations.inner + (Math.PI * 1.8 * easeOut);
            
            if (progress < 1) {
                requestAnimationFrame(animateRings);
            }
        };
        animateRings();
        
        // Brief color flash effect
        const originalColors = {
            center: this.centerDot.material.color.clone(),
            outer: this.outerRing.children[0]?.material.color.clone(),
            middle: this.middleRing.children[0]?.material.color.clone(),
            inner: this.innerRing.children[0]?.material.color.clone()
        };
        
        // Flash to brighter colors
        this.centerDot.material.color.setHSL(0.08, 0.9, 0.8);
        this.outerRing.children.forEach(segment => {
            segment.material.color.setHSL(0.08, 0.7, 0.7); // Bright orange
        });
        this.middleRing.children.forEach(segment => {
            segment.material.color.setHSL(0.08, 0.8, 0.7); // Medium orange
        });
        this.innerRing.children.forEach(segment => {
            segment.material.color.setHSL(0.08, 0.9, 0.7); // Vibrant orange
        });
        
        // Return to original colors
        setTimeout(() => {
            this.centerDot.material.color.copy(originalColors.center);
            this.outerRing.children.forEach((segment, i) => {
                segment.material.color.copy(originalColors.outer);
            });
            this.middleRing.children.forEach((segment, i) => {
                segment.material.color.copy(originalColors.middle);
            });
            this.innerRing.children.forEach((segment, i) => {
                segment.material.color.copy(originalColors.inner);
            });
        }, 600);
        
        // Brief energy field activation
        const energyField = document.querySelector('.energy-field');
        if (energyField) {
            energyField.classList.add('active');
            setTimeout(() => {
                energyField.classList.remove('active');
            }, 900);
        }
        
        setTimeout(() => {
            document.body.removeChild(ripple);
        }, 1200);
    }
    
    onKeyPress(event) {
        // Removed spacebar handling to allow form input
    }
    
    createExplosion() {
        // Create temporary explosion particles
        for (let i = 0; i < 20; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.02, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: 0xff7700,
                    transparent: true,
                    opacity: 1
                })
            );
            
            particle.position.copy(this.centerDot.position);
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2
            );
            particle.life = 1.0;
            
            this.scene.add(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                this.scene.remove(particle);
            }, 1000);
        }
    }
    
    onWindowResize() {
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            const data = particle.userData;
            
            // Orbit around the logo
            data.angle += data.speed;
            particle.position.x = data.originalPosition.x + Math.cos(data.angle) * 0.5;
            particle.position.y = data.originalPosition.y + Math.sin(data.angle) * 0.5;
            
            // Pulse opacity
            particle.material.opacity = 0.3 + Math.sin(this.time * 2 + data.angle) * 0.4;
            
            // React to animation state
            if (this.isAnimating) {
                particle.material.color.setHSL(0.6, 0.8, 0.7);
                particle.scale.setScalar(1.5);
            } else {
                particle.material.color.setHSL(0.6, 0.6, 0.5);
                particle.scale.setScalar(1);
            }
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.01;
        this.energyLevel = Math.max(0, this.energyLevel - 0.02);
        
        // Update particles
        this.updateParticles();
        // Handle loading animation
        if (this.isLoading) {
            this.updateLoadAnimation();
            this.renderer.render(this.scene, this.camera);
            return;
        }
        
        // Mouse interaction
        const targetRotationY = this.mouse.x * 0.3;
        const targetRotationX = this.mouse.y * 0.3;
        
        this.logoGroup.rotation.y += (targetRotationY - this.logoGroup.rotation.y) * 0.05;
        this.logoGroup.rotation.x += (targetRotationX - this.logoGroup.rotation.x) * 0.05;
        
        
        if (this.isAnimating) {
            this.energyLevel = Math.min(1, this.energyLevel + 0.05);
            
            // Fast rotation when animating
            this.outerRing.rotation.z += 0.02;
            this.middleRing.rotation.z -= 0.025;
            this.innerRing.rotation.z += 0.03;
            this.innerGapCircle.rotation.z += 0.015;
            this.outerMainCircle.rotation.z -= 0.02;
            this.outerSubtleCircle.rotation.z += 0.01;
            
            // Subtle pulsing effect
            const scale = 1 + Math.sin(this.time * 2) * 0.02;
            this.logoGroup.scale.set(scale, scale, scale);
            
            // Dynamic color shifting - vibrant blue for center
            const hue = 200 + Math.sin(this.time * 2) * 20; // Constrain to vibrant blue range (180-220)
            this.centerDot.material.color.setHSL(hue / 360, 0.9, 0.7);
            
            // Center dot pulsing and rotation
            const centerPulse = 1 + Math.sin(this.time * 4) * 0.1;
            this.centerDot.scale.set(centerPulse, centerPulse, centerPulse);
            this.centerDot.rotation.z += 0.02;
            
            // Glow ring animation
            if (this.centerDot.children[0]) {
                this.centerDot.children[0].material.opacity = 0.4 + Math.sin(this.time * 3) * 0.2;
                this.centerDot.children[0].rotation.z -= 0.01;
            }
            
            // Inner ring animation
            if (this.centerDot.children[1]) {
                this.centerDot.children[1].material.opacity = 0.6 + Math.sin(this.time * 2) * 0.3;
                this.centerDot.children[1].rotation.z += 0.015;
            }
            
            // Enhanced lighting
            this.pointLight.intensity = 1 + Math.sin(this.time * 3) * 0.5;
            this.pointLight.color.setHSL(hue / 360, 0.8, 0.6);
            
            // Subtle material animations for background rings
            this.outerRing.children.forEach((segment, i) => {
                segment.material.metalness = 0.6 + Math.sin(this.time * 1.5 + i * 0.3) * 0.05;
                segment.material.roughness = 0.5 + Math.sin(this.time * 1.2 + i * 0.4) * 0.05;
            });
            
            this.middleRing.children.forEach((segment, i) => {
                segment.material.metalness = 0.5 + Math.sin(this.time * 1.8 + i * 0.3) * 0.05;
                segment.material.roughness = 0.6 + Math.sin(this.time * 1.5 + i * 0.4) * 0.05;
            });
            
            this.innerRing.children.forEach((segment, i) => {
                segment.material.metalness = 0.7 + Math.sin(this.time * 1.3 + i * 0.3) * 0.05;
                segment.material.roughness = 0.4 + Math.sin(this.time * 1.6 + i * 0.4) * 0.05;
            });
            
        } 
        else {
            // Gentle idle rotation
            this.outerRing.rotation.z += 0.003;
            this.middleRing.rotation.z -= 0.002;
            this.innerRing.rotation.z += 0.004;
            this.innerGapCircle.rotation.z += 0.0015;
            this.outerMainCircle.rotation.z -= 0.002;
            this.outerSubtleCircle.rotation.z += 0.001;
            
            // Return to normal scale
            const targetScale = 1;
            this.logoGroup.scale.x += (targetScale - this.logoGroup.scale.x) * 0.1;
            this.logoGroup.scale.y += (targetScale - this.logoGroup.scale.y) * 0.1;
            this.logoGroup.scale.z += (targetScale - this.logoGroup.scale.z) * 0.1;
            
            // Gentle center dot animation
            this.centerDot.rotation.z += 0.005;
            const gentlePulse = 1 + Math.sin(this.time * 1) * 0.02;
            this.centerDot.scale.set(gentlePulse, gentlePulse, gentlePulse);
            
            // Return center dot to vibrant blue
            this.centerDot.material.color.lerp(new THREE.Color(0xff9933), 0.05);
            
            // Gentle glow ring animation
            if (this.centerDot.children[0]) {
                this.centerDot.children[0].rotation.z -= 0.002;
            }
            
            // Gentle inner ring animation
            if (this.centerDot.children[1]) {
                this.centerDot.children[1].rotation.z += 0.003;
            }
            
            // Return lighting to normal
            this.pointLight.intensity = 0.5;
            this.pointLight.color.lerp(new THREE.Color(0x00a8ff), 0.05);
            

        }
        
        // Floating animation
        this.logoGroup.position.y = Math.sin(this.time * 0.5) * 0.1;
        
        // Enhanced crosshair animations
        this.updateCrosshairAnimations();
        
        // Very subtle energy wave effect
        if (this.energyLevel > 0) {
            const waveScale = 1 + this.energyLevel * 0.05;
            this.logoGroup.scale.multiplyScalar(waveScale);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    updateLoadAnimation() {
        const elapsed = Date.now() - this.loadStartTime;
        const totalDuration = 4000; // 4 seconds total
        
        // Debug: Log animation progress
        if (elapsed % 500 < 16) { // Log every ~500ms
            console.log(`Load animation progress: ${(elapsed / totalDuration * 100).toFixed(1)}%`);
        }
        
        if (elapsed >= totalDuration) {
            // Animation complete
            this.isLoading = false;
            document.body.classList.remove('loading');
            document.body.classList.add('hero-animations-active');
            
            // Ensure all elements are at their final state
            [this.innerGapCircle, this.outerMainCircle, this.outerSubtleCircle].forEach(circle => {
                if (circle) {
                    circle.scale.set(1, 1, 1);
                    circle.material.opacity = .5;
                }
            });
            
            [this.horizontalLine, this.verticalLine].forEach((line, i) => {
                if (line) {
                    line.scale.set(1, 1, 1); // Ensure correct final scale
                    line.rotation.z = i === 0 ? 0 : Math.PI / 2;
                    line.children.forEach(segment => segment.material.opacity = 1.0); // Full opacity for maximum visibility
                }
            });
            
            this.centerDot.scale.set(1, 1, 1); // Ensure correct final scale
            this.centerDot.material.opacity = 1.0;
            
            // Ensure children are also at full opacity
            if (this.centerDot.children[0]) {
                this.centerDot.children[0].material.opacity = 0.6;
            }
            if (this.centerDot.children[1]) {
                this.centerDot.children[1].material.opacity = 0.8;
            }
            
            [this.outerRing, this.middleRing, this.innerRing].forEach((ring, ringIndex) => {
                if (ring) {
                    ring.children.forEach((segment, segmentIndex) => {
                        segment.material.opacity = 0.4; // Much lower final opacity
                        segment.scale.set(1, 1, 1);
                        
                        // Ensure final subtle metallic properties are set
                        if (ringIndex === 0) { // Outer ring - very subtle steel
                            segment.material.metalness = 0.6;
                            segment.material.roughness = 0.5 + Math.random() * 0.3;
                        } else if (ringIndex === 1) { // Middle ring - subtle aluminum
                            segment.material.metalness = 0.5;
                            segment.material.roughness = 0.6 + Math.random() * 0.3;
                        } else { // Inner ring - subtle blue
                            segment.material.metalness = 0.7;
                            segment.material.roughness = 0.4 + Math.random() * 0.3;
                        }
                        
                        // Ensure lower environment map intensity for subtlety
                        segment.material.envMapIntensity = 0.3;
                    });
                }
            });
            
            // Trigger hero animations
            this.triggerHeroAnimations();
            return;
        }
        
        const progress = elapsed / totalDuration;

        console.log("Progress: ", progress);
        
        // Phase 1: Center dot appears and blinks (0-25% of total time) - Extended duration
        if (progress <= 0.25) {
            const centerProgress = progress / 0.25;
            
            // Debug logging for center dot animation
            if (elapsed % 100 < 16) { // Log every ~100ms during center dot phase
                console.log(`Center dot animation - Progress: ${(centerProgress * 100).toFixed(1)}%, Scale: ${this.centerDot.scale.x.toFixed(3)}, Opacity: ${this.centerDot.material.opacity.toFixed(3)}`);
            }
            
            if (centerProgress <= 0.8) {
                // Appear - make it more dramatic
                const appearEase = 1 - Math.pow(1 - (centerProgress / 0.8), 1);
                const scale = 0.1 + (appearEase * 0.9); // Start from 0.1 and go to 1.0
                this.centerDot.scale.set(scale, scale, scale);
                this.centerDot.material.opacity = 0.5 + (appearEase * 0.5); // Start from 0.5 and go to 1.0
                
                console.log("Center dot scale: ", scale);

                // Also animate the glow ring and inner ring
                if (this.centerDot.children[0]) {
                    this.centerDot.children[0].material.opacity = (0.5 + appearEase * 0.5) * 0.4;
                }
                if (this.centerDot.children[1]) {
                    this.centerDot.children[1].material.opacity = (0.5 + appearEase * 0.5) * 0.6;
                }
                
                // Blink - more pronounced
                const blinkProgress = (centerProgress - 0.8) / 0.4;
                const blink = Math.sin(blinkProgress * Math.PI * 6) > 0 ? 1 : 0.2;
                this.centerDot.material.opacity = blink;
                
                // Blink the children too
                if (this.centerDot.children[0]) {
                    this.centerDot.children[0].material.opacity = blink * 0.4;
                }
                if (this.centerDot.children[1]) {
                    this.centerDot.children[1].material.opacity = blink * 0.6;
                }
            } 
            else {
                // Settle
                const settleProgress = (centerProgress - 0.8) / 0.2;
                const finalOpacity = 0.8 + (settleProgress * 0.2); // End at full opacity
                this.centerDot.material.opacity = finalOpacity;
                
                // Settle the children too
                if (this.centerDot.children[0]) {
                    this.centerDot.children[0].material.opacity = finalOpacity * 0.4;
                }
                if (this.centerDot.children[1]) {
                    this.centerDot.children[1].material.opacity = finalOpacity * 0.6;
                }
            }
        }
        
        // Phase 2: Lines stretch across screen (25-45% of total time)
        if (progress > 0.25 && progress <= 0.45) {
            const lineProgress = (progress - 0.25) / 0.2;
            const easeInOut = lineProgress < 0.5 ? 
                2 * lineProgress * lineProgress : 
                1 - Math.pow(-2 * lineProgress + 2, 3) / 2;
            console.log("Line progress: ", lineProgress);
            [this.horizontalLine, this.verticalLine].forEach((line, index) => {
                if (line) {
                    const delay = index * 0.1;
                    const elementProgress = Math.max(0, Math.min(1, (lineProgress - delay) / (1 - delay)));
                    console.log("Element progress: ", elementProgress);
                    if (elementProgress > 0) {
                        // Quick opacity jump to final opacity (1.0)
                        if (elementProgress < 0.1) {
                            line.children.forEach(segment => {
                                segment.material.opacity = 1.0;
                            });
                        }
                        
                        // Simple scale animation from stretched to final size
                        const scaleX = 10 - (elementProgress * 9); // From 10 to 1
                        const scaleY = 0.01 + (elementProgress * 0.99); // From 0.01 to 1
                        line.scale.set(scaleX, scaleY, 1);
                        
                        // Rotate from X formation to final position
                        if (index === 0) { // Horizontal line
                            // Start at 45 degrees (X formation) and rotate to 0 degrees (horizontal)
                            line.rotation.z = (1 - elementProgress) * Math.PI / 4;
                        } else { // Vertical line
                            // Start at -45 degrees (X formation) and rotate to 90 degrees (vertical)
                            line.rotation.z = Math.PI / 2 + (1 - elementProgress) * Math.PI / 4;
                        }
                        
                        // At the very end, ensure we match the normal state exactly
                        if (lineProgress >= 0.99) {
                            line.scale.set(1, 1, 1);
                            // Reset rotation to final positions
                            if (index === 0) {
                                line.rotation.z = 0; // Horizontal
                            } else {
                                line.rotation.z = Math.PI / 2; // Vertical
                            }
                            line.children.forEach(segment => {
                                segment.material.opacity = 1.0; // Match normal state - full opacity
                            });
                        }
                    }
                }
            });

            
            
        }
        
        // Phase 3: Inner circles grow from center (45-65% of total time)
        if (progress > 0.45 && progress <= 0.65) {
            const circleProgress = (progress - 0.45) / 0.2;
            const easeOut = 1 - Math.pow(1 - circleProgress, 3);
            
            // Animate semi-circles
            // [this.innerSemiCircle, this.outerMainSemiCircle, this.outerSemiCircle].forEach((semiCircle, index) => {
            //     if (semiCircle && semiCircle.userData) {
            //         const data = semiCircle.userData;
            //         // Rotation animation
            //         semiCircle.rotation.z += data.rotationSpeed * (index + 1);
            //         semiCircle.material.opacity = progress;
            //         // Color animation
            //         // const hue = 30 + Math.sin(this.time * 2) * 10; // Orange to yellow range
            //         // semiCircle.material.color.setHSL(hue / 360, 0.8, 0.7);
            //     }
            // });
        }
        
        // Phase 4: Rings fade in (65-100% of total time) - much more subtle
        if (progress > 0.65) {
            const ringProgress = (progress - 0.65) / 0.35;
            const easeInOut = ringProgress < 0.5 ? 
                2 * ringProgress * ringProgress : 
                1 - Math.pow(-2 * ringProgress + 2, 3) / 2;
            
            // Animate rings in sequence with much lower opacity
            [this.innerRing, this.middleRing, this.outerRing].forEach((ring, index) => {
                if (ring) {
                    const delay = index * 0.1;
                    const elementProgress = Math.max(0, Math.min(1, (ringProgress - delay) / (1 - delay)));
                    if (elementProgress > 0) {
                        const opacity = easeInOut * elementProgress * 0.4; // Much lower final opacity
                        ring.children.forEach((segment, segmentIndex) => {
                            segment.material.opacity = opacity;
                            
                            // Maintain subtle metallic properties during animation
                            if (index === 0) { // Outer ring - very subtle steel
                                segment.material.metalness = 0.6;
                                segment.material.roughness = 0.5 + Math.random() * 0.3;
                            } else if (index === 1) { // Middle ring - subtle aluminum
                                segment.material.metalness = 0.5;
                                segment.material.roughness = 0.6 + Math.random() * 0.3;
                            } else { // Inner ring - subtle blue
                                segment.material.metalness = 0.7;
                                segment.material.roughness = 0.4 + Math.random() * 0.3;
                            }
                            
                            // Ensure lower environment map intensity for subtlety
                            segment.material.envMapIntensity = 0.3;
                        });
                        
                        // Add subtle rotation during entrance
                        ring.rotation.z = (1 - easeInOut) * Math.PI * 0.5 * (index + 1);
                    }
                }
            });

            // Animate semi-circles
            // [this.innerSemiCircle, this.outerMainSemiCircle, this.outerSemiCircle].forEach((semiCircle, index) => {
            //     if (semiCircle && semiCircle.userData) {
            //         const data = semiCircle.userData;
            //         // Rotation animation
            //         semiCircle.rotation.z += data.rotationSpeed * (index + 1);
            //         semiCircle.material.opacity = progress;
            //         // Color animation
            //         // const hue = 30 + Math.sin(this.time * 2) * 10; // Orange to yellow range
            //         // semiCircle.material.color.setHSL(hue / 360, 0.8, 0.7);
            //     }
            // });
            
        }
        if (progress > 0.25){
            const backgroundProgress = (progress - 0.25) / 0.75;
            const easeIn = backgroundProgress < 0.5 ? 
                2 * backgroundProgress * backgroundProgress : 
                1 - Math.pow(-2 * backgroundProgress + 2, 3) / 2;
            [this.innerGapCircle, this.outerMainCircle, this.outerSubtleCircle].forEach((circle, index) => {
                if (circle) {
                    const delay = index * 0.15;
                    // const elementProgress = Math.max(0, Math.min(1, (lineProgress - delay) / (1 - delay)));
                    
                    if (progress > 0) {
                        // const scale = easeOut * elementProgress;
                        circle.scale.set(1, 1, 1);
                        circle.material.opacity =  backgroundProgress * .5;
                        console.log("Circle opacity: ", circle.material.opacity);
                
                    }
                }
            });
            // Animate semi-circles
            [this.innerSemiCircle, this.outerMainSemiCircle, this.outerSemiCircle].forEach((semiCircle, index) => {
                if (semiCircle && semiCircle.userData) {
                    const data = semiCircle.userData;
                    // Rotation animation
                    semiCircle.rotation.z += data.rotationSpeed * (index + 1)  * easeIn ;
                    // semiCircle.material.opacity = lineProgress;
                    semiCircle.material.opacity = easeIn;
                
                    // Color animation
                    // const hue = 30 + Math.sin(this.time * 2) * 10; // Orange to yellow range
                    // semiCircle.material.color.setHSL(hue / 360, 0.8, 0.7);
                }
            });
        }
    }
    
    triggerHeroAnimations() {
        // The CSS animations are already set up with delays
        // This method can be used for any additional JavaScript-based animations
        // or to ensure the animations are properly triggered
        
        // Add a class to the body to ensure animations are active
        document.body.classList.add('hero-animations-active');
        
        // Optional: Add any additional JavaScript-based animations here
        // For example, we could add subtle particle effects or other enhancements
    }
    
    updateCrosshairAnimations() {
        // Animate crosshair circles
        [this.innerGapCircle, this.outerMainCircle, this.outerSubtleCircle].forEach(circle => {
            if (circle && circle.userData) {
                const data = circle.userData;
                
                // Pulsing radius effect
                const pulse = Math.sin(this.time * data.pulseSpeed + data.pulsePhase) * 0.02;
                const currentRadius = data.originalRadius + pulse;
                
                // Update geometry with new radius
                const newGeometry = new THREE.RingGeometry(
                    currentRadius - 0.05, 
                    currentRadius + 0.05, 
                    128
                );
                circle.geometry.dispose();
                circle.geometry = newGeometry;
                
                // Rotation animation
                circle.rotation.z += data.rotationSpeed;
                
                // Opacity pulsing - match loading animation final state
                // circle.material.opacity = 1.0 + Math.sin(this.time * data.opacitySpeed + data.opacityPhase) * 0.1 * .02;
                
                // Color variation based on animation state
                if (this.isAnimating) {
                    const hue = Math.max(200, Math.min(220, 210 + Math.sin(this.time * 2) * 10)); // Vibrant blue range
                    circle.material.color.setHSL(hue / 360, 0.8, 0.7);
                } else {
                    // circle.material.color.lerp(new THREE.Color(0xffffff), 0.05);
                }
            }
        });
        
        // Animate crosshair lines
        [this.horizontalLine, this.verticalLine].forEach(line => {
            if (line && line.userData) {
                const data = line.userData;
                
                // Pulsing scale effect - start at exact loading animation end state
                const pulse = Math.sin(this.time * data.pulseSpeed + data.pulsePhase) * 0.05;
                const scale = 1 + pulse;
                
                line.scale.set(scale, 1, 1); // Ensure Y and Z scale stay at 1, X pulses from 1
                // Opacity pulsing for both segments - maintain high visibility
                line.children.forEach(segment => {
                    segment.material.opacity = 1.0 + Math.sin(this.time * data.opacitySpeed + data.opacityPhase) * 0.1;
                });
                // Color variation based on animation state
                if (this.isAnimating) {
                    const hue = Math.max(200, Math.min(220, 210 + Math.sin(this.time * 2) * 10)); // Vibrant blue range
                    line.children.forEach(segment => {
                        segment.material.color.setHSL(hue / 360, 0.9, 0.9); // Brighter, more saturated
                    });
                } else {
                    line.children.forEach(segment => {
                        // Keep lines bright white when not animating
                        segment.material.color.setRGB(1, 1, 1); // Pure white
                    });
                }
            }
        });
        
        // Animate semi-circles
        [this.innerSemiCircle, this.outerMainSemiCircle, this.outerSemiCircle].forEach((semiCircle, index) => {
            if (semiCircle && semiCircle.userData) {
                const data = semiCircle.userData;
                // Rotation animation
                semiCircle.rotation.z += data.rotationSpeed * (index + 1);
                // Color animation
                // const hue = 30 + Math.sin(this.time * 2) * 10; // Orange to yellow range
                // semiCircle.material.color.setHSL(hue / 360, 0.8, 0.7);
            }
        });
    }
    
    destroy() {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('click', this.onClick);
        window.removeEventListener('resize', this.onWindowResize);
        
        // Clean up Three.js resources
        this.scene.clear();
        this.renderer.dispose();
    }
}

// ==========================================================================
// Scroll Animation System
// ==========================================================================

class ScrollAnimator {
    constructor() {
        this.animatedElements = new Set();
        this.observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px', // Trigger when element is 50px from bottom of viewport
            threshold: 0.1
        };
        
        this.init();
    }
    
    init() {
        // Create intersection observer
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animateElement(entry.target);
                    this.animatedElements.add(entry.target);
                }
            });
        }, this.observerOptions);
        
        // Observe all scroll-animate elements
        this.observeElements();
        
        // Re-observe on window resize to handle dynamic content
        window.addEventListener('resize', () => {
            this.observeElements();
        });
    }
    
    observeElements() {
        const elements = document.querySelectorAll('.scroll-animate');
        elements.forEach(element => {
            if (!this.animatedElements.has(element)) {
                this.observer.observe(element);
            }
        });
    }
    
    animateElement(element) {
        // Add the animate-in class to trigger the animation
        element.classList.add('animate-in');
        
        // Add subtle particle effect for flashy elements
        if (element.classList.contains('flashy')) {
            this.createFlashEffect(element);
        }
        
        // Add glow effect for cards
        if (element.classList.contains('glow-effect')) {
            this.createGlowEffect(element);
        }
        
        // Add pulse effect for icons
        if (element.classList.contains('pulse-icon')) {
            this.createPulseEffect(element);
        }
    }
    
    createFlashEffect(element) {
        // Create a flash particle effect
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, transparent, rgba(255, 119, 0, 0.4), transparent);
            pointer-events: none;
            z-index: 10;
            animation: flashSweep 0.6s ease-out forwards;
        `;
        
        // Add flash animation keyframes if not already present
        if (!document.querySelector('#flash-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'flash-animation-styles';
            style.textContent = `
                @keyframes flashSweep {
                    0% {
                        transform: translateX(-100%) skewX(-15deg);
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(200%) skewX(-15deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        element.style.position = 'relative';
        element.appendChild(flash);
        
        // Remove flash element after animation
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 600);
    }
    
    createGlowEffect(element) {
        // Add a subtle glow animation
        element.style.transition = 'box-shadow 0.3s ease, transform 0.3s ease';
        
        // Trigger glow effect
        setTimeout(() => {
            element.style.boxShadow = '0 0 25px rgba(255, 119, 0, 0.3)';
            element.style.transform = 'translateY(-2px)';
            
            // Reset after a short delay
            setTimeout(() => {
                element.style.boxShadow = '0 0 15px rgba(255, 119, 0, 0.2)';
                element.style.transform = 'translateY(0)';
            }, 300);
        }, 200);
    }
    
    createPulseEffect(element) {
        // Add a pulse animation to icons
        element.style.animation = 'iconPulse 0.6s ease-out 0.2s both';
    }
    
    // Method to manually trigger animations (useful for testing)
    triggerAllAnimations() {
        const elements = document.querySelectorAll('.scroll-animate');
        elements.forEach(element => {
            if (!this.animatedElements.has(element)) {
                this.animateElement(element);
                this.animatedElements.add(element);
            }
        });
    }
}

// Reset scroll position to top on page load/refresh
function resetScrollPosition() {
    // Try multiple methods to ensure scroll reset works
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Force a reflow to ensure the scroll reset takes effect
    document.body.offsetHeight;
}

// Initialize the 3D logo when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Reset scroll position immediately
    resetScrollPosition();
    
    const container = document.querySelector('.background-logo');
    new InteractiveCrosshairLogo(container);
    
    // Initialize scroll animations
    const scrollAnimator = new ScrollAnimator();
    
    // Form handling with Formspree
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const submitButton = this.querySelector('.submit-btn');
            const originalButtonText = submitButton.textContent;
            
            // Show loading state
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            fetch('https://formspree.io/f/xblyvloo', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    // Success
                    showFormMessage('Message sent successfully! We\'ll get back to you soon.', 'success');
                    contactForm.reset();
                } else {
                    // Error
                    showFormMessage('Failed to send message. Please try again or email us directly.', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showFormMessage('Network error. Please try again or email us directly.', 'error');
            })
            .finally(() => {
                // Reset button
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            });
        });
    }
    
    // Show form success/error messages
    function showFormMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `form-message form-message-${type}`;
        messageElement.textContent = message;
        
        // Add styles
        messageElement.style.cssText = `
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            font-weight: 500;
            text-align: center;
            animation: slideIn 0.3s ease-out;
        `;
        
        if (type === 'success') {
            messageElement.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
            messageElement.style.color = '#4caf50';
            messageElement.style.border = '1px solid rgba(76, 175, 80, 0.3)';
        } else {
            messageElement.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
            messageElement.style.color = '#f44336';
            messageElement.style.border = '1px solid rgba(244, 67, 54, 0.3)';
        }
        
        // Insert after form
        const contactForm = document.getElementById('contactForm');
        contactForm.parentNode.insertBefore(messageElement, contactForm.nextSibling);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (messageElement.parentNode) {
                        messageElement.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Hamburger menu functionality
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
    
    hamburgerMenu.addEventListener('click', function() {
        this.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        document.body.style.overflow = mobileNavOverlay.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close mobile menu when clicking on a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburgerMenu.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close mobile menu when clicking outside
    mobileNavOverlay.addEventListener('click', function(e) {
        if (e.target === this) {
            hamburgerMenu.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add scroll-triggered particle effects for enhanced flashiness
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Create subtle particle effects during scroll
            if (Math.random() < 0.3) { // 30% chance on scroll
                createScrollParticles();
            }
        }, 100);
    });
    
    // Additional scroll reset on window load (fallback)
    window.addEventListener('load', () => {
        // Small delay to ensure everything is fully loaded
        setTimeout(() => {
            resetScrollPosition();
        }, 100);
    });
    
    function createScrollParticles() {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 2px;
            height: 2px;
            background: rgba(255, 119, 0, 0.6);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            animation: particleFloat 2s ease-out forwards;
        `;
        
        // Position particle randomly on screen
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = Math.random() * window.innerHeight + 'px';
        
        // Add particle animation keyframes if not already present
        if (!document.querySelector('#particle-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'particle-animation-styles';
            style.textContent = `
                @keyframes particleFloat {
                    0% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-50px) scale(0);
                        opacity: 0;
                    }
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideOut {
                    from {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }
});