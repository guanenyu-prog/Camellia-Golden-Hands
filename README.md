# Camellia Golden Hands: Decoupled Kinematics Dataset for Dexterous Robot Hands 🤖👐

![Camellia V11](https://img.shields.io/badge/Camellia-V11_Engine-blue?style=for-the-badge) ![Robotics](https://img.shields.io/badge/Application-Dexterous_Hands_&_Embodied_AI-orange?style=for-the-badge)

Welcome to the **Camellia Golden Hands** sample dataset. This repository provides highly-engineered, industrial-grade sign language trajectory datasets designed specifically for driving **Dexterous Robotic Hands** via Inverse Kinematics (IK).

## 🌟 Why this dataset is different

Standard 3D pose extraction from monocular RGB cameras (like MediaPipe) suffers from two fatal flaws when applied directly to robotics:
1. **Perspective Distortion (The Rubber Hand Problem)**: As hands move closer to or further from the camera lens, the 2D projected pixel distance between joints changes, causing the perceived physical bone lengths to stretch and shrink.
2. **Global Body Coupling**: Hands are mapped relative to the camera frame rather than a localized physical origin, making isolated end-effector control impossible without calculating the entire body IK.

### The Camellia Decoupling Solution 📐
This V1 dataset (`001v1.json`, `002v1.json`) has been processed through the **Camellia V11 Constitutional Engine**, which applies strict rigid-body mathematical constraints:

*   **Absolute Wrist Origin `(0,0,0)`**: The wrist (Node 0) of every hand in every single frame is mathematically locked to `(0,0,0)`. All 20 subsequent finger nodes are purely relative vectors to the wrist. This achieves **perfect decoupling** between the end-effector (hand) and the main arm, allowing you to train or drive the dexterous hand independently of arm position.
*   **Constant Topological Rigidity**: We have applied a dimensionless `ratio_matrix_factor` based on absolute human anatomical constants (Target Hand Length = 0.21m). Perspective distortion is eradicated. The distance from the wrist to the middle finger knuckle remains an absolute physical constant from Frame 1 to Frame N. **Your IK solvers will no longer crash due to impossible bone scaling.**
*   **Zero-GPU, Extreme Cost-Efficiency**: The entire capture and cleaning pipeline runs on **pure CPU** using nothing but an iPhone TrueDepth camera and a standard laptop without a dedicated GPU. We achieve industrial-grade, rigid-body mocap standards without multi-million dollar optical tracking studios (Vicon/OptiTrack) or expensive data gloves.

## 📂 Repository Contents

*   `001.mp4` / `002.mp4`: The highly compressed RGB video references of the sign language actions (compressed to meet GitHub web limits).
*   `001v1.json` / `002v1.json`: The fully decoupled, rigid-body-locked JSON trajectories containing the `Left` and `Right` hand 3D coordinates.

## 🛠 How to Use (JSON Structure)

The JSON is designed for immediate integration into your robot control loops (e.g., ROS2, Isaac Sim, MuJoCo):

```json
{
  "trajectory_sequence": [
    {
      "frame_idx": 0,          
      "time_offset": 0.0,      
      "golden_hands": {        
        "Left": [              // 21-point topology (MediaPipe standard)
          {"x": 0.0, "y": 0.0, "z": 0.0},        // Node 0: Wrist (Absolute Anchor)
          {"x": 0.12, "y": -0.05, "z": 0.01},    // Node 1: Thumb CMC
          // ... Nodes 2-20
        ],
        "Right": []            // Empty if hand is occluded or not in frame
      }
    }
  ]
}
```

Simply read the `Left` or `Right` arrays and feed the static internal finger vectors directly to your hand controller. Since the origin is already zeroed out, you do not need to calculate dynamic spatial offsets.

---
*Created by the Camellia V11 AI Lab.*
*For commercial licensing of the full 5000+ word sign language trajectory database, or access to the live Camellia V11 Tri-Node extraction engine, please reach out via business contacts.*
