document.addEventListener('DOMContentLoaded', () => {

    // --- 1. BOOT SEQUENCE ---
    const terminal = document.getElementById('terminal-output');
    const progBar = document.getElementById('progress-bar');
    const lines = ["SYSTEM CHECK...", "CONNECTING SATELLITE...", "ACCESS GRANTED."];
    let i = 0;

    function runBoot() {
        if(i < lines.length && terminal) {
            terminal.innerText = `> ${lines[i]}`;
            if(progBar) progBar.style.width = `${((i+1)/lines.length)*100}%`;
            i++;
            setTimeout(runBoot, 800);
        }
    }
    runBoot();

    // --- 2. PAGE NAVIGATION ---
    const mainInterface = document.getElementById('main-interface');
    const teamSection = document.getElementById('team-section');
    const teamLink = document.getElementById('team-link');
    const backBtn = document.getElementById('back-btn');

    if(teamLink && backBtn) {
        teamLink.addEventListener('click', (e) => {
            e.preventDefault();
            mainInterface.style.display = 'none';
            teamSection.classList.add('active');
        });

        backBtn.addEventListener('click', () => {
            teamSection.classList.remove('active');
            mainInterface.style.display = 'block';
        });
    }

    // --- 3. UPLOAD & PREVIEW LOGIC ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('preview-container');
    const previewImg = document.getElementById('preview-img');
    const processBtn = document.getElementById('processBtn');
    const consoleLog = document.getElementById('console-output');

    if(dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if(file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    if(previewImg) previewImg.src = evt.target.result;
                    if(previewContainer) previewContainer.classList.add('active');

                    const text = document.querySelector('.zone-content');
                    if(text) text.style.display = 'none';

                    if(processBtn) processBtn.disabled = false;
                    log("IMAGE BUFFERED. READY FOR CHAIN.");
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- 4. BLOCKCHAIN TRANSACTION LOGIC (UPDATED) ---
    if(processBtn) {
        processBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            processBtn.disabled = true;
            processBtn.innerText = "CONNECTING WALLET...";

            // 1. Check for Metamask
            if (typeof window.ethereum !== 'undefined') {
                try {
                    // Request Wallet Connection
                    log("REQUESTING WALLET ACCESS...");
                    await window.ethereum.request({ method: 'eth_requestAccounts' });

                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();

                    // *** CONFIGURATION ***
                    // Replace with your DEPLOYED CONTRACT ADDRESS from Remix
                    const contractAddress = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS_HERE";

                    // The ABI (Interface)
                    const abi = [
                        "function recordRescue(string memory _missionId, string memory _coordinates) public",
                        "event SurvivorDetected(string indexed missionId, string coordinates, uint256 timestamp)"
                    ];

                    const contract = new ethers.Contract(contractAddress, abi, signer);

                    // Prepare Data (Constraint: Fixed Dataset ID)
                    const missionID = "DATASET_IMG_" + Math.floor(Math.random() * 9999);
                    const coords = "28.6139N, 77.2090E";

                    log(`PREPARING TRANSACTION FOR ID: ${missionID}`);
                    processBtn.innerText = "SIGN TRANSACTION...";

                    // Send Transaction
                    const tx = await contract.recordRescue(missionID, coords);

                    log(`TX SENT! HASH: ${tx.hash.substring(0,15)}...`);
                    processBtn.innerText = "MINING...";

                    // Wait for Confirmation
                    await tx.wait();

                    log("SUCCESS: DATA IMMUTABLE ON-CHAIN.");
                    log(`MISSION ID: ${missionID}`);

                    processBtn.innerText = "SAVED TO BLOCKCHAIN";
                    processBtn.style.borderColor = "#0f0";
                    processBtn.style.color = "#0f0";

                } catch (error) {
                    console.error(error);
                    log("ERROR: " + (error.reason || error.message));
                    processBtn.innerText = "FAILED (SEE LOG)";
                    processBtn.style.borderColor = "#f00";
                    processBtn.style.color = "#f00";
                    processBtn.disabled = false; // Let them try again
                }
            } else {
                log("ERROR: METAMASK NOT INSTALLED!");
                alert("Please install MetaMask to use the Blockchain features.");
                processBtn.disabled = false;
            }
        });
    }

    function log(msg) {
        if(consoleLog) {
            const p = document.createElement('p');
            p.innerText = `> ${msg}`;
            consoleLog.prepend(p);
        }
    }

    // Clock
    setInterval(() => {
        const clock = document.getElementById('utc-clock');
        if(clock) clock.innerText = new Date().toISOString().split('T')[1].split('.')[0] + ' UTC';
    }, 1000);

    // --- 5. THREE.JS BACKGROUND ---
    try {
        if (typeof THREE !== 'undefined') {
            const container = document.getElementById('canvas-container');
            if(container) {
                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
                renderer.setSize(window.innerWidth, window.innerHeight);
                container.appendChild(renderer.domElement);

                const globeGroup = new THREE.Group();
                scene.add(globeGroup);

                const core = new THREE.Mesh(
                    new THREE.SphereGeometry(10, 32, 32),
                    new THREE.MeshBasicMaterial({ color: 0x000000 })
                );
                globeGroup.add(core);

                const partGeo = new THREE.BufferGeometry();
                const partPos = [];
                for(let i=0; i<1500; i++) {
                    const r = 10.1;
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    partPos.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
                }
                partGeo.setAttribute('position', new THREE.Float32BufferAttribute(partPos, 3));
                const particles = new THREE.Points(
                    partGeo,
                    new THREE.PointsMaterial({ color: 0x00f2ff, size: 0.1, transparent: true, opacity: 0.6 })
                );
                globeGroup.add(particles);

                camera.position.z = 24;

                function animate() {
                    requestAnimationFrame(animate);
                    globeGroup.rotation.y += 0.002;
                    renderer.render(scene, camera);
                }
                animate();

                window.addEventListener('scroll', () => {
                    const scrollPer = window.scrollY / (window.innerHeight * 0.8);
                    globeGroup.position.z = -(scrollPer * 10);
                });
            }
        }
    } catch(e) { console.log("3D Error", e); }
});