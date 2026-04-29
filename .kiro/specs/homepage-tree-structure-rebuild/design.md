# Design Document: Homepage Tree Structure Rebuild

## Overview

This design document outlines the complete rebuild of the WeChat miniprogram homepage (index page) to match reference screenshots and implement a tree-structured knowledge hierarchy component. The current implementation uses simple navigation to a list page, but the new design will integrate a recursive tree component that supports multi-level nesting, expand/collapse functionality, and proper visual hierarchy. The rebuild maintains all existing functionality (exam type selection, subject tabs, quick entries, exam mode) while replacing the practice categories section with an interactive tree component.

The tree component follows a recursive pattern where tree-node components reference themselves to render nested children, enabling unlimited hierarchy depth. This approach provides better UX for navigating complex knowledge structures and aligns with the reference implementation patterns.

## Architecture

```mermaid
graph TD
    A[Index Page] --> B[Hero Section]
    A --> C[Quick Entry Rail]
    A --> D[Content Panel]
    
    B --> B1[AI Button]
    B --> B2[Banner Swiper]
    B --> B3[Exam Type Filter]
    B --> B4[Subject Tabs]
    
    C --> C1[Quick Entry Items]
    C --> C2[Continue Button]
    
    D --> D1[Practice Mode]
    D --> D2[Exam Mode]
    
    D1 --> E[Tree Component]
    E --> F[Tree Node Component]
    F --> F1[Expand/Collapse Icon]
    F --> F2[Node Content]
    F --> F3[Entry Arrow]
    F --> F4[Child Nodes - Recursive]
    
    F4 --> F
    
    D2 --> G[Exam Mode Cards]
    D2 --> H[Category Selection]
    D2 --> I[Paper Selection]
