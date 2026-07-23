
        // --- 1. Three.js Scene Setup ---
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.05);
        
        // Push camera down a bit to frame upper body nicely
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
        camera.position.set(0, 1.2, 3); 
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        // Enhance lighting for models
        renderer.outputEncoding = THREE.sRGBEncoding;
        document.body.appendChild(renderer.domElement);
        
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.target.set(0, 1, 0);

        // Grid & Lights
        const grid = new THREE.GridHelper(20, 40, 0x0088ff, 0x001122);
        grid.position.y = 0;
        scene.add(grid);

        const light = new THREE.DirectionalLight(0xffffff, 1.0);
        light.position.set(1, 2, 3).normalize();
        scene.add(light);
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));

        // --- 1.5 Stickman Setup ---
        const matPose = new THREE.MeshBasicMaterial({ color: 0x00ffff }); // Bright Cyan
        const matHandL = new THREE.MeshBasicMaterial({ color: 0xff00ff }); // Bright Magenta
        const matHandR = new THREE.MeshBasicMaterial({ color: 0xffd700 }); // Bright Gold
        
        const matLinePose = new THREE.LineBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.6 });
        const matLineHandL = new THREE.LineBasicMaterial({ color: 0xff66ff, transparent: true, opacity: 0.8 });
        const matLineHandR = new THREE.LineBasicMaterial({ color: 0xffe666, transparent: true, opacity: 0.8 });

        const groupStickman = new THREE.Group();
        groupStickman.position.set(1.0, 1, 0); // Offset to the right
        scene.add(groupStickman);

        const groupPose = new THREE.Group();
        const groupHands = new THREE.Group();
        groupStickman.add(groupPose);
        groupStickman.add(groupHands);

        const POSE_PAIRS = [[0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10], [11, 12], [11, 13], [13, 15], [12, 14], [14, 16]];
        const HAND_PAIRS = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]];

        let meshesPose = [];
        let meshesHandL = [];
        let meshesHandR = [];
        let linesPose = [];
        let linesHandL = [];
        let linesHandR = [];

        const geoSpherePose = new THREE.SphereGeometry(0.04, 16, 16);
        for(let i=0; i<17; i++) { 
            let mesh = new THREE.Mesh(geoSpherePose, matPose);
            groupPose.add(mesh);
            meshesPose.push(mesh);
        }
        
        const geoSphereHandGolden = new THREE.SphereGeometry(0.02, 16, 16);
        for(let i=0; i<21; i++) {
            let mL = new THREE.Mesh(geoSphereHandGolden, matHandL);
            let mR = new THREE.Mesh(geoSphereHandGolden, matHandR);
            groupHands.add(mL); groupHands.add(mR);
            meshesHandL.push(mL); meshesHandR.push(mR);
        }

        POSE_PAIRS.forEach(pair => {
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
            const line = new THREE.Line(geo, matLinePose);
            groupPose.add(line);
            linesPose.push({line: line, p1: pair[0], p2: pair[1]});
        });

        HAND_PAIRS.forEach(pair => {
            const geoL = new THREE.BufferGeometry();
            geoL.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
            const lineL = new THREE.Line(geoL, matLineHandL);
            groupHands.add(lineL);
            linesHandL.push({line: lineL, p1: pair[0], p2: pair[1]});

            const geoR = new THREE.BufferGeometry();
            geoR.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
            const lineR = new THREE.Line(geoR, matLineHandR);
            groupHands.add(lineR);
            linesHandR.push({line: lineR, p1: pair[0], p2: pair[1]});
        });

        // --- 2. VRM Loading Logic ---
        let currentVRM = null;
        let vrmBones = {};
        const gltfLoader = new THREE.GLTFLoader();

        function loadVRM(url) {
            const badge = document.getElementById('statusBadge');
            badge.innerText = "鈼?LOADING VRM MODEL...";
            badge.className = "badge waiting";
            
            gltfLoader.load(url,
                (gltf) => {
                    if (THREE.VRMUtils) THREE.VRMUtils.removeUnnecessaryJoints(gltf.scene);
                    THREE.VRM.from(gltf).then((vrm) => {
                        if (currentVRM) {
                            scene.remove(currentVRM.scene);
                            currentVRM.dispose();
                        }
                        currentVRM = vrm;
                        scene.add(vrm.scene);
                        vrm.scene.rotation.y = Math.PI; // Face the camera
                        
                        // Cache common bones for Kalidokit
                        const Schema = THREE.VRMSchema.HumanoidBoneName;
                        vrmBones = {
                            Chest: vrm.humanoid.getBoneNode(Schema.Chest),
                            Spine: vrm.humanoid.getBoneNode(Schema.Spine),
                            RightUpperArm: vrm.humanoid.getBoneNode(Schema.RightUpperArm),
                            RightLowerArm: vrm.humanoid.getBoneNode(Schema.RightLowerArm),
                            LeftUpperArm: vrm.humanoid.getBoneNode(Schema.LeftUpperArm),
                            LeftLowerArm: vrm.humanoid.getBoneNode(Schema.LeftLowerArm),
                            RightHand: vrm.humanoid.getBoneNode(Schema.RightHand),
                            LeftHand: vrm.humanoid.getBoneNode(Schema.LeftHand),
                            Head: vrm.humanoid.getBoneNode(Schema.Head),
                            Neck: vrm.humanoid.getBoneNode(Schema.Neck)
                        };

                        badge.innerText = "鉁?VRM ACTIVE (UPPER-BODY ONLY)";
                        badge.className = "badge active";
                    });
                },
                (progress) => {},
                (error) => {
                    console.error("Error loading VRM:", error);
                    badge.innerText = "鈿?LOAD FAILED. PLEASE DRAG & DROP A .VRM FILE";
                    badge.style.borderColor = "red";
                    badge.style.color = "red";
                }
            );
        }

        // Try to load default AliciaSolid from v9
        loadVRM('../v9/AliciaSolid.vrm');

        // Drag & Drop Handlers
        const dragLayer = document.getElementById('drag-layer');
        document.body.addEventListener('dragover', (e) => {
            e.preventDefault();
            dragLayer.style.display = 'flex';
        });
        document.body.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dragLayer.style.display = 'none';
        });
        document.body.addEventListener('drop', (e) => {
            e.preventDefault();
            dragLayer.style.display = 'none';
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                if (file.name.toLowerCase().endsWith('.vrm')) {
                    const url = URL.createObjectURL(file);
                    loadVRM(url);
                }
            }
        });

        // --- 3. Kalidokit IK Solver & WebSocket ---
        // Helper to rotate bones smoothly
        const rigRotation = (name, rotation = { x: 0, y: 0, z: 0 }, dampener = 1, lerpAmount = 0.3) => {
            if (!currentVRM || !vrmBones[name]) return;
            const Part = vrmBones[name];
            let euler = new THREE.Euler(rotation.x * dampener, rotation.y * dampener, rotation.z * dampener);
            let quaternion = new THREE.Quaternion().setFromEuler(euler);
            Part.quaternion.slerp(quaternion, lerpAmount);
        };

        // Standard V11 websocket port
        const ws = new WebSocket('ws://127.0.0.1:8768');
        
        ws.onopen = () => console.log("WebSocket Connected (8768)");
        ws.onerror = () => console.error("WebSocket Error. Python server running?");
        
        let latestData = null;
        ws.onmessage = (e) => {
            latestData = JSON.parse(e.data);
            const data = latestData;
            const VIS_SCALE = 2.0; // Scaled down to match VRM proportions
            
            // Render Stickman Pose
            if(data.pose) {
                const pList = Object.keys(data.pose).map(k => ({id: parseInt(k), ...data.pose[k]}));
                pList.forEach(p => {
                    if(meshesPose[p.id]) {
                        meshesPose[p.id].position.set(p.x * VIS_SCALE, -p.y * VIS_SCALE, p.z * VIS_SCALE);
                        meshesPose[p.id].visible = true;
                    }
                });
                linesPose.forEach(l => {
                    if(data.pose[l.p1] && data.pose[l.p2]) {
                        const p1 = data.pose[l.p1]; const p2 = data.pose[l.p2];
                        l.line.geometry.attributes.position.array[0] = p1.x * VIS_SCALE;
                        l.line.geometry.attributes.position.array[1] = -p1.y * VIS_SCALE;
                        l.line.geometry.attributes.position.array[2] = p1.z * VIS_SCALE;
                        l.line.geometry.attributes.position.array[3] = p2.x * VIS_SCALE;
                        l.line.geometry.attributes.position.array[4] = -p2.y * VIS_SCALE;
                        l.line.geometry.attributes.position.array[5] = p2.z * VIS_SCALE;
                        l.line.geometry.attributes.position.needsUpdate = true;
                        l.line.visible = true;
                    } else l.line.visible = false;
                });
            } else {
                meshesPose.forEach(m => m.position.set(0,100,0)); 
                linesPose.forEach(l => l.line.visible = false);
            }

            // Render Stickman Hands
            if(data.golden) {
                let hL = null, hR = null;
                if (data.hands["Left"]) hL = data.hands["Left"];
                if (data.hands["Right"]) hR = data.hands["Right"];
                
                if(hL && hL.length > 0) {
                    hL.forEach((p, i) => { meshesHandL[i].position.set(p.x * VIS_SCALE, -p.y * VIS_SCALE, p.z * VIS_SCALE); meshesHandL[i].visible = true; });
                    linesHandL.forEach(l => {
                        const p1 = hL[l.p1]; const p2 = hL[l.p2];
                        l.line.geometry.attributes.position.array[0] = p1.x * VIS_SCALE;
                        l.line.geometry.attributes.position.array[1] = -p1.y * VIS_SCALE;
                        l.line.geometry.attributes.position.array[2] = p1.z * VIS_SCALE;
                        l.line.geometry.attributes.position.array[3] = p2.x * VIS_SCALE;
                        l.line.geometry.attributes.position.array[4] = -p2.y * VIS_SCALE;
                        l.line.geometry.attributes.position.array[5] = p2.z * VIS_SCALE;
                        l.line.geometry.attributes.position.needsUpdate = true;
                        l.line.visible = true;
                    });
                } else {
                    meshesHandL.forEach(m => m.position.set(0,100,0));
                    meshesHandL.forEach(m => m.visible = false);
                    linesHandL.forEach(l => l.line.visible = false);
                }
                
                if(hR && hR.length > 0) {
                    hR.forEach((p, i) => { meshesHandR[i].position.set(p.x * VIS_SCALE, -p.y * VIS_SCALE, p.z * VIS_SCALE); meshesHandR[i].visible = true; });
                    linesHandR.forEach(l => {
                        const p1 = hR[l.p1]; const p2 = hR[l.p2];
                        l.line.geometry.attributes.position.array[0] = p1.x * VIS_SCALE;
                        l.line.geometry.attributes.position.array[1] = -p1.y * VIS_SCALE;
                        l.line.geometry.attributes.position.array[2] = p1.z * VIS_SCALE;
                        l.line.geometry.attributes.position.array[3] = p2.x * VIS_SCALE;
                        l.line.geometry.attributes.position.array[4] = -p2.y * VIS_SCALE;
                        l.line.geometry.attributes.position.array[5] = p2.z * VIS_SCALE;
                        l.line.geometry.attributes.position.needsUpdate = true;
                        l.line.visible = true;
                    });
                } else {
                    meshesHandR.forEach(m => m.position.set(0,100,0));
                    meshesHandR.forEach(m => m.visible = false);
                    linesHandR.forEach(l => l.line.visible = false);
                }
            } else {
                meshesHandL.forEach(m => m.position.set(0,100,0));
                meshesHandL.forEach(m => m.visible = false);
                linesHandL.forEach(l => l.line.visible = false);
                meshesHandR.forEach(m => m.position.set(0,100,0));
                meshesHandR.forEach(m => m.visible = false);
                linesHandR.forEach(l => l.line.visible = false);
            }
        };

        // --- 4. Render Loop ---
        let clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            
            if (latestData && currentVRM) {
                const data = latestData;
                latestData = null; // Consume data

                // 1. Solve Upper Body Pose (Ignore Legs)
                if (data.pose) {
                    let pose3D = [];
                    let pose2D = [];
                    for(let i=0; i<33; i++) {
                        if(data.pose[i]) {
                            pose3D.push({x: data.pose[i].x, y: data.pose[i].y, z: data.pose[i].z, visibility: data.pose[i].v || 1});
                            // Create a dummy 2D pose mapped into a 0~1 space to prevent NaN crashes
                            pose2D.push({x: data.pose[i].x * 0.5 + 0.5, y: data.pose[i].y * 0.5 + 0.5, visibility: data.pose[i].v || 1});
                        } else {
                            pose3D.push({x: 0, y: 0, z: 0, visibility: 0});
                            pose2D.push({x: 0, y: 0, visibility: 0});
                        }
                    }
                    
                    // 銆愭牳蹇冧慨澶嶃€戜吉閫犻珛鍏宠妭 (23: 宸﹂珛, 24: 鍙抽珛)
                    // Kalidokit 寮哄埗瑕佹眰鍙岃偐鍜屽弻楂嬫瀯鎴愯函骞插洓杈瑰舰鏉ヨ绠?Spine銆傚悗绔幓鎺変簡涓嬪崐韬紝鎴戜滑蹇呴』浼€狅紒
                    if (pose3D[11] && pose3D[12]) {
                        const HIP_OFFSET_Y = 0.55; // 浼€犲ぇ绾?55 鍘樼背鐨勮函骞查暱搴?(MediaPipe Y鍚戜笅涓烘)
                        pose3D[23] = { x: pose3D[11].x, y: pose3D[11].y + HIP_OFFSET_Y, z: pose3D[11].z, visibility: 1 };
                        pose3D[24] = { x: pose3D[12].x, y: pose3D[12].y + HIP_OFFSET_Y, z: pose3D[12].z, visibility: 1 };
                        
                        pose2D[23] = { x: pose2D[11].x, y: pose2D[11].y + 0.3, visibility: 1 };
                        pose2D[24] = { x: pose2D[12].x, y: pose2D[12].y + 0.3, visibility: 1 };
                    }
                    
                    // Kalidokit pose expects pose3D and pose2D
                    let riggedPose = Kalidokit.Pose.solve(pose3D, pose2D, { runtime: "mediapipe", imageSize: { width: 640, height: 480 } });
                    
                    if (riggedPose) {
                        rigRotation("Chest", riggedPose.Spine, 0.25, 0.3);
                        rigRotation("Spine", riggedPose.Spine, 0.45, 0.3);
                        rigRotation("RightUpperArm", riggedPose.RightUpperArm, 1, 0.3);
                        rigRotation("RightLowerArm", riggedPose.RightLowerArm, 1, 0.3);
                        rigRotation("LeftUpperArm", riggedPose.LeftUpperArm, 1, 0.3);
                        rigRotation("LeftLowerArm", riggedPose.LeftLowerArm, 1, 0.3);
                        if (riggedPose.Head) {
                            rigRotation("Head", riggedPose.Head, 1, 0.3);
                        }
                    }
                }

                // 2. Solve Hands
                if (data.hands) {
                    if (data.hands["Left"] && data.hands["Left"].length === 21) {
                        let hand3D = data.hands["Left"].map(p => ({x: p.x, y: p.y, z: p.z}));
                        let riggedLeftHand = Kalidokit.Hand.solve(hand3D, "Left");
                        if (riggedLeftHand) {
                            for (const [key, value] of Object.entries(riggedLeftHand)) {
                                let boneName = key === "LeftWrist" ? "LeftHand" : key;
                                if (!vrmBones[boneName]) {
                                    vrmBones[boneName] = currentVRM.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName[boneName]);
                                }
                                rigRotation(boneName, value, 1, 0.3);
                            }
                        }
                    }
                    
                    if (data.hands["Right"] && data.hands["Right"].length === 21) {
                        let hand3D = data.hands["Right"].map(p => ({x: p.x, y: p.y, z: p.z}));
                        let riggedRightHand = Kalidokit.Hand.solve(hand3D, "Right");
                        if (riggedRightHand) {
                            for (const [key, value] of Object.entries(riggedRightHand)) {
                                let boneName = key === "RightWrist" ? "RightHand" : key;
                                if (!vrmBones[boneName]) {
                                    vrmBones[boneName] = currentVRM.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName[boneName]);
                                }
                                rigRotation(boneName, value, 1, 0.3);
                            }
                        }
                    }
                }
            }

            if (currentVRM) {
                currentVRM.update(clock.getDelta());
            }
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    
