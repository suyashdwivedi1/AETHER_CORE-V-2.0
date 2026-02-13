document.addEventListener('DOMContentLoaded', () => {

    // 1. BOOT SEQUENCE
    const terminal = document.getElementById('terminal-output');
    const progBar = document.getElementById('progress-bar');
    const lines = ["MOUNTING SATELLITE INTERFACE...", "ENCRYPTING CHANNEL...", "AETHER V.2.0 ONLINE."];
    let step = 0;
    function runBoot() {
        if(step < lines.length) {
            terminal.innerText = `> ${lines[step]}`;
            progBar.style.width = `${((step + 1) / lines.length) * 100}%`;
            step++;
            setTimeout(runBoot, 1000);
        }
    }
    runBoot();

    // 2. THREE.JS GLOBE (Large Frame + 70% Zoom)
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const geometry = new THREE.SphereGeometry(10, 50, 50);
    const material = new THREE.PointsMaterial({ color: 0x00f2ff, size: 0.05, transparent: true, opacity: 0.4 });
    const globeDots = new THREE.Points(geometry, material);
    globeGroup.add(globeDots);

    // Initial positioning closer to frame text
    camera.position.z = 12.5; 
    let scrollVelocity = 0;
    let lastScrollPos = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        scrollVelocity = (currentScroll - lastScrollPos) * 0.05;
        
        // 70% Zoom Logic: From 12.5 down to 3.75
        const maxScroll = 2500; 
        const scrollFactor = Math.min(currentScroll / maxScroll, 1);
        camera.position.z = 12.5 - (scrollFactor * 8.75);
        
        lastScrollPos = currentScroll;
    });

    function animate() {
        requestAnimationFrame(animate);
        const baseSpeed = 0.0008; 
        globeGroup.rotation.y += baseSpeed + (scrollVelocity * 0.1);
        globeGroup.rotation.x += baseSpeed * 0.5;
        scrollVelocity *= 0.95; 
        renderer.render(scene, camera);
    }
    animate();

    // 3. UI LOGIC
    const processBtn = document.getElementById('processBtn');
    const detailsBtn = document.getElementById('detailsBtn');
    const previewContainer = document.getElementById('preview-container');
    const detailsModal = document.getElementById('details-modal');
    const closeModal = document.getElementById('close-modal');
    const modalBody = document.getElementById('modal-body');
    const consoleLog = document.getElementById('console-output');

    // Navigation
    document.getElementById('enter-btn').onclick = () => document.getElementById('workspace').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('team-link').onclick = (e) => { e.preventDefault(); document.getElementById('team-section').classList.add('active'); };
    document.getElementById('back-btn').onclick = () => document.getElementById('team-section').classList.remove('active');

    // Upload
    const fileInput = document.getElementById('imageInput');
    const dropZone = document.getElementById('drop-zone');
    const previewImg = document.getElementById('preview-img');
    dropZone.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                previewImg.src = event.target.result;
                previewContainer.classList.add('active');
                processBtn.disabled = false;
                log("IMAGE BUFFERED. READY FOR X-RAY SCAN.");
            };
            reader.readAsDataURL(file);
        }
    };

    // Computation & X-Ray
    processBtn.onclick = () => {
        processBtn.disabled = true;
        processBtn.innerText = "COMPUTING...";
        
        // Add CSS class to trigger the green laser animation
        previewContainer.classList.add('scanning');
        
        // Scroll down to center workspace
        window.scrollBy({ top: 350, behavior: 'smooth' });
        log("INITIATING MULTI-SPECTRAL X-RAY...");

        setTimeout(() => {
            previewContainer.classList.remove('scanning');
            processBtn.innerText = "COMPLETE";
            detailsBtn.style.display = 'block'; // Reveal Details button
            log("SCAN FINISHED. SURVIVOR PROBABILITY: 0.2%");
        }, 4000);
    };

    // Modal
    detailsBtn.onclick = () => {
        modalBody.innerHTML = `
            <p><strong>MISSION ID:</strong> AETHER-${Math.floor(Math.random()*10000)}</p>
            <p><strong>LOCATION:</strong> 28.6139° N, 77.2090° E</p>
            <p><strong>THERMAL SIGNATURES:</strong> NONE DETECTED</p>
            <p><strong>FLOODING SEVERITY:</strong> MODERATE</p>
            <p><strong>AI CONFIDENCE:</strong> 99.1%</p>
        `;
        detailsModal.style.display = 'flex';
    };
    closeModal.onclick = () => detailsModal.style.display = 'none';

    function log(msg) {
        const p = document.createElement('p');
        p.innerText = `> ${msg}`;
        consoleLog.prepend(p);
    }
});
