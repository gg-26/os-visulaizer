
export enum Algorithm {
  FCFS = 'fcfs',
  SJF = 'sjf', 
  SRTF = 'srtf', 
  PRIORITY = 'priority', 
  ROUND_ROBIN = 'roundrobin',
  MULTI_LEVEL_QUEUE = 'multilevel',
}

export interface Process {
  id: number;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
  remainingTime?: number;
  completionTime?: number;
  turnaroundTime?: number;
  waitingTime?: number;
  color?: string; 
  lastExecutionTime?: number; 
}

export interface GanttEvent {
  processId: number; 
  processName: string; 
  start: number;
  end: number;
  duration: number;
  color?: string;
  isIdle: boolean;
}

export interface TimelineEvent {
  processName: string;
  start: number;
  end: number;
  duration: number;
  isIdle: boolean;
}

export interface QueueEvent {
  type: 'enqueue' | 'dequeue';
  processId: number;
  processName: string;
  time: number;
}

export interface SchedulingResultMetrics {
  averageWaitingTime: number;
  averageTurnaroundTime: number;
  cpuUtilization: number;
  throughput: number;
  totalExecutionTime: number;
}

export interface SchedulingResult {
  originalProcesses: Process[]; 
  ganttEvents: GanttEvent[];
  timelineEvents: TimelineEvent[];
  queueEvents: QueueEvent[];
  metrics: SchedulingResultMetrics;
  algorithm: Algorithm;
}

export interface AlgorithmOption {
  id: Algorithm;
  name: string;
  description: string;
  explanation?: {
    working: string[];
    advantages: string[];
    disadvantages: string[];
    example?: string;
  };
  hasTimeQuantum?: boolean;
  hasPriority?: boolean;
  canBePreemptive?: boolean; 
  supportsSjfPreemption?: boolean; 
}

export interface ProcessInQueue {
  id: number;
  name: string;
  status: 'entering' | 'idle' | 'leaving';
}

export interface SchedulingOptions {
  timeQuantum?: number;
  isPriorityPreemptive?: boolean;
  isSjfPreemptive?: boolean; 
  priorityOrder?: 'higherIsBetter' | 'lowerIsBetter';
}

// --- Memory Management Types ---
export enum PageReplacementAlgorithm {
  FIFO = 'fifo',
  LRU = 'lru',
  OPTIMAL = 'optimal',
}

export interface PageReplacementStep {
  pageNumber: number; 
  frames: (number | null)[]; 
  isPageFault: boolean;
  replacedPage?: number | null; 
  pageToPlace: number; 
  highlightedFrameIndex?: number; 
  actionDescription: string; 
}

export interface PageReplacementResult {
  steps: PageReplacementStep[];
  pageFaults: number;
  pageHits: number;
  pageFaultRate: number;
  algorithm: PageReplacementAlgorithm;
  referenceString: number[];
  frameCount: number;
}

export interface PageAlgorithmOption {
  id: PageReplacementAlgorithm;
  name: string;
  description: string;
  explanation?: {
    concept: string;
    howItWorks: string[];
    pros: string[];
    cons: string[];
  };
}

// --- Disk Scheduling Types ---
export enum DiskSchedulingAlgorithm {
  FCFS = 'fcfs',
  SSTF = 'sstf',
  SCAN = 'scan',
  CSCAN = 'cscan',
  LOOK = 'look',
  CLOOK = 'clook',
}

export type DiskDirection = 'up' | 'down';

export interface DiskRequest {
  id: number; // original index or unique ID
  track: number;
}

export interface DiskSchedulingStep {
  currentHeadPosition: number;
  servicedRequest: DiskRequest | null; // null for initial position or if no request serviced in a "jump"
  seekTime: number; // movement from previous head position to current
  queueSnapshot: DiskRequest[]; // queue at the time this step is decided
  direction?: DiskDirection; // current direction of head movement for SCAN/LOOK
}

export interface DiskSchedulingResult {
  algorithm: DiskSchedulingAlgorithm;
  initialHeadPosition: number;
  requestSequence: number[]; // original input
  servicedSequence: number[]; // tracks in order they were serviced
  totalHeadMovement: number;
  steps: DiskSchedulingStep[];
  diskSize: number;
}

export interface DiskAlgorithmOption {
  id: DiskSchedulingAlgorithm;
  name: string;
  description: string;
  explanation?: {
    concept: string;
    howItWorks: string[];
    pros: string[];
    cons: string[];
    requiresDirection?: boolean;
  };
}

// --- Deadlock Types ---
export enum DeadlockAlgorithm {
  BANKERS_SAFETY = 'bankers_safety',
  BANKERS_REQUEST = 'bankers_request',
  // RAG_DETECTION = 'rag_detection' // Future
}

export interface BankerProcessResourceMatrix { // For Max, Allocation, Need
  [processId: string]: number[]; // e.g., P0: [7, 5, 3]
}
export type BankerAvailableVector = number[]; // e.g., [3, 3, 2]

export interface BankerSnapshot {
  available: BankerAvailableVector;
  max: BankerProcessResourceMatrix;
  allocation: BankerProcessResourceMatrix;
  need: BankerProcessResourceMatrix;
  numProcesses: number;
  numResources: number;
}

export interface BankerSafetyResult {
  isSafe: boolean;
  safeSequence: string[] | null; // Array of process names, e.g., ["P1", "P3", "P0", "P2", "P4"]
  steps: string[]; // Step-by-step explanation or log of safety check
  initialSnapshot: BankerSnapshot;
}

export interface BankerRequestResult {
  requestingProcessId: string;
  requestVector: number[];
  canBeGranted: boolean;
  reason?: string; // If not granted
  newSnapshot?: BankerSnapshot; // If granted
  safetyCheckAfterGrant?: BankerSafetyResult; // Result of safety check if granted
  steps: string[]; // Step-by-step log
  initialSnapshot: BankerSnapshot;
}

export type DeadlockAlgorithmResult = BankerSafetyResult | BankerRequestResult;

export interface DeadlockAlgorithmOption {
  id: DeadlockAlgorithm;
  name: string;
  description: string;
  explanation?: {
    concept: string;
    algorithmSteps: string[];
    example?: string;
  };
}
