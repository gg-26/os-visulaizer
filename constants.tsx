
import { Algorithm, Process, AlgorithmOption, PageReplacementAlgorithm, PageAlgorithmOption, DiskSchedulingAlgorithm, DiskAlgorithmOption, DeadlockAlgorithm, DeadlockAlgorithmOption } from './types';
import React from 'react'; 

// --- CPU Scheduling Constants ---
export const CPU_INITIAL_PROCESSES: Process[] = [
  { id: 1, name: 'P1', arrivalTime: 0, burstTime: 8, priority: 2, color: 'hsl(210, 70%, 50%)' },
  { id: 2, name: 'P2', arrivalTime: 1, burstTime: 4, priority: 1, color: 'hsl(150, 70%, 50%)' },
  { id: 3, name: 'P3', arrivalTime: 2, burstTime: 9, priority: 3, color: 'hsl(30, 70%, 50%)' },
  { id: 4, name: 'P4', arrivalTime: 3, burstTime: 5, priority: 4, color: 'hsl(270, 70%, 50%)' },
];

export const CPU_DEFAULT_ALGORITHM = Algorithm.FCFS;

export const CPU_ALGORITHM_OPTIONS: AlgorithmOption[] = [
  {
    id: Algorithm.FCFS,
    name: 'First Come First Serve (FCFS)',
    description: 'Processes are executed in the order they arrive.',
    explanation: {
      working: [
        'Processes are executed strictly by their arrival order.',
        'Once a process starts, it runs to completion (non-preemptive).',
        'Simple to understand and implement.'
      ],
      advantages: [
        'Simple and easy to implement.',
        'Fair in the sense that processes are served in arrival order.',
        'No starvation if all processes eventually arrive.'
      ],
      disadvantages: [
        'Average waiting time can be high, especially if short processes are behind long ones (Convoy Effect).',
        'Not suitable for time-sharing systems.',
        'Non-preemptive nature can lead to poor resource utilization for I/O-bound processes.'
      ],
      example: 'If P1 (BT=24) arrives before P2 (BT=3) and P3 (BT=3), P2 and P3 have to wait for P1 to finish, leading to high average waiting time.'
    }
  },
  {
    id: Algorithm.SJF,
    name: 'Shortest Job First (SJF)',
    description: 'Selects the process with the smallest burst time. Can be non-preemptive or preemptive (SRTF).',
    supportsSjfPreemption: true, 
    explanation: {
      working: [
        'When the CPU is available, it is assigned to the process that has the smallest next CPU burst.',
        'If two processes have the same length next CPU burst, FCFS scheduling is used.',
        'Non-preemptive SJF: Once CPU given to the process, it cannot be preempted until completes its CPU burst.',
        'Preemptive SJF (SRTF): If a new process arrives with CPU burst length less than remaining time of current executing process, preempt. This scheme is known as the Shortest-Remaining-Time-First (SRTF).'
      ],
      advantages: [
        'Provably optimal in terms of minimizing average waiting time for a given set of processes.',
        'Good for batch systems where run times are known in advance.'
      ],
      disadvantages: [
        'Requires knowledge of the future (burst times). Often estimated.',
        'Can lead to starvation for long processes if short processes keep arriving.',
        'Estimating burst times accurately is difficult.'
      ],
      example: 'Processes P1(BT=6), P2(BT=8), P3(BT=7), P4(BT=3). SJF order (non-preemptive, assuming all arrived at t=0): P4, P1, P3, P2.'
    }
  },
  {
    id: Algorithm.SRTF,
    name: 'Shortest Remaining Time First (SRTF)',
    description: 'Preemptive version of SJF. Selects the process with the smallest remaining time.',
    explanation: {
      working: [
          'This is the preemptive version of SJF.',
          'The processor is allocated to the job closest to completion.',
          'If a new process arrives with a CPU burst length shorter than the remaining time of the current executing process, the current process is preempted.',
      ],
      advantages: [
          'Lower average waiting time than non-preemptive SJF.',
          'Responsive to short processes.',
      ],
      disadvantages: [
          'Higher overhead due to context switching.',
          'Still requires estimation of burst times and can lead to starvation of long processes.',
          'Context switching can be frequent.'
      ],
      example: 'P1 (Arrival=0, BT=8), P2 (Arrival=1, BT=4). P1 starts. At t=1, P2 arrives. P1 remaining=7, P2 BT=4. P2 preempts P1.'
    }
  },
  {
    id: Algorithm.PRIORITY,
    name: 'Priority Scheduling',
    description: 'Each process is assigned a priority. CPU is allocated to the process with the highest priority.',
    hasPriority: true,
    canBePreemptive: true,
    explanation: {
      working: [
        'A priority is associated with each process.',
        'The CPU is allocated to the process with the highest priority (e.g., smallest integer = highest priority).',
        'Can be preemptive or non-preemptive.',
        'Preemptive: If a new higher-priority process arrives, it preempts the currently running process.',
        'Non-preemptive: A new higher-priority process is placed at the head of the ready queue.'
      ],
      advantages: [
        'Allows for clear prioritization of important tasks.',
        'Can be effective for real-time systems if priorities are well-defined.'
      ],
      disadvantages: [
        'Starvation: Low-priority processes may never execute.',
        'Solution to starvation: Aging - gradually increase the priority of processes that wait for a long time.',
        'Defining priorities can be complex.'
      ],
      example: 'P1(Priority=2), P2(Priority=1, highest), P3(Priority=3). P2 runs first. If preemptive and P0 (Priority=0) arrives while P2 runs, P0 preempts.'
    }
  },
  {
    id: Algorithm.ROUND_ROBIN,
    name: 'Round Robin (RR)',
    description: 'Each process gets a small unit of CPU time (time quantum). Preemptive.',
    hasTimeQuantum: true,
    explanation: {
      working: [
        'Designed especially for time-sharing systems.',
        'A small unit of time, called a time quantum or time slice (typically 10-100ms), is defined.',
        'The ready queue is treated as a circular queue.',
        'The CPU scheduler goes around the ready queue, allocating the CPU to each process for a time interval of up to 1 time quantum.',
        'If the process finishes its burst before the quantum expires, it releases the CPU. Otherwise, it\'s preempted and put at the end of the ready queue.'
      ],
      advantages: [
        'Fair: Every process gets an equal share of CPU time.',
        'Responsive: Good for interactive systems as no process waits for too long.',
        'No starvation (if queue is managed properly).'
      ],
      disadvantages: [
        'Performance depends heavily on the size of the time quantum.',
        'Too large quantum: Behaves like FCFS.',
        'Too small quantum: High context switching overhead.',
        'Average waiting time can be high.'
      ],
      example: 'Processes P1(BT=10), P2(BT=5), P3(BT=8). Time Quantum=4. Execution: P1(4), P2(4), P3(4), P1(4), P2(1), P3(4), P1(2).'
    }
  },
];

// --- Memory Management Constants ---
export const INITIAL_PAGE_REFERENCE_STRING = "7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1";
export const DEFAULT_FRAME_COUNT = 3;
export const DEFAULT_PAGE_REPLACEMENT_ALGORITHM = PageReplacementAlgorithm.FIFO;

export const PAGE_REPLACEMENT_ALGORITHM_OPTIONS: PageAlgorithmOption[] = [
  {
    id: PageReplacementAlgorithm.FIFO,
    name: 'First-In, First-Out (FIFO)',
    description: 'Replaces the page that has been in memory for the longest time.',
    explanation: {
      concept: "FIFO is the simplest page replacement algorithm. It treats the memory frames as a strict queue. The oldest page in memory is chosen for replacement.",
      howItWorks: [
        "When a page fault occurs and all frames are full, the page that was loaded into memory first is replaced.",
        "A FIFO queue is maintained to track the order of pages loaded.",
        "Does not consider how frequently or recently a page has been used."
      ],
      pros: [
        "Simple to understand and implement.",
        "Low overhead."
      ],
      cons: [
        "Can perform poorly as it may replace frequently used pages.",
        "Susceptible to Belady's Anomaly (increasing frames can sometimes increase page faults)."
      ]
    }
  },
  {
    id: PageReplacementAlgorithm.LRU,
    name: 'Least Recently Used (LRU)',
    description: 'Replaces the page that has not been used for the longest period of time.',
    explanation: {
      concept: "LRU selects the page for replacement that has not been referenced for the longest time. It's based on the principle of locality, assuming that pages used recently are likely to be used again.",
      howItWorks: [
        "When a page fault occurs and frames are full, the page that hasn't been accessed for the longest time is replaced.",
        "Requires keeping track of when each page was last used (e.g., using timestamps or a stack).",
        "Good approximation of the optimal algorithm."
      ],
      pros: [
        "Generally performs well and is not susceptible to Belady's Anomaly.",
        "Good for programs exhibiting temporal locality."
      ],
      cons: [
        "Implementation can be complex and incur significant overhead (e.g., updating timestamps/stack on every memory reference).",
        "Hardware support is often needed for efficient implementation."
      ]
    }
  },
  {
    id: PageReplacementAlgorithm.OPTIMAL,
    name: 'Optimal Page Replacement (OPT)',
    description: 'Replaces the page that will not be used for the longest period of time in the future.',
     explanation: {
      concept: "The Optimal algorithm replaces the page that will not be referenced for the longest duration in the future. It guarantees the lowest possible page fault rate.",
      howItWorks: [
        "When a page fault occurs and frames are full, the algorithm looks ahead in the reference string.",
        "It replaces the page in memory that will not be used for the longest period.",
        "If a page in memory will never be referenced again, it's an ideal candidate."
      ],
      pros: [
        "Achieves the lowest possible page fault rate for a fixed number of frames.",
        "Used as a benchmark to compare other algorithms."
      ],
      cons: [
        "Impossible to implement in practice as it requires future knowledge of the page reference string.",
        "Mainly used for theoretical comparison."
      ]
    }
  },
];

// --- Disk Scheduling Constants ---
export const INITIAL_DISK_REQUEST_STRING = "98,183,37,122,14,124,65,67";
export const INITIAL_DISK_HEAD_POSITION = 53;
export const DEFAULT_DISK_SIZE = 200; // Max track number (0 to 199)
export const DEFAULT_DISK_ALGORITHM = DiskSchedulingAlgorithm.FCFS;
export const INITIAL_DISK_DIRECTION = 'up';

export const DISK_ALGORITHM_OPTIONS: DiskAlgorithmOption[] = [
  {
    id: DiskSchedulingAlgorithm.FCFS,
    name: 'First-Come, First-Served (FCFS)',
    description: 'Services requests in the order they arrive in the queue.',
    explanation: {
      concept: "FCFS is the simplest disk scheduling algorithm. It processes requests strictly in the order they are received.",
      howItWorks: ["The disk arm moves to service requests one by one as they appear in the queue.", "No reordering of requests occurs."],
      pros: ["Simple to understand and implement.", "Fair in the sense that every request gets serviced eventually."],
      cons: ["Can result in high total head movement and long average seek times.", "Not optimal, especially if requests are scattered across the disk."],
    }
  },
  {
    id: DiskSchedulingAlgorithm.SSTF,
    name: 'Shortest Seek Time First (SSTF)',
    description: 'Services the request that is closest to the current head position.',
    explanation: {
      concept: "SSTF selects the request that requires the minimum disk arm movement from its current position.",
      howItWorks: ["From the current head position, the algorithm chooses the pending request closest to it.", "This can potentially lead to starvation for requests far from the head if closer requests keep arriving."],
      pros: ["Generally lower average seek time than FCFS.", "Improves throughput compared to FCFS."],
      cons: ["Risk of starvation for some requests.", "Does not guarantee the globally optimal solution for head movement."],
    }
  },
  {
    id: DiskSchedulingAlgorithm.SCAN,
    name: 'SCAN (Elevator Algorithm)',
    description: 'The disk arm moves in one direction, servicing requests, until it reaches the end of the disk, then reverses direction.',
    explanation: {
      concept: "SCAN, also known as the elevator algorithm, moves the disk arm in one direction (e.g., towards higher track numbers) servicing all requests in its path. Once it reaches the end of the disk, or the last request in that direction, it reverses direction and services requests in the opposite path.",
      howItWorks: [
        "The arm starts at one end of the disk and moves towards the other end, servicing requests as it goes.",
        "When it reaches the other end, it reverses direction and continues servicing requests.",
        "Requires knowing the direction of head movement."
      ],
      pros: ["Provides more uniform wait times compared to SSTF.", "Avoids starvation if requests are continuously added."],
      cons: ["Requests at the extreme ends of the disk may have to wait longer.", "Even if there are no requests at the end, the arm still travels to the end of the disk."],
      requiresDirection: true,
    }
  },
  {
    id: DiskSchedulingAlgorithm.CSCAN,
    name: 'Circular SCAN (C-SCAN)',
    description: 'Similar to SCAN, but when it reaches an end, it immediately returns to the beginning of the disk without servicing requests on the return trip.',
    explanation: {
      concept: "C-SCAN is a variation of SCAN designed to provide more uniform wait times. The head scans in one direction, servicing requests. When it reaches the end, it jumps back to the start of the disk and resumes scanning in the same direction.",
      howItWorks: [
        "The arm moves from one end of the disk to the other, servicing requests.",
        "When it reaches the end, it immediately returns to the beginning of the disk without servicing any requests on the return trip, then starts scanning again.",
        "Treats the disk as circular."
      ],
      pros: ["Provides more uniform waiting times than SCAN.", "Reduces the maximum delay for requests at the far end."],
      cons: ["More overhead due to the quick return trip without servicing.", "Still requires the head to travel to the end of the disk in one direction."],
      requiresDirection: true,
    }
  },
  {
    id: DiskSchedulingAlgorithm.LOOK,
    name: 'LOOK',
    description: 'Similar to SCAN, but the arm only travels as far as the last request in each direction, then reverses immediately.',
    explanation: {
      concept: "LOOK is an optimization of SCAN. Instead of going all the way to the end of the disk, the arm only travels as far as the last request in its current direction. Then, it reverses.",
      howItWorks: [
        "The arm moves in one direction servicing requests until it reaches the last request in that direction.",
        "It then reverses direction and services requests until it reaches the last request in the new direction.",
        "Avoids unnecessary travel to the disk ends if no requests are there."
      ],
      pros: ["More efficient than SCAN as it avoids unnecessary head travel to the ends.", "Reduces average seek time compared to SCAN."],
      cons: ["Can still have slightly less uniform wait times than C-SCAN/C-LOOK for requests at the extremities."],
      requiresDirection: true,
    }
  },
  {
    id: DiskSchedulingAlgorithm.CLOOK,
    name: 'Circular LOOK (C-LOOK)',
    description: 'Similar to C-SCAN, but the arm only travels as far as the last request in one direction, then jumps to the first request in the queue (closest to the start) to begin the next scan.',
    explanation: {
      concept: "C-LOOK is an optimization of C-SCAN. The arm scans in one direction only up to the last request. Then, instead of going to the very beginning of the disk, it jumps to the request that is earliest (smallest track number) in the pending queue and starts scanning in the same direction again.",
      howItWorks: [
        "The arm moves in one direction servicing requests up to the last request in that direction.",
        "It then jumps to the 'first' request in the queue (smallest track number if scanning 'up') without servicing on the jump, and resumes scanning.",
        "More efficient than C-SCAN by avoiding travel to disk ends if no requests are pending there."
      ],
      pros: ["More efficient than C-SCAN.", "Provides fairly uniform wait times."],
      cons: ["Slightly more complex logic than C-SCAN."],
      requiresDirection: true,
    }
  },
];


// --- Deadlock Simulator Constants ---
export const DEFAULT_BANKER_PROCESS_COUNT = 5;
export const DEFAULT_BANKER_RESOURCE_COUNT = 3;

export const INITIAL_BANKER_AVAILABLE = [3, 3, 2]; // R1, R2, R3
export const INITIAL_BANKER_MAX: {[key: string]: number[]} = {
  P0: [7, 5, 3],
  P1: [3, 2, 2],
  P2: [9, 0, 2],
  P3: [2, 2, 2],
  P4: [4, 3, 3],
};
export const INITIAL_BANKER_ALLOCATION: {[key: string]: number[]} = {
  P0: [0, 1, 0],
  P1: [2, 0, 0],
  P2: [3, 0, 2],
  P3: [2, 1, 1],
  P4: [0, 0, 2],
};

export const DEADLOCK_ALGORITHM_OPTIONS: DeadlockAlgorithmOption[] = [
  {
    id: DeadlockAlgorithm.BANKERS_SAFETY,
    name: "Banker's Algorithm (Safety Check)",
    description: "Checks if the current system state is safe, meaning there's a sequence in which all processes can complete.",
    explanation: {
        concept: "The Banker's Algorithm is a deadlock avoidance algorithm that checks if granting a resource request will lead to a safe state. A state is safe if there is some scheduling order in which every process can run to completion even if all of them suddenly request their maximum claims.",
        algorithmSteps: [
            "1. Initialize Work = Available. Finish[i] = false for all processes Pi.",
            "2. Find an index i such that both: (a) Finish[i] == false (b) Need[i] <= Work. (Need = Max - Allocation)",
            "3. If no such i exists, go to step 5.",
            "4. Work = Work + Allocation[i]. Finish[i] = true. Go to step 2.",
            "5. If Finish[i] == true for all i, then the system is in a safe state. Otherwise, it's unsafe."
        ],
        example: "Given Available, Max, and Allocation matrices, calculate Need. Then, iteratively find processes that can complete with current Work, release their resources (add to Work), and mark them as finished."
    }
  },
  {
    id: DeadlockAlgorithm.BANKERS_REQUEST,
    name: "Banker's Algorithm (Resource Request)",
    description: "Checks if a resource request from a process can be safely granted.",
     explanation: {
        concept: "When a process requests resources, the system checks if granting the request will leave the system in a safe state. If not, the process must wait.",
        algorithmSteps: [
            "1. If Request_i <= Need_i, go to step 2. Otherwise, raise error (process exceeded max claim).",
            "2. If Request_i <= Available, go to step 3. Otherwise, P_i must wait (resources not available).",
            "3. Pretend to allocate requested resources: Available = Available - Request_i; Allocation_i = Allocation_i + Request_i; Need_i = Need_i - Request_i.",
            "4. Run the Safety Algorithm on this new (pretend) state.",
            "5. If the new state is safe, grant the resources. If unsafe, P_i must wait, and the old resource-allocation state is restored."
        ],
        example: "Process P1 requests (1,0,2). Check if request <= Need_P1 and request <= Available. If yes, update matrices temporarily and run safety check."
    }
  }
];
