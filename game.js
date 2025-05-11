// Simple 3D Car Game with Babylon.js
window.addEventListener('DOMContentLoaded', function() {
    // Canvas setup
    let canvas = document.querySelector('canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
    }

    // Babylon engine and scene
    const engine = new BABYLON.Engine(canvas, true);
    // Remove Babylon.js FPS counter if present
    if (document.getElementById('fpsCounter')) {
        document.getElementById('fpsCounter').remove();
    }
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.5, 0.7, 1.0);

    // Lighting
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1.1;

    // Ground
    const ground = BABYLON.MeshBuilder.CreateGround('ground', {width: 100, height: 100}, scene);
    ground.position.y = 0;
    ground.material = new BABYLON.StandardMaterial('groundMat', scene);
    ground.material.diffuseColor = new BABYLON.Color3(0.3, 0.6, 0.2);

    // Obstacles removed

    // Trees
    // Tree count with persistence and doubling for next challenge
    let treeCount = parseInt(localStorage.getItem('treeCount') || '7');
    const treePositions = [];
    const trees = [];
    for (let i = 0; i < treeCount; i++) {
        // Find a random spot not too close to car spawn or obstacles
        let tx, tz, tooClose;
        do {
            tx = (Math.random() - 0.5) * 90;
            tz = (Math.random() - 0.5) * 90;
            // Safe radius from car spawn (now at z=20)
            tooClose = Math.sqrt(tx*tx + (tz-20)*(tz-20)) < 5;

            for (const pos of treePositions) {
                if (Math.abs(pos.x - tx) < 3 && Math.abs(pos.z - tz) < 3) tooClose = true;
            }
        } while (tooClose);
        treePositions.push({x: tx, z: tz});
        // Trunk
        const trunk = BABYLON.MeshBuilder.CreateCylinder('trunk'+i, {diameter: 0.7, height: 3}, scene);
        trunk.position = new BABYLON.Vector3(tx, 1.5, tz);
        // Randomize trunk height and width
        const trunkHeight = 1.2 + Math.random()*1.6; // 1.2 - 2.8
        const trunkWidth = 0.7 + Math.random()*0.5; // 0.7 - 1.2
        trunk.scaling.y = trunkHeight;
        trunk.scaling.x = trunkWidth;
        trunk.scaling.z = trunkWidth;
        trunk.position.y = trunkHeight/2 + 0.1;
        // Brown trunk with nuance
        const trunkMat = new BABYLON.StandardMaterial('trunkMat'+i, scene);
        const brownBase = 0.4 + Math.random()*0.15; // 0.4-0.55
        const brownMid = 0.23 + Math.random()*0.12; // 0.23-0.35
        const brownDark = 0.09 + Math.random()*0.09; // 0.09-0.18
        trunkMat.diffuseColor = new BABYLON.Color3(brownBase, brownMid, brownDark);
        trunk.material = trunkMat;

        // Main leaves box (head)
        const mainSize = 2.3 + Math.random()*1.7; // 2.3 - 4.0
        const leaves = BABYLON.MeshBuilder.CreateBox('leaves'+i, {size: mainSize}, scene);
        leaves.position = new BABYLON.Vector3(tx, trunk.position.y + trunkHeight/2 + mainSize/2 - 0.2, tz);
        leaves.material = new BABYLON.StandardMaterial('leavesMat'+i, scene);
        leaves.material.diffuseColor = new BABYLON.Color3(0.1, 0.7, 0.1);
        leaves.checkCollisions = false;

        // Add 2-3 extra green cubes as "leaf clusters" on the sides/top
        const extraLeaves = [];
        const extraCount = 2 + Math.floor(Math.random()*2); // 2 or 3
        for (let j = 0; j < extraCount; j++) {
            const size = mainSize*0.45 + Math.random()*mainSize*0.35; // 45-80% of main
            const offsetY = (Math.random()-0.2) * mainSize*0.7;
            const offsetX = (Math.random()-0.5) * mainSize*1.1;
            const offsetZ = (Math.random()-0.5) * mainSize*1.1;
            const leaf = BABYLON.MeshBuilder.CreateBox('leaves'+i+'_extra'+j, {size}, scene);
            leaf.position = new BABYLON.Vector3(
                tx + offsetX,
                leaves.position.y + offsetY,
                tz + offsetZ
            );
            leaf.material = new BABYLON.StandardMaterial('leavesMat'+i+'_extra'+j, scene);
            leaf.material.diffuseColor = new BABYLON.Color3(0.1, 0.7, 0.1);
            leaf.checkCollisions = false;
            extraLeaves.push(leaf);
        }
        trees.push({trunk, leaves, extraLeaves});
    }

    // Rocks
    const rockCount = 12;
    // Max rock size, persistent and increases by 50% per win
    let maxRockSize = parseFloat(localStorage.getItem('maxRockSize') || '1.6');
    const rockPositions = [];
    const rocks = [];
    for (let i = 0; i < rockCount; i++) {
        let rx, rz, tooClose;
        do {
            rx = (Math.random() - 0.5) * 90;
            rz = (Math.random() - 0.5) * 90;
            // Safe radius from car spawn (now at z=20)
            tooClose = Math.sqrt(rx*rx + (rz-20)*(rz-20)) < 5;

            for (const pos of treePositions) {
                if (Math.abs(pos.x - rx) < 3 && Math.abs(pos.z - rz) < 3) tooClose = true;
            }
            for (const pos of rockPositions) {
                if (Math.abs(pos.x - rx) < 3 && Math.abs(pos.z - rz) < 3) tooClose = true;
            }
        } while (tooClose);
        rockPositions.push({x: rx, z: rz});
        // Creative small rock cluster
        const clusterCount = 2 + Math.floor(Math.random()*3); // 2-4 boxes
        const cluster = [];
        for (let j = 0; j < clusterCount; j++) {
            const box = BABYLON.MeshBuilder.CreateBox('rock'+i+'_'+j, {
                size: 0.4 + Math.random() * maxRockSize // 0.4 to maxRockSize+0.4
            }, scene);
            // Offset each box randomly around the center
            box.position.x = rx + (Math.random()-0.5)*0.6;
            box.position.z = rz + (Math.random()-0.5)*0.6;
            box.position.y = 0.25 + Math.random()*0.2;
            box.material = new BABYLON.StandardMaterial('rockMat'+i+'_'+j, scene);
            let gray = 0.4 + Math.random()*0.3;
            box.material.diffuseColor = new BABYLON.Color3(gray, gray, gray-0.08);
            // Add a little squash for irregularity
            box.scaling.x *= 0.9 + Math.random()*0.2;
            box.scaling.z *= 0.9 + Math.random()*0.2;
            box.scaling.y *= 0.7 + Math.random()*0.3;
            box.checkCollisions = false;
            cluster.push(box);
        }
        rocks.push(cluster);
    }

    // Car wheel parameters
    const wheelSize = 0.7;
    const wheelYOffset = -0.15; // so wheels touch ground
    const wheelX = 0.8;
    const wheelZ = 1.6;
    const wheelMat = new BABYLON.StandardMaterial('wheelMat', scene);
    wheelMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    // Car
    const car = BABYLON.MeshBuilder.CreateBox('car', {height: 1, width: 2, depth: 4}, scene);
    car.position.y = wheelSize/2 + 0.5; // lift car so wheels touch ground
    car.position.z = -20;
    car.material = new BABYLON.StandardMaterial('carMat', scene);
    // Random shiny color
    const r = 0.3 + Math.random()*0.7;
    const g = 0.3 + Math.random()*0.7;
    const b = 0.3 + Math.random()*0.7;
    car.material.diffuseColor = new BABYLON.Color3(r, g, b);
    car.material.specularPower = 128;
    car.material.specularColor = new BABYLON.Color3(1,1,1); // bright shiny

    // Car hood (square box on top)
    // Random hood size
    const hoodWidth = 1.1 + Math.random()*0.6; // 1.1 - 1.7
    const hoodHeight = 0.5 + Math.random()*0.6; // 0.5 - 1.1
    const hoodDepth = 1.4 + Math.random()*0.9; // 1.4 - 2.3
    const hood = BABYLON.MeshBuilder.CreateBox('carHood', {
        width: hoodWidth,
        height: hoodHeight,
        depth: hoodDepth
    }, scene);
    // Position hood just above car and toward front
    hood.position = new BABYLON.Vector3(0, 0.5 + hoodHeight/2, -0.5 - (hoodDepth-1.4)/2);
    hood.material = new BABYLON.StandardMaterial('hoodMat', scene);
    hood.material.diffuseColor = new BABYLON.Color3(r, g, b); // match car color
    hood.material.specularPower = 128;
    hood.material.specularColor = new BABYLON.Color3(1,1,1);
    hood.parent = car;
    hood.checkCollisions = false;

    // Car wheels (square, with collision)
    const wheels = [];
    for (let i = 0; i < 4; i++) {
        const wx = (i < 2 ? -1 : 1) * wheelX;
        const wz = (i % 2 === 0 ? -1 : 1) * wheelZ;
        const wheel = BABYLON.MeshBuilder.CreateBox('wheel'+i, {size: wheelSize}, scene);
        wheel.position = new BABYLON.Vector3(wx, wheelYOffset, wz);
        wheel.material = wheelMat;
        wheel.checkCollisions = true;
        wheel.parent = car;
        wheels.push(wheel);
    }
    // Track wheel rotation
    let wheelRotation = 0;

    // Car wheel trails
    const wheelTrails = [];
    const TRAIL_FADE_TIME = 2.0; // seconds


    // Camera
    const camera = new BABYLON.FollowCamera('carCam', new BABYLON.Vector3(0, 40, -35), scene);
    camera.lockedTarget = car;
    camera.radius = -40;
    camera.heightOffset = 60;
    camera.rotationOffset = 0;
    // camera.attachControl(canvas, true); // Disable default camera controls

    // Mouse and touch controls for car turning: face toward drag/touch position relative to canvas center
    let pointerTurning = false;
    function getPointerPos(e) {
        // Support both mouse and touch
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else {
            return { x: e.clientX, y: e.clientY };
        }
    }
    function updateCarRotationToPointer(e) {
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const pos = getPointerPos(e);
        const dx = pos.x - centerX;
        const dz = centerY - pos.y; // Invert Y so up is forward
        if (Math.abs(dx) > 2 || Math.abs(dz) > 2) {
            carRot = BABYLON.Tools.ToDegrees(Math.atan2(dx, dz));
        }
    }
    // Mouse events
    canvas.addEventListener('mousedown', (e) => {
        pointerTurning = true;
        updateCarRotationToPointer(e);
    });
    window.addEventListener('mouseup', () => { pointerTurning = false; });
    window.addEventListener('mousemove', (e) => {
        if (!pointerTurning || inputLocked) return;
        updateCarRotationToPointer(e);
    });
    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        pointerTurning = true;
        updateCarRotationToPointer(e);
    });
    window.addEventListener('touchend', () => { pointerTurning = false; });
    window.addEventListener('touchcancel', () => { pointerTurning = false; });
    window.addEventListener('touchmove', (e) => {
        if (!pointerTurning || inputLocked) return;
        updateCarRotationToPointer(e);
    });

    // Enable tree and rock collisions after 1s
    setTimeout(() => {
        for (const t of trees) {
            t.trunk.checkCollisions = true;
            t.leaves.checkCollisions = true;
        }
        for (const cluster of rocks) {
            for (const sphere of cluster) sphere.checkCollisions = true;
        }
    }, 2000);

    // --- Win popup setup ---
    function showWinPopup() {
        inputLocked = true;
        const popup = document.createElement('div');
        popup.id = 'winPopup';
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.background = 'rgba(30, 30, 30, 0.95)';
        popup.style.padding = '3em 2em 2em 2em';
        popup.style.borderRadius = '18px';
        popup.style.color = 'white';
        popup.style.fontFamily = 'monospace';
        popup.style.fontSize = '2.2em';
        popup.style.textAlign = 'center';
        popup.style.zIndex = '99999';
        popup.style.boxShadow = '0 0 32px #0008';
        popup.innerHTML = '<div>Congratulations!<br>You cut every tree!</div>';
        const btn = document.createElement('button');
        btn.textContent = 'Next challenge';
        btn.style.marginTop = '2em';
        btn.style.fontSize = '1.2em';
        btn.style.padding = '0.5em 2em';
        btn.style.borderRadius = '8px';
        btn.style.border = 'none';
        btn.style.background = '#4caf50';
        btn.style.color = 'white';
        btn.style.cursor = 'pointer';
        btn.onclick = function() {
            // Increase tree count and max rock size for next round and save
            let nextTreeCount = Math.round(treeCount * 1.5);
            let nextMaxRockSize = Math.round(maxRockSize * 2.25 * 100) / 100; // round to 2 decimals
            localStorage.setItem('treeCount', nextTreeCount.toString());
            localStorage.setItem('maxRockSize', nextMaxRockSize.toString());
            location.reload();
        };
        popup.appendChild(btn);
        document.body.appendChild(popup);
    }
    // Countdown overlay and input lock
    let inputLocked = true;
    let countdownDiv = document.createElement('div');
    countdownDiv.id = 'countdownOverlay';
    countdownDiv.style.position = 'fixed';
    countdownDiv.style.top = '25%';
    countdownDiv.style.left = '50%';
    countdownDiv.style.transform = 'translate(-50%, -25%)';
    countdownDiv.style.fontSize = '14vw';
    countdownDiv.style.fontFamily = 'monospace';
    countdownDiv.style.color = 'white';
    countdownDiv.style.textShadow = '0 0 20px #000, 0 0 10px #000';
    countdownDiv.style.zIndex = '9999';
    countdownDiv.style.pointerEvents = 'none';
    document.body.appendChild(countdownDiv);
    const countdownSequence = ['3', '2', '1', 'CUT'];
    let countdownIndex = 0;
    function showCountdownStep() {
        countdownDiv.textContent = countdownSequence[countdownIndex];
        countdownIndex++;
        if (countdownIndex < countdownSequence.length) {
            setTimeout(showCountdownStep, 900);
        } else {
            setTimeout(() => {
                countdownDiv.remove();
                inputLocked = false;
            }, 900);
        }
    }
    showCountdownStep();

    // Car movement
    let keys = { w: false, a: false, s: false, d: false };
    window.addEventListener('keydown', e => {
        if (inputLocked) return;
        if (e.key === 'w') keys.w = true;
        if (e.key === 'a') keys.a = true;
        if (e.key === 's') keys.s = true;
        if (e.key === 'd') keys.d = true;
    });
    window.addEventListener('keyup', e => {
        if (inputLocked) return;
        if (e.key === 'w') keys.w = false;
        if (e.key === 'a') keys.a = false;
        if (e.key === 's') keys.s = false;
        if (e.key === 'd') keys.d = false;
    });

    let carSpeed = 0;
    let carRot = 0;
    const originalMaxSpeed = 0.5;
    let maxSpeed = originalMaxSpeed;
    const accel = 0.02;
    const turnSpeed = 2.5; // degrees per frame
    const friction = 0.98;

    // Car lives system
    // Only initialize carLives and carExploded if not already set (prevents re-init on reload)
    if (typeof window.carLives === 'undefined') window.carLives = 5;
    if (typeof window.carExploded === 'undefined') window.carExploded = false;
    let carLives = window.carLives;
    // Show lives on screen
    let lifeDiv = document.getElementById('carLives');
    if (!lifeDiv) {
        lifeDiv = document.createElement('div');
        lifeDiv.id = 'carLives';
        lifeDiv.style.position = 'absolute';
        lifeDiv.style.top = '10px';
        lifeDiv.style.left = '10px';
        lifeDiv.style.color = 'white';
        lifeDiv.style.fontSize = '2em';
        lifeDiv.style.fontFamily = 'monospace';
        lifeDiv.style.textShadow = '0 0 5px #000';
        document.body.appendChild(lifeDiv);
    }
    function updateLives() {
        lifeDiv.textContent = 'Lives: ' + carLives;
    }
    updateLives();

    scene.onBeforeRenderObservable.add(() => {
        // Wheel trails: spawn and fade
        const now = performance.now() / 1000;
        for (const wheel of wheels) {
            // World position of wheel
            const wheelWorld = wheel.getAbsolutePosition();
            // Compute wheel's movement direction (forward vector of car)
            const forward = new BABYLON.Vector3(Math.sin(car.rotation.y), 0, Math.cos(car.rotation.y));
            // Trail opacity and color depend on speed
            const speedRatio = Math.min(Math.abs(carSpeed) / maxSpeed, 1.0);
            const baseBrown = {r: 0.545, g: 0.353, b: 0.169};
            // Make brown darker at higher speed
            const darken = 0.15 * speedRatio;
            const trailColor = new BABYLON.Color3(
                baseBrown.r - darken,
                baseBrown.g - darken,
                baseBrown.b - darken
            );
            const trailAlpha = 0.2 + 0.5 * speedRatio; // 0.2 (slow) to 0.7 (fast)
            // Create multiple trail marks per frame for higher density
            const TRAIL_DENSITY = 3; // Number of trails per wheel per frame
            for (let t = 0; t < TRAIL_DENSITY; t++) {
                // Offset slightly backward for each trail
                const offset = -t * (wheelSize * 0.18);
                const pos = wheelWorld.add(forward.scale(offset));
                const trail = BABYLON.MeshBuilder.CreatePlane('wheelTrail', {size: wheelSize*0.7}, scene);
                trail.position = new BABYLON.Vector3(pos.x, 0.01, pos.z);
                trail.rotation.x = Math.PI/2;
                const mat = new BABYLON.StandardMaterial('trailMat', scene);
                mat.diffuseColor = trailColor;
                mat.alpha = trailAlpha;
                mat.specularColor = new BABYLON.Color3(0,0,0);
                trail.material = mat;
                trail.isPickable = false;
                trail.checkCollisions = false;
                wheelTrails.push({mesh: trail, spawnTime: now, initialAlpha: trailAlpha});
            }
        }
        // Fade out and remove old trails
        for (let i = wheelTrails.length - 1; i >= 0; i--) {
            const t = wheelTrails[i];
            const age = now - t.spawnTime;
            if (age > TRAIL_FADE_TIME) {
                t.mesh.dispose();
                wheelTrails.splice(i, 1);
            } else {
                // Fade out from initial alpha
                t.mesh.material.alpha = t.initialAlpha * (1 - age / TRAIL_FADE_TIME);
            }
        }
        // Animate wheel rotation
        wheelRotation += carSpeed * 0.25 * 2 * Math.PI; // proportional to speed
        for (const wheel of wheels) {
            wheel.rotation.x = wheelRotation;
        }

        // --- Fire effect from tires ---
        const FIRE_SPEED_THRESHOLD = originalMaxSpeed * 1.5; // start fire at 85% of max speed
        const fireParticles = window._fireParticles || [];
        window._fireParticles = fireParticles;
        if (Math.abs(carSpeed) > FIRE_SPEED_THRESHOLD) {
            // Number of squares per frame scales with speed
            const firePerWheel = Math.ceil(Math.abs(carSpeed) / maxSpeed * 4); // up to 4 per wheel per frame
            for (const wheel of wheels) {
                const wheelWorld = wheel.getAbsolutePosition();
                for (let f = 0; f < firePerWheel; f++) {
                    // Random size: 0.12 to 0.35
                    const fireSize = 0.12 + Math.random()*0.23;
                    const fire = BABYLON.MeshBuilder.CreateBox('fire', {size: fireSize}, scene);
                    fire.position = wheelWorld.add(new BABYLON.Vector3((Math.random()-0.5)*0.13, 0.11 + Math.random()*0.04, (Math.random()-0.5)*0.13));
                    fire.rotation.x = Math.random()*Math.PI*2;
                    fire.rotation.y = Math.random()*Math.PI*2;
                    fire.material = new BABYLON.StandardMaterial('fireMat', scene);
                    // Flicker color: red/orange/yellow
                    const c = Math.random();
                    if (c < 0.5) {
                        fire.material.diffuseColor = new BABYLON.Color3(1, 0.3 + Math.random()*0.4, 0);
                    } else if (c < 0.8) {
                        fire.material.diffuseColor = new BABYLON.Color3(1, 0.7, 0.1 + Math.random()*0.2);
                    } else {
                        fire.material.diffuseColor = new BABYLON.Color3(1, 1, 0.3 + Math.random()*0.2);
                    }
                    fire.material.emissiveColor = fire.material.diffuseColor;
                    fire.material.alpha = 0.7;
                    fire.isPickable = false;
                    fire.checkCollisions = false;
                    // Random velocity: x/z -0.02 to 0.02, y 0.01 to 0.04
                    const velocity = new BABYLON.Vector3(
                        (Math.random()-0.5)*0.04,
                        0.01 + Math.random()*0.03,
                        (Math.random()-0.5)*0.04
                    );
                    fireParticles.push({mesh: fire, ttl: 14 + Math.random()*6, velocity});
                }
            }
        }
        // Animate and fade fire particles
        for (let i = fireParticles.length - 1; i >= 0; i--) {
            const fp = fireParticles[i];
            fp.ttl--;
            fp.mesh.material.alpha *= 0.8;
            if (fp.velocity) {
                fp.mesh.position.addInPlace(fp.velocity);
            } else {
                fp.mesh.position.y += 0.01;
            }
            if (fp.ttl <= 0 || fp.mesh.material.alpha < 0.05) {
                fp.mesh.dispose();
                fireParticles.splice(i, 1);
            }
        }

        // Always drive forward after countdown; before that, car is stopped
        if (inputLocked) {
            carSpeed = 0;
        } else {
            carSpeed = maxSpeed * 0.7;
        }
        // Turning
        if (keys.a) carRot -= turnSpeed * (carSpeed >= 0 ? 1 : -1);
        if (keys.d) carRot += turnSpeed * (carSpeed >= 0 ? 1 : -1);
        car.rotation.y = BABYLON.Tools.ToRadians(carRot);
        // Move car
        const forward = new BABYLON.Vector3(Math.sin(car.rotation.y), 0, Math.cos(car.rotation.y));
        car.position.addInPlace(forward.scale(carSpeed));
        
        // Obstacles removed: no collision or push logic needed
        const carBox = car.getBoundingInfo().boundingBox;

        // Car-tree collision: block or explode
        // Win check: if all trees are cut, show win popup
        if (trees.length === 0 && !document.getElementById('winPopup')) {
            showWinPopup();
        }
        for (let i = trees.length - 1; i >= 0; i--) {
            const trunk = trees[i].trunk;
            const leaves = trees[i].leaves;
            const trunkBox = trunk.getBoundingInfo().boundingBox;
            const leavesBox = leaves.getBoundingInfo().boundingBox;
            if (BABYLON.BoundingBox.Intersects(carBox, trunkBox) || BABYLON.BoundingBox.Intersects(carBox, leavesBox)) {
                if (Math.abs(carSpeed) > 0.25) {
                    // Explode tree (remove and spawn colored boxes)
                    trunk.dispose();
                    leaves.dispose();
                    if (trees[i].extraLeaves) {
                        for (const leaf of trees[i].extraLeaves) leaf.dispose();
                    }
                    trees.splice(i, 1);
                    // Increase max speed by 20% of original
                    maxSpeed += originalMaxSpeed * 0.2;
                    for (let j = 0; j < 18; j++) {
                        const color = j < 6 ? new BABYLON.Color3(0.5,0.3,0.1) : new BABYLON.Color3(0.1,0.7,0.1);
                        const s = BABYLON.MeshBuilder.CreateBox('tree_explode', {size: 0.5 + Math.random()*0.3}, scene);
                        s.position.copyFrom(car.position);
                        s.material = new BABYLON.StandardMaterial('tree_explode_mat', scene);
                        s.material.diffuseColor = color;
                        // Give random velocity
                        const dir = new BABYLON.Vector3((Math.random()-0.5)*2, Math.random()*2, (Math.random()-0.5)*2);
                        s.metadata = {vel: dir, ttl: 32+Math.random()*16};
                    }
                } else {
                    // Block car as with obstacles
                    let pushDir = car.position.subtract(trunk.position);
                    pushDir.y = 0;
                    if (pushDir.lengthSquared() < 0.01) pushDir = new BABYLON.Vector3(Math.random()-0.5, 0, Math.random()-0.5);
                    pushDir.normalize();
                    car.position.addInPlace(pushDir.scale(0.2));
                    carSpeed *= 0.7;
                }
            }
        }
        // Car-rock collision: block or explode
        for (let i = rocks.length - 1; i >= 0; i--) {
            let hit = false;
            for (const sphere of rocks[i]) {
                const box = sphere.getBoundingInfo().boundingBox;
                if (BABYLON.BoundingBox.Intersects(carBox, box)) hit = true;
            }
            if (hit) {
                if (Math.abs(carSpeed) > 0.25) {
                    for (const box of rocks[i]) box.dispose();
                    rocks.splice(i, 1);
                    for (let j = 0; j < 14; j++) {
                        const s = BABYLON.MeshBuilder.CreateBox('rock_explode', {size: 0.3 + Math.random()*0.2}, scene);
                        s.position.copyFrom(car.position);
                        s.material = new BABYLON.StandardMaterial('rock_explode_mat', scene);
                        let gray = 0.4 + Math.random()*0.3;
                        s.material.diffuseColor = new BABYLON.Color3(gray, gray, gray-0.08);
                        // Give random velocity
                        const dir = new BABYLON.Vector3((Math.random()-0.5)*2, Math.random()*2, (Math.random()-0.5)*2);
                        s.metadata = {vel: dir, ttl: 28+Math.random()*12};
                    }

                    console.log("rock hit");
                    // Lose a life, flash car red
                    if (carLives > 0) carLives--;
                    updateLives();
                    // Flash car red for feedback
                    const oldColor = car.material.diffuseColor.clone();
                    car.material.diffuseColor = new BABYLON.Color3(1,0,0);
                    setTimeout(() => { car.material.diffuseColor = oldColor; }, 200);
                     if (carLives <= 0 && !window.carExploded) {
                         // Trigger car explosion (same as falling logic)
                         window.carExploded = true;
                         // Explode car into more, larger, and varied colored boxes
                         const explosionPower = 0.5 + Math.abs(carSpeed)*1.5;
                         const numCubes = 18 + Math.floor(Math.abs(carSpeed)*42);
                         for (let j = 0; j < numCubes; j++) {
                             const sx = 0.5 + Math.random()*1.1;
                             const sy = 0.5 + Math.random()*1.1;
                             const sz = 0.5 + Math.random()*1.1;
                             const s = BABYLON.MeshBuilder.CreateBox('car_explode', {size: 0.5 + Math.random()*0.4}, scene);
                             s.position = car.position.add(new BABYLON.Vector3((Math.random()-0.5)*2, 0.5+Math.random()*2, (Math.random()-0.5)*2));
                             s.material = new BABYLON.StandardMaterial('car_explode_mat', scene);
                             s.material.diffuseColor = oldColor;
                             // Give bigger random velocity based on car speed
                             const dir = new BABYLON.Vector3((Math.random()-0.5)*6, Math.random()*3, (Math.random()-0.5)*6).scale(explosionPower);
                             s.metadata = {vel: dir, ttl: 32+Math.random()*16};
                         }
                         car.dispose();
                         hood.dispose();
                         for (const wheel of wheels) wheel.dispose();
                         setTimeout(() => location.reload(), 1200);
                         return;
                     }
                } else {
                    
                    // Block car as with obstacles
                    for (const sphere of rocks[i]) {
                        const box = sphere.getBoundingInfo().boundingBox;
                        if (BABYLON.BoundingBox.Intersects(carBox, box)) {
                            let pushDir = car.position.subtract(sphere.position);
                            pushDir.y = 0;
                            if (pushDir.lengthSquared() < 0.01) pushDir = new BABYLON.Vector3(Math.random()-0.5, 0, Math.random()-0.5);
                            pushDir.normalize();
                            car.position.addInPlace(pushDir.scale(0.15));
                            carSpeed *= 0.7;
                            break; // Only block once per cluster
                        }
                    }
                }
            }
        }
        // Obstacles removed: no obstacle-obstacle collision logic needed

        // Animate explosions
        scene.meshes.forEach(mesh => {
            if (mesh.metadata && mesh.metadata.vel) {
                mesh.position.addInPlace(mesh.metadata.vel.scale(0.2));
                mesh.metadata.vel.y -= 0.08; // gravity
                mesh.metadata.ttl--;
                if (mesh.metadata.ttl <= 0) mesh.dispose();
            }
        });
        // Car falling logic when leaving map
        // Only start falling if car is actually off the map
        if (!window.carFalling && (Math.abs(car.position.x) > 50 || Math.abs(car.position.z) > 50)) {
            window.carFalling = true;
            window.carFallVel = 0;
        }
        if (window.carFalling) {
            if (window.carExploded) return;
            window.carFallVel -= 0.045; // gravity
            car.position.y += window.carFallVel;
            if (car.position.y < -10 && !window.carExploded) {
                window.carExploded = true;
                // Explode car into more, larger, and varied colored boxes
                const explosionPower = 0.5 + Math.abs(carSpeed)*1.5;
                const numCubes = 18 + Math.floor(Math.abs(carSpeed)*42);
                // Use car's color for explosion
                const baseColor = car.material.diffuseColor.clone();
                for (let j = 0; j < numCubes; j++) {
                    const sx = 0.5 + Math.random()*1.1;
                    const sy = 0.5 + Math.random()*1.1;
                    const sz = 0.5 + Math.random()*1.1;
                    const s = BABYLON.MeshBuilder.CreateBox('car_explode', {width: sx, height: sy, depth: sz}, scene);
                    s.position.copyFrom(car.position);
                    s.material = new BABYLON.StandardMaterial('car_explode_mat', scene);
                    // Slightly randomize color for effect
                    s.material.diffuseColor = new BABYLON.Color3(
                        Math.max(0, Math.min(1, baseColor.r + (Math.random()-0.5)*0.2)),
                        Math.max(0, Math.min(1, baseColor.g + (Math.random()-0.5)*0.2)),
                        Math.max(0, Math.min(1, baseColor.b + (Math.random()-0.5)*0.2))
                    );
                    // Give bigger random velocity based on car speed
                    const dir = new BABYLON.Vector3((Math.random()-0.5)*6, Math.random()*3, (Math.random()-0.5)*6).scale(explosionPower);
                    s.metadata = {vel: dir, ttl: 32+Math.random()*16};
                }
                car.dispose();
                hood.dispose();
                for (const wheel of wheels) wheel.dispose();
                setTimeout(() => location.reload(), 1200);
                return;
            }
        }

        // Camera always directly behind car
        camera.rotationOffset = -carRot;
    });

    engine.runRenderLoop(() => {
        scene.render();
    });
    window.addEventListener('resize', function() {
        engine.resize();
    });
});
