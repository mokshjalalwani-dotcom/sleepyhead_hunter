# Sleepyhead Hunter — Real-Time Drowsiness Detection

> 🚗 Detects driver drowsiness in real-time using your webcam — no backend, no install.
> 🌐 [Live Demo](https://web-hazel-eta-fhm5f4q13g.vercel.app)

## Overview

A browser-based drowsiness detection system that uses facial landmark detection and Eye Aspect Ratio (EAR) calculations to alert the user when signs of fatigue are detected.

## How It Works

1. **MediaPipe FaceMesh** tracks 468 facial landmarks in real-time
2. **EAR (Eye Aspect Ratio)** is calculated for both eyes each frame
3. If EAR drops below threshold for N consecutive frames → drowsiness alert triggered
4. Audio + visual alarm fires to wake the driver

## Tech Stack

- Vanilla JavaScript (no framework)
- MediaPipe FaceMesh
- HTML5 Canvas + WebRTC (getUserMedia)
- Deployed on Vercel

## Run Locally

`ash
# Just open index.html in a browser — no server needed
# Or use live-server:
npx live-server
`

## EAR Formula

`
EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
`
Where p1–p6 are the eye landmark coordinates.

---
Built by **Moksh Lalwani** · PDEU, Ahmedabad