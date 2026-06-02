// --- 3D Drone Scene & Scroll Animation ---

(function() {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  let isMobile = window.innerWidth < 768;
  const staticDrone = document.getElementById('hero-drone');

  // --- Three.js Setup ---
  const scene = new THREE.Scene();

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 6);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);
  const rimLight = new THREE.DirectionalLight(0xe0f2fe, 5);
  rimLight.position.set(-5, 5, -10);
  scene.add(rimLight);
  const fillLight = new THREE.DirectionalLight(0xffedd6, 3);
  fillLight.position.set(-5, -2, 5);
  scene.add(fillLight);

  // Camera
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 8);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, logarithmicDepthBuffer: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // --- CINEWHOOP AVATA DRONE MODEL ---
  const droneContainer = new THREE.Group();
  const droneGroup = new THREE.Group();
  droneContainer.add(droneGroup);
  scene.add(droneContainer);

  // MATERIALS
  const mCF       = new THREE.MeshStandardMaterial({ color: 0x18191c, roughness: 0.25, metalness: 0.35 });
  const mCFlight  = new THREE.MeshStandardMaterial({ color: 0x2c2e33, roughness: 0.30, metalness: 0.25 });
  const mGray     = new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.35, metalness: 0.30 });
  const mDarkGray = new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 0.30, metalness: 0.40 });
  const mMotorB   = new THREE.MeshStandardMaterial({ color: 0x1c1e22, roughness: 0.20, metalness: 0.75 });
  const mMotorSil = new THREE.MeshStandardMaterial({ color: 0xc0c4ca, roughness: 0.08, metalness: 0.95 });
  const mPropDark = new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.40, metalness: 0.10, side: THREE.DoubleSide });
  const mSilver   = new THREE.MeshStandardMaterial({ color: 0xaab0b8, roughness: 0.12, metalness: 0.90 });
  const mGlass    = new THREE.MeshStandardMaterial({ color: 0x05080c, roughness: 0.05, metalness: 0.05, transparent: true, opacity: 0.88 });
  
  // LED Lights - Cyan themed instead of generic green
  const mLEDG     = new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 3 });
  const mCamHouse = new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.28, metalness: 0.50 });

  // Duct guards foam & strap materials
  const mDuctFoamRed   = new THREE.MeshStandardMaterial({ color: 0xe24738, roughness: 0.85, metalness: 0.10 });
  const mDuctFoamWhite = new THREE.MeshStandardMaterial({ color: 0xececec, roughness: 0.80, metalness: 0.10 });
  const mStrap         = new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.70, metalness: 0.05 });

  const propGroups = [];
  const ductMeshes = [];

  // 1. CENTRAL BODY (CARBON PLATES & STANDOFFS)
  const bodyGroup = new THREE.Group();
  droneGroup.add(bodyGroup);

  // Bottom plate (Main Frame Carbon Plate)
  const botPlate = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.02, 0.95), mCF);
  botPlate.position.set(0, 0.05, 0.05);
  bodyGroup.add(botPlate);

  // Top plate (Elevated Carbon Plate)
  const topPlate = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.85), mCF);
  topPlate.position.set(0, 0.26, 0.0);
  bodyGroup.add(topPlate);

  // Aluminum standoffs (connecting top and bottom plates)
  const standoffPositions = [
    { x: 0.13, z: 0.35 },
    { x: -0.13, z: 0.35 },
    { x: 0.13, z: 0.0 },
    { x: -0.13, z: 0.0 },
    { x: 0.13, z: -0.35 },
    { x: -0.13, z: -0.35 }
  ];
  standoffPositions.forEach(pos => {
    const standoff = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.20, 8), mSilver);
    standoff.position.set(pos.x, 0.15, pos.z);
    bodyGroup.add(standoff);
  });

  // Front camera side brackets (aluminum/carbon plates holding camera)
  const camBracketL = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.16, 0.16), mCF);
  camBracketL.position.set(0.12, 0.14, 0.46);
  bodyGroup.add(camBracketL);

  const camBracketR = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.16, 0.16), mCF);
  camBracketR.position.set(-0.12, 0.14, 0.46);
  bodyGroup.add(camBracketR);

  // 3D Printed TPU Camera mount on top of top plate front
  const goproMount = new THREE.Group();
  goproMount.position.set(0, 0.29, 0.30);
  bodyGroup.add(goproMount);
  
  const goproMountBase = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.12), mCF);
  goproMount.add(goproMountBase);
  
  const prongL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.06), mCF);
  prongL.position.set(0.03, 0.05, 0);
  goproMount.add(prongL);
  
  const prongR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.06), mCF);
  prongR.position.set(-0.03, 0.05, 0);
  goproMount.add(prongR);

  const prongBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 8), mSilver);
  prongBolt.rotation.z = Math.PI / 2;
  prongBolt.position.set(0, 0.05, 0);
  goproMount.add(prongBolt);

  // Battery Group
  const batt = new THREE.Group();
  batt.position.set(0, 0.38, -0.08);
  bodyGroup.add(batt);

  const battBody = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.20, 0.52), new THREE.MeshStandardMaterial({ color: 0x1c1e22, roughness: 0.4, metalness: 0.1 }));
  batt.add(battBody);

  // Custom text texture dynamically drawn via 2D Canvas for branding
  const textCanvas = document.createElement('canvas');
  textCanvas.width = 256;
  textCanvas.height = 128;
  const ctx = textCanvas.getContext('2d');
  ctx.fillStyle = '#1e2025';
  ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = '#00d4ff'; // themed cyan text
  ctx.font = 'bold 28px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#00d4ff';
  ctx.shadowBlur = 10;
  ctx.fillText('Sky High FPV', 128, 64);

  const textTex = new THREE.CanvasTexture(textCanvas);
  const textMat = new THREE.MeshStandardMaterial({ map: textTex, roughness: 0.25, metalness: 0.1 });

  // Custom battery strap white text logo
  const strapCanvas = document.createElement('canvas');
  strapCanvas.width = 256;
  strapCanvas.height = 64;
  const sCtx = strapCanvas.getContext('2d');
  sCtx.fillStyle = '#1a1c20'; // strap background
  sCtx.fillRect(0, 0, 256, 64);
  sCtx.fillStyle = '#ffffff'; // white text
  sCtx.font = 'bold 28px "Orbitron", sans-serif';
  sCtx.textAlign = 'center';
  sCtx.textBaseline = 'middle';
  sCtx.fillText('GEPRC', 128, 32);

  const strapTex = new THREE.CanvasTexture(strapCanvas);
  const strapMat = new THREE.MeshStandardMaterial({ map: strapTex, roughness: 0.5, metalness: 0.1 });
  
  // Decal / label mesh on the top face of the battery housing (behind strap)
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.12), textMat);
  label.position.set(0, 0.101, 0.16); // slightly above top face
  label.rotation.x = -Math.PI / 2; // flat facing up
  batt.add(label);

  // Decal / label mesh on the front face of the battery housing (visible from front)
  const frontLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.12), textMat);
  frontLabel.position.set(0, 0, 0.261); // slightly in front of front face
  frontLabel.rotation.y = 0; // facing forward
  batt.add(frontLabel);

  // Battery Strap wrapping around battery center
  const strapTop = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.015, 0.12), strapMat);
  strapTop.position.set(0, 0.108, 0);
  batt.add(strapTop);

  const strapLeft = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.20, 0.12), mStrap);
  strapLeft.position.set(0.128, 0, 0);
  batt.add(strapLeft);

  const strapRight = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.20, 0.12), mStrap);
  strapRight.position.set(-0.128, 0, 0);
  batt.add(strapRight);

  for (let c = 0; c < 4; c++) {
    const cell = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.012), mLEDG);
    cell.position.set(-0.06 + c * 0.04, 0.485, -0.22);
    droneGroup.add(cell); 
  }

  // 2. CAMERA
  const gimbGroup = new THREE.Group();
  gimbGroup.position.set(0, 0.14, 0.46);
  droneGroup.add(gimbGroup);

  const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.20, 0.20), mCamHouse);
  gimbGroup.add(camBody);
  const lensB = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.08, 20), mCamHouse);
  lensB.rotation.x = Math.PI / 2;
  lensB.position.z = 0.12;
  gimbGroup.add(lensB);
  const lensG = new THREE.Mesh(new THREE.CircleGeometry(0.07, 20), mGlass);
  lensG.position.z = 0.161;
  gimbGroup.add(lensG);

  // 2.5 ACTION CAMERA & ANTENNA (Customizer Add-ons)
  const goproGroup = new THREE.Group();
  goproGroup.position.set(0, 0.41, 0.30); // mount on top of TPU mount
  goproGroup.rotation.x = 0.2; // tilt up slightly
  goproGroup.visible = false; // hidden by default
  droneGroup.add(goproGroup);

  const camBodyBox = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.12), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 }));
  goproGroup.add(camBodyBox);

  const lensCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 }));
  lensCyl.rotation.x = Math.PI / 2;
  lensCyl.position.set(0.04, 0, 0.07);
  goproGroup.add(lensCyl);

  const lensGlass = new THREE.Mesh(new THREE.CircleGeometry(0.04, 16), mGlass);
  lensGlass.position.set(0.04, 0, 0.091);
  goproGroup.add(lensGlass);

  const recordLED = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 0.01), new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2 }));
  recordLED.position.set(-0.05, 0.04, 0.061);
  goproGroup.add(recordLED);

  const antennaGroup = new THREE.Group();
  antennaGroup.position.set(0, 0.28, -0.38); // back of top plate
  antennaGroup.rotation.x = -0.5;
  antennaGroup.visible = false;
  droneGroup.add(antennaGroup);

  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.25, 8), mCF);
  rod.position.y = 0.125;
  antennaGroup.add(rod);

  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
  cap.position.y = 0.25;
  antennaGroup.add(cap);

  // 3. DUCTS & MOTORS
  const ARM_COUNT = 4;
  const ARM_LENGTH = 0.62; 
  const DUCT_RAD = 0.45;
  const ARM_ANGLES_DEG = [45, 135, 225, 315];

  // Side bridges to merge the foam bumpers into a figure-8 layout
  const foamBridgeR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.35), mDuctFoamRed);
  foamBridgeR.position.set(0.438, 0.10, 0.0);
  droneGroup.add(foamBridgeR);
  ductMeshes.push(foamBridgeR);

  const foamBridgeL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.35), mDuctFoamWhite);
  foamBridgeL.position.set(-0.438, 0.10, 0.0);
  droneGroup.add(foamBridgeL);
  ductMeshes.push(foamBridgeL);

  ARM_ANGLES_DEG.forEach((deg, i) => {
    const rad = THREE.MathUtils.degToRad(deg);
    const mx = Math.sin(rad) * ARM_LENGTH;
    const mz = Math.cos(rad) * ARM_LENGTH;

    const mntGroup = new THREE.Group();
    mntGroup.position.set(mx, 0.1, mz);
    droneGroup.add(mntGroup);

    // Inner structural carbon duct
    const innerDuct = new THREE.Mesh(new THREE.TorusGeometry(DUCT_RAD, 0.03, 12, 32), mCFlight);
    innerDuct.rotation.x = Math.PI / 2;
    mntGroup.add(innerDuct);
    ductMeshes.push(innerDuct);

    // Thick outer foam bumper (White on left side mx < 0, Red on right side mx > 0)
    const bumperMat = (mx > 0) ? mDuctFoamRed : mDuctFoamWhite;
    const foamBumper = new THREE.Mesh(new THREE.TorusGeometry(DUCT_RAD + 0.01, 0.08, 16, 32), bumperMat);
    foamBumper.rotation.x = Math.PI / 2;
    mntGroup.add(foamBumper);
    ductMeshes.push(foamBumper);
    
    // 5 motor struts (spokes) connecting motor mount to inner duct
    for (let s = 0; s < 5; s++) {
      const strutG = new THREE.Group();
      strutG.rotation.y = (s / 5) * Math.PI * 2 + (i % 2 !== 0 ? Math.PI / 10 : 0);
      const strut = new THREE.Mesh(new THREE.BoxGeometry(DUCT_RAD, 0.012, 0.025), mCF);
      strut.position.set(DUCT_RAD / 2, -0.08, 0); // connect to bottom of duct
      strutG.add(strut);
      mntGroup.add(strutG);
      ductMeshes.push(strut);
    }

    const motorBody = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.15, 20), mMotorB);
    motorBody.position.y = -0.12;
    mntGroup.add(motorBody);
    
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.10, 20), mMotorSil);
    bell.position.y = -0.05;
    mntGroup.add(bell);
    
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.06, 8), mSilver);
    shaft.position.y = 0.01;
    mntGroup.add(shaft);

    const pg = new THREE.Group();
    pg.position.y = 0.02; // propeller spins inside the duct guards
    mntGroup.add(pg);
    propGroups.push(pg);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 12), mMotorB);
    pg.add(hub);

    for (let b = 0; b < 3; b++) {
      const ba = (b / 3) * Math.PI * 2;
      const bladeG = new THREE.Group();
      bladeG.rotation.y = ba;
      pg.add(bladeG);

      const blade = new THREE.Mesh(new THREE.BoxGeometry(DUCT_RAD * 0.85, 0.01, 0.08), mPropDark);
      blade.position.x = DUCT_RAD * 0.42;
      bladeG.add(blade);
    }

    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8), mGray);
    pad.position.set(0, -0.15, 0);
    mntGroup.add(pad);
  });

  // Scale the drone model
  droneGroup.scale.set(1.4, 1.4, 1.4);

  // --- Initial Position (Hero Section / Desktop layout) ---
  droneContainer.position.set(2.8, 0.1, 1.5);
  droneContainer.rotation.set(0.1, -Math.PI / 6, -0.05);

  // --- GSAP ScrollTrigger Configurations ---
  gsap.registerPlugin(ScrollTrigger);

  // Single timeline linked to the scroll progress of the entire body
  const droneTl = gsap.timeline({
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5
    }
  });

  droneTl
    // 1. Move towards left side (Services Section)
    .to(droneContainer.position, { x: -2.8, y: -0.2, z: 1.2, ease: "power1.inOut" }, "services")
    .to(droneContainer.rotation, { x: 0.15, y: Math.PI / 5, z: 0.15, ease: "power1.inOut" }, "services")
    
    // 2. Glide back to the right side (Projects Section)
    .to(droneContainer.position, { x: 2.8, y: -0.3, z: 1.5, ease: "power1.inOut" }, "projects")
    .to(droneContainer.rotation, { x: -0.1, y: -Math.PI / 5, z: -0.1, ease: "power1.inOut" }, "projects")
    
    // 3. Float to the center background (How It Works Section)
    .to(droneContainer.position, { x: 0, y: 0.6, z: -1.0, ease: "power1.inOut" }, "how")
    .to(droneContainer.rotation, { x: -0.2, y: 0, z: 0.05, ease: "power1.inOut" }, "how")
    
    // 4. Glide to the right side (Estimate Form Section)
    .to(droneContainer.position, { x: 2.5, y: -0.4, z: 1.5, ease: "power1.inOut" }, "estimate")
    .to(droneContainer.rotation, { x: 0.15, y: -Math.PI / 4, z: 0.1, ease: "power1.inOut" }, "estimate")
    
    // 5. Drift to the left side (Testimonials Section)
    .to(droneContainer.position, { x: -2.5, y: -0.2, z: 1.2, ease: "power1.inOut" }, "testimonials")
    .to(droneContainer.rotation, { x: 0.2, y: Math.PI / 6, z: -0.1, ease: "power1.inOut" }, "testimonials")
    
    // 6. Descend, perform a freestyle flip, and disappear into distance (Footer / Contact Section)
    .to(droneContainer.position, { x: 0, y: -2.5, z: -3.0, ease: "power1.inOut" }, "contact")
    .to(droneContainer.rotation, { x: Math.PI * 2 + Math.PI / 2.2, y: 0, z: 0, ease: "power1.inOut" }, "contact");

  // --- Mouse Parallax tilt effect ---
  let mouseX = 0;
  let mouseY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
  });

  // --- Mobile Fallback Check ---
  function checkMobile() {
    isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      container.style.display = 'none';
      if (staticDrone) {
        staticDrone.style.opacity = '1';
        staticDrone.style.pointerEvents = 'auto';
        staticDrone.style.width = '';
        staticDrone.style.height = '';
        staticDrone.style.display = 'block';
      }
    } else {
      container.style.display = 'block';
      if (staticDrone) {
        staticDrone.style.opacity = '0';
        staticDrone.style.pointerEvents = 'none';
        staticDrone.style.width = '0';
        staticDrone.style.height = '0';
        staticDrone.style.display = 'none';
      }
    }
  }

  // Run immediately on load
  checkMobile();

  // Resize handler
  window.addEventListener('resize', () => {
    checkMobile();
    if (!isMobile) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  });

  // --- Animation loop ---
  const clock = new THREE.Clock();
  const spinDirs = [1, -1, 1, -1];
  let currentSpinSpeed = 30; // propeller speed (changes on race)

  function animate() {
    requestAnimationFrame(animate);
    
    if (isMobile) return; // suspend WebGL render loops on mobile viewports

    const dt = clock.getDelta();
    const time = clock.getElapsedTime();

    // Idle floating animation
    droneGroup.position.y = Math.sin(time * 3) * 0.08;

    // Spin props
    propGroups.forEach((pg, i) => {
      pg.rotation.y += dt * currentSpinSpeed * spinDirs[i];
    });

    // Pulse LEDs
    const p = (Math.sin(time * 5) + 1) * 0.5;
    mLEDG.emissiveIntensity = 1.0 + p * 2.0;

    // Gimbal camera slight tilt
    gimbGroup.rotation.x = -0.1 + Math.sin(time * 0.8) * 0.05;

    // Apply mouse parallax to droneGroup (nesting allows overlay on top of ScrollTrigger positions)
    const targetTiltX = mouseY * 0.15;
    const targetTiltY = mouseX * 0.2;
    const targetTiltZ = -mouseX * 0.05;

    droneGroup.rotation.x += (targetTiltX - droneGroup.rotation.x) * 0.08;
    droneGroup.rotation.y += (targetTiltY - droneGroup.rotation.y) * 0.08;
    droneGroup.rotation.z += (targetTiltZ - droneGroup.rotation.z) * 0.08;

    renderer.render(scene, camera);
  }

  // --- Category Customizer Updates ---
  let currentFilter = 'all';

  function updateTextTexture(newText) {
    const ctx = textCanvas.getContext('2d');
    ctx.fillStyle = '#1e2025';
    ctx.fillRect(0, 0, 256, 128);
    
    // adjust text glow color to match the active filter's LED color
    if (currentFilter === 'race') ctx.fillStyle = '#ef4444';
    else if (currentFilter === 'event') ctx.fillStyle = '#f59e0b';
    else if (currentFilter === 'pnp') ctx.fillStyle = '#10b981';
    else ctx.fillStyle = '#00d4ff'; // themed cyan text
    
    ctx.font = 'bold 28px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 10;
    ctx.fillText(newText, 128, 64);
    textTex.needsUpdate = true;
  }

  function updateDroneDesign(filter) {
    currentFilter = filter;

    // 1. Toggle Ducts/Guards (Hide on Racing)
    const showDucts = (filter !== 'race');
    ductMeshes.forEach(mesh => {
      mesh.visible = showDucts;
    });

    // 2. Toggle GoPro (Show on Cinematic Event Shoots)
    goproGroup.visible = (filter === 'event');

    // 3. Toggle Antenna (Show on RTF / PNP)
    antennaGroup.visible = (filter === 'pnp');

    // 4. Propeller Colors & Spin Speeds
    if (filter === 'race') {
      mPropDark.color.setHex(0xef4444);
      mPropDark.emissive.setHex(0x550000);
      currentSpinSpeed = 65; // High speed spin
    } else if (filter === 'pnp') {
      mPropDark.color.setHex(0xd97706);
      mPropDark.emissive.setHex(0x3f1e00);
      currentSpinSpeed = 30;
    } else {
      mPropDark.color.setHex(0x14161a);
      mPropDark.emissive.setHex(0x000000);
      currentSpinSpeed = 30;
    }

    // 5. LED Emissive Colors
    if (filter === 'race') {
      mLEDG.color.setHex(0xef4444);
      mLEDG.emissive.setHex(0xef4444);
    } else if (filter === 'event') {
      mLEDG.color.setHex(0xf59e0b);
      mLEDG.emissive.setHex(0xf59e0b);
    } else if (filter === 'pnp') {
      mLEDG.color.setHex(0x10b981);
      mLEDG.emissive.setHex(0x10b981);
    } else {
      mLEDG.color.setHex(0x00d4ff);
      mLEDG.emissive.setHex(0x00d4ff);
    }

    // 6. Update dynamic decal text printed on the drone
    let labelText = "Sky High FPV";
    if (filter === 'custom') labelText = "Custom Quad";
    else if (filter === 'event') labelText = "Cinematic";
    else if (filter === 'race') labelText = "Race Spec";
    else if (filter === 'pnp') labelText = "Ready to Fly";
    
    updateTextTexture(labelText);
  }

  // Bind to DOM filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      updateDroneDesign(filter);
    });
  });

  animate();
})();
