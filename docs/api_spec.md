flowchart TD
    A[Video/Camera Input] --> B[MediaPipe Pose Detection]
    B --> C[Extract Keypoints & Joint Angles]
    C --> D[Real-time Pose Analysis]
    
    D --> E{Form Analysis}
    E -->|Good Form| F[Count Rep]
    E -->|Poor Form/Risk| G[Flag Potential Damage]
    
    F --> H[Update Rep Counter]
    H --> I[Calculate Optimal Angles]
    
    G --> J[Capture Frame/Pose Data]
    J --> K[Send to Gemini API]
    K --> L[LLM Analysis & Advice]
    L --> M[Real-time Feedback to User]
    
    I --> N[Display Metrics]
    N --> O[Show Angle Guidance]
    
    M --> P[Voice/Text Alert]
    P --> Q[Corrective Instructions]
    
    subgraph "Core Processing"
        R[Angle Calculation Engine]
        S[Form Assessment Rules]
        T[Rep Detection Algorithm]
    end
    
    D --> R
    R --> S
    S --> T
    T --> E
    
    subgraph "Data Storage"
        U[(Session Data)]
        V[(User Progress)]
        W[(Exercise Templates)]
    end
    
    H --> U
    L --> V
    S --> W
    
    subgraph "User Interface"
        X[Live Video Display]
        Y[Angle Overlay]
        Z[Rep Counter]
        AA[Form Feedback]
        BB[Safety Alerts]
    end
    
    N --> X
    O --> Y
    H --> Z
    M --> AA
    P --> BB
    
    style G fill:#ff6b6b
    style K fill:#4ecdc4
    style M fill:#45b7d1
    style P fill:#f9ca24