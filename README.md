# Camellia Golden Hands: Decoupled Kinematics Dataset & Real-Time Mocap Studio 🤖👐

![Camellia V11](https://img.shields.io/badge/Camellia-V11.5_Engine-blue?style=for-the-badge) ![Robotics](https://img.shields.io/badge/Application-Dexterous_Hands_%26_Embodied_AI-orange?style=for-the-badge) ![FPS](https://img.shields.io/badge/FPS-60_Solid-green?style=for-the-badge) ![Zero-GPU](https://img.shields.io/badge/Zero--GPU-Pure_CPU-success?style=for-the-badge)

> 🔥 **NEW Release v1.1 Update**: 
> 1. **Live Mocap Studio (Mac + iOS)**: Precompiled standalone `CamelliaMocapStudio.app` for Mac and `CamelliaNode` iOS App (supporting TrueDepth & Rear LiDAR 60 FPS streaming). Download from [Releases](https://github.com/guanenyu-prog/Camellia-Golden-Hands/releases).
> 2. **Extreme Stress Test**: Added `003.json` & `003.mp4` — Extreme high-frequency electric guitar picking (33 FPS, high occlusion, Zero-GPU).
> 3. **VRM 3D Simulator**: Upgraded `index.html` with real-time 3D stickman and Drag-and-Drop VRM avatar kinematic retargeting.

---

## 💥 Why Camellia is Different

Standard 3D pose extraction from monocular RGB cameras (e.g. MediaPipe / single RGB AI) suffers from two fatal flaws when applied to robotics and high-precision animation:
1. **Perspective Distortion (The Rubber Hand Problem)**: As hands move closer to or further from the camera, 2D projected pixel distances vary non-linearly, causing bone lengths to stretch and shrink erratically.
2. **Global Body Coupling**: Hands are mapped relative to camera coordinates rather than a localized physical origin, making isolated end-effector control impossible without solving full-body IK.

### The Camellia Decoupling Solution
This dataset and the live real-time engine apply strict rigid body mathematical constraints:

* **Absolute Wrist Origin `(0,0,0)`**: The wrist (Node 0) of every hand in every single frame is mathematically locked to `(0,0,0)`. All 20 subsequent finger nodes are purely relative vectors to the wrist. This achieves **perfect decoupling** between the end-effector (hand) and the main arm, allowing you to train or drive the dexterous hand independently of arm position.
* **Constant Topological Rigidity**: We apply a dimensionless `ratio_matrix_factor` based on absolute human anatomical constants (Target Hand Length = 0.21m). Perspective distortion is eradicated. Distance from the wrist to the middle finger knuckle remains an absolute physical constant from Frame 1 to Frame N. **Your IK solvers will never crash due to impossible bone scaling.**
* **Zero-GPU, Extreme Cost-Efficiency**: The entire capture and cleaning pipeline runs on **pure CPU** using nothing but consumer Apple hardware (iPhone TrueDepth/LiDAR + Mac laptop) or standard cameras without a dedicated GPU. We achieve industrial-grade rigid-body mocap standards without multi-million dollar optical tracking studios (Vicon/OptiTrack) or expensive data gloves.

---

## 📂 Repository Contents

* **`001.mp4`** / **`001v1.json`**: Basic sign language and grasping gestures.
* **`002.mp4`** / **`002v1.json`**: Precision manipulation and dexterous finger folding.
* **`003.mp4`** / **`003.json`** 🎸: **[Extreme Stress Test]** High-frequency electric guitar picking. Demonstrates pure 33FPS tracking of high-occlusion, fast-moving fingers with zero latency and zero perspective distortion.
* **`index.html`**: Web-based Three.js + VRM Hand Simulator for real-time 3D kinematic visualization.
* **`Camellia_V11_Golden_Hands_Dataset_Usage.md`**: Detailed coordinate frame conventions and Isaac Sim / MuJoCo integration guide.

---

## 🚀 Live Real-Time Mocap Studio (Mac + iOS)

You can now run the complete **60 FPS Live Motion Capture Studio** on your own Mac and iPhone:

### 1. Download Precompiled Packages
Download the latest binaries from [GitHub Releases](https://github.com/guanenyu-prog/Camellia-Golden-Hands/releases):
* 💻 **`CamelliaMocapStudio_Mac.zip`**: Standalone Mac Workstation App (built-in V11 single-node daemon + WebSocket 8768 + 3D Viewport).
* 🍎 **`CamelliaNode_iOS.zip`**: Complete Xcode Project for iPhone (Front TrueDepth + Rear LiDAR 60 FPS stream).

### 2. Quick 1-Minute Setup
1. Unzip and run **`CamelliaMocapStudio.app`** on your Mac (it will automatically listen on TCP `8765` and WebSocket `8768`).
2. Build & run **`CamelliaNode`** in Xcode on your iPhone (iOS 15+).
3. On the iPhone App, enter your Mac's Local IP, tap **Connect**, then select **Front (TrueDepth)** or **Rear (LiDAR)** and tap **Start Stream**.
4. The 3D rigid skeleton and dexterous hands will immediately render at **60 FPS** on your Mac!

---

## 🕹️ Live Web Simulator (VRM Avatar Drag-and-Drop)

Open **`index.html`** directly in any modern web browser:
1. The simulator connects to `ws://127.0.0.1:8768` to receive real-time motion capture streams.
2. **Features**:
   * **3D Golden Stickman & Hand Mesh**: Visualizes absolute 3D anatomical joints in physical millimeter metric coordinates.
   * **VRM Avatar Retargeting**: **Drag and drop** any standard `.vrm` 3D character model into the browser window to see full-body Inverse Kinematics mapping in real-time!

---

## 🛠️ JSON Trajectory Structure (Sample)

```json
{
  "frame_idx": 0,
  "time_offset": 0.0,
  "golden_hands": {
    "Left": [
      {"x": 0.0, "y": 0.0, "z": 0.0},       // Node 0: Wrist (Absolute Local Origin)
      {"x": 0.021, "y": -0.015, "z": 0.008} // Node 1: Thumb CMC (Relative Vector in meters)
      // ... Nodes 2 to 20
    ],
    "Right": [] // Empty if occluded
  }
}
```

---

## 💼 Commercial Licensing & Embodied AI Teleoperation

For full-scale multi-camera arrays (up to 18 nodes), sub-millimeter Sony mirrorless camera SDKs, or custom Embodied AI teleoperation dataset pipelines:

* 📧 **Business & Inquiries**: Open an Issue or reach out via repository contacts.
* 📜 **License**: Sample dataset & simulator under MIT License. Core kinematic solver and multi-modal pipeline are proprietary assets of Camellia Project.
