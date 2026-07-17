# Camellia V11 灵巧手专属姿态数据集使用说明 
# Golden Hands Dataset Usage Guide

## 1. 数据集定位与架构解耦 (Architecture & Positioning)

本数据集（`001v1.json` / `002v1.json`）是专门为**末端执行器（灵巧手机械手）**定制的纯净姿态数据集。
This dataset (`001v1.json` / `002v1.json`) is a pure pose dataset customized specifically for **End-Effectors (Dexterous Robotic Hands)**.

它采用了顶级的**机器人解耦控制架构（Decoupled Kinematics）**，即：
It adopts top-tier **Decoupled Kinematics architecture for robotics**, meaning:

*   **灵巧手模块（本数据） / Dexterous Hand Module (This Dataset)**：彻底摒弃了宏观的空间坐标体系，**以手腕（Wrist，即节点 0）为绝对物理原点 `(0, 0, 0)`**。本数据专用于训练或驱动机械手指的弯曲、抓握、结印等“内部姿态特征”。
    Completely discards macro spatial coordinate systems, **using the wrist (Node 0) as the absolute physical origin `(0, 0, 0)`**. This dataset is dedicated to training or driving the "internal pose features" of robotic fingers, such as bending, grasping, and gesturing.
*   **大臂主轴模块（不由本数据负责） / Main Arm Axis Module (Not covered by this dataset)**：机械手在 3D 空间中的具体宏观位置（手在哪），由主轴机械臂的逆运动学（IK）决定。
    The specific macro position of the robotic hand in 3D space (where the hand is) is determined by the Inverse Kinematics (IK) of the main arm.

## 2. 数据结构说明 (Data Structure)

每个 JSON 文件包含一个 `trajectory_sequence` 数组，代表按时间顺序排列的帧（Frame）。每帧的具体结构如下：
Each JSON file contains a `trajectory_sequence` array, representing frames arranged in chronological order. The specific structure of each frame is as follows:

```json
{
  "frame_idx": 0,          // 帧序号 / Frame index
  "time_offset": 0.0,      // 相对起点的录制时间偏移（秒） / Recording time offset relative to start (seconds)
  "golden_hands": {        // 融合洗净后的完美手部特征 / Purified and fused perfect hand features
    "Left": [              // 左手（21个点） / Left hand (21 points)
      {"x": 0.0, "y": 0.0, "z": 0.0},        // 节点 0：手腕（绝对原点） / Node 0: Wrist (Absolute origin)
      {"x": 0.12, "y": -0.05, "z": 0.01},    // 节点 1：拇指根部 / Node 1: Thumb CMC
      // ... 节点 2 到 20 / Nodes 2 to 20
    ],
    "Right": []            // 右手（空数组代表本帧未抓取到或被完全遮挡） / Right hand (Empty array means not captured or fully occluded in this frame)
  }
}
```

## 3. 本次清洗（V1版本）的重大物理学修正 (Major Physics Corrections in V1 Cleaning)

针对之前原始数据无法直接驱动金属机械指骨的致命缺陷，V1 数据集在底层公式上实施了两大宪法级清洗：
To address the fatal flaw of raw data being unable to directly drive metal robotic finger bones, the V1 dataset implements two constitutional-level cleanings on the underlying formulas:

### 3.1 彻底的“手腕原点化”（姿态解耦） / Complete "Wrist Origin-ization" (Pose Decoupling)
原始数据中，手腕的 X/Y 坐标带有相机视角的绝对偏移量（即手随身体晃动，手腕坐标也会跟着跳变）。
In the raw data, the wrist's X/Y coordinates contained absolute offsets from the camera's perspective (i.e., as the hand sways with the body, the wrist coordinates also jump).
**清洗动作 (Cleaning Action)**：在每一帧中，强制将手腕坐标置为 `(0, 0, 0)`，所有其余 20 个指关节全部减去手腕的坐标。
In every frame, the wrist coordinates are forced to `(0, 0, 0)`, and the coordinates of the other 20 finger joints are all subtracted by the wrist's coordinates.
**结果 (Result)**：彻底去除了身体晃动和空间位移的干扰，您拿到的是纯粹的、无瑕疵的“手指相对手腕的姿态向量”。
Completely removes the interference of body swaying and spatial displacement. You receive pure, flawless "pose vectors of fingers relative to the wrist".

### 3.2 刚性锁死与无量纲化（防橡胶手断裂） / Rigidity Locking & Dimensionless Scaling (Preventing "Rubber Hand" Breakage)
原始数据中，由于相机存在“近大远小”的透视效应，当手靠近镜头时，手指向量长度会被拉伸（橡胶手现象），这会导致定长的金属灵巧手 IK 求解器直接崩溃。
In the raw data, due to the camera's perspective effect (closer objects appear larger), finger vector lengths would stretch as the hand approached the lens (the "rubber hand" phenomenon), which would cause fixed-length metal dexterous hand IK solvers to crash instantly.
**清洗动作 (Cleaning Action)**：基于解剖学常数，引入无量纲比例尺（`ratio_matrix_factor`），将“手腕（0）到中指根部（9）”的物理距离强制缩放并锁死为 `TARGET_HAND_LEN`（默认 0.21，代表 21 厘米）。
Based on anatomical constants, a dimensionless scale (`ratio_matrix_factor`) is introduced to forcefully scale and lock the physical distance from the "wrist (0) to the base of the middle finger (9)" to `TARGET_HAND_LEN` (default 0.21, representing 21 cm).
**结果 (Result)**：彻底熨平了透视畸变！现在 JSON 里的所有指骨长度，在第 1 帧到最后 1 帧都是**绝对常数**！灵巧手的物理驱动器绝不会再报错！
Completely flattens perspective distortion! Now, all finger bone lengths in the JSON are **absolute constants** from Frame 1 to the final frame! Dexterous hand physical drivers will never throw errors again!

### 3.3 零算力门槛的工业级产出 / Zero-GPU Industrial Mocap Standard
**颠覆性成本 (Disruptive Cost-Efficiency)**：本数据集及底层 Camellia V11 采集清洗引擎，**全程在纯 CPU 环境下运行，无需任何独立显卡（Zero-GPU）**。仅依靠普通 iPhone 摄像头与一台轻薄笔记本，即达到了传统动捕棚（Vicon/OptiTrack）和昂贵传感手套才能输出的“工业级防畸变刚体标准”。这标志着人形机器人数据采集边际成本正式归零！
This dataset and the underlying Camellia V11 capture/cleaning engine **run entirely on pure CPU without any dedicated graphics card (Zero-GPU)**. Relying solely on a standard iPhone camera and a thin-and-light laptop, it achieves the "industrial-grade anti-distortion rigid body standard" that previously required multi-million dollar optical tracking studios (Vicon/OptiTrack) or expensive data gloves. This marks the moment the marginal cost of humanoid robot data collection hits true zero!

## 4. 驱动应用指南 (How to Use)

收到本数据集的 16 家机器人企业，可直接使用以下方法驱动：
The 16 robotics enterprises receiving this dataset can directly drive their hardware using the following methods:

1.  **直接读取 `golden_hands["Left"]` 或 `Right`**。
    **Directly read `golden_hands["Left"]` or `Right`**.
2.  因为节点 0 永远是 `(0,0,0)`，企业不需要做任何基准偏移处理，直接将节点 1-20 的向量（Vector）代入机械手的各个关节。
    Because Node 0 is always `(0,0,0)`, enterprises do not need to perform any baseline offset processing. Simply plug the vectors of Nodes 1-20 directly into the respective joints of the robotic hand.
3.  骨骼拓扑结构（21 个点）与全球通用的 MediaPipe Hand 拓扑字典完全一致。
    The skeletal topology (21 points) is completely consistent with the globally standard MediaPipe Hand topology dictionary.
4.  如需映射到特定机械手的尺寸，只需整体乘以一个全局放大/缩小系数（Scale Factor）即可，内部指骨比例已达到解剖学完美刚性。
    If mapping to the dimensions of a specific robotic hand is required, simply multiply everything by a global Scale Factor. The internal finger bone proportions have already achieved anatomical perfect rigidity.
