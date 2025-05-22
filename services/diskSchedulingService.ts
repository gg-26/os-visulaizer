
import { DiskSchedulingAlgorithm, DiskRequest, DiskSchedulingResult, DiskSchedulingStep, DiskDirection } from '../types';

export const runDiskSchedulingAlgorithm = (
  algorithm: DiskSchedulingAlgorithm,
  requests: number[],
  initialHeadPosition: number,
  diskSize: number, // Max track number (e.g., 199 for size 200 means tracks 0-199)
  initialDirection?: DiskDirection 
): DiskSchedulingResult => {
  
  const diskRequests: DiskRequest[] = requests.map((track, index) => ({ id: index, track }));
  let headPosition = initialHeadPosition;
  let totalHeadMovement = 0;
  const servicedSequence: number[] = [];
  const steps: DiskSchedulingStep[] = [{
    currentHeadPosition: headPosition,
    servicedRequest: null,
    seekTime: 0,
    queueSnapshot: [...diskRequests],
    direction: initialDirection
  }];
  let pendingRequests = [...diskRequests];
  let currentDirection = initialDirection || 'up'; // Default to 'up' if not specified for SCAN/LOOK types

  switch (algorithm) {
    case DiskSchedulingAlgorithm.FCFS:
      pendingRequests.forEach(req => {
        const movement = Math.abs(req.track - headPosition);
        totalHeadMovement += movement;
        headPosition = req.track;
        servicedSequence.push(req.track);
        steps.push({
          currentHeadPosition: headPosition,
          servicedRequest: req,
          seekTime: movement,
          queueSnapshot: pendingRequests.filter(r => r.id !== req.id), // Show remaining
          direction: currentDirection
        });
      });
      pendingRequests = [];
      break;

    case DiskSchedulingAlgorithm.SSTF:
      while (pendingRequests.length > 0) {
        pendingRequests.sort((a, b) => Math.abs(a.track - headPosition) - Math.abs(b.track - headPosition));
        const nextRequest = pendingRequests.shift()!;
        const movement = Math.abs(nextRequest.track - headPosition);
        totalHeadMovement += movement;
        headPosition = nextRequest.track;
        servicedSequence.push(nextRequest.track);
        steps.push({
          currentHeadPosition: headPosition,
          servicedRequest: nextRequest,
          seekTime: movement,
          queueSnapshot: [...pendingRequests], // Snapshot before this request is fully removed from next iteration's pending
          direction: currentDirection
        });
      }
      break;
    
    case DiskSchedulingAlgorithm.SCAN:
    case DiskSchedulingAlgorithm.CSCAN:
    case DiskSchedulingAlgorithm.LOOK:
    case DiskSchedulingAlgorithm.CLOOK:
        let currentScannedRequests: DiskRequest[] = [];
        pendingRequests.sort((a, b) => a.track - b.track);

        while (pendingRequests.length > 0) {
            currentScannedRequests = [];
            if (currentDirection === 'up') {
                currentScannedRequests = pendingRequests.filter(r => r.track >= headPosition).sort((a, b) => a.track - b.track);
                if (algorithm === DiskSchedulingAlgorithm.CSCAN || algorithm === DiskSchedulingAlgorithm.CLOOK) {
                    // If no requests upwards, and it's C-SCAN/C-LOOK, wrap around
                    if (currentScannedRequests.length === 0 && pendingRequests.length > 0) {
                         if(algorithm === DiskSchedulingAlgorithm.CSCAN) {
                            if (headPosition !== diskSize -1) { // Don't add movement if already at end
                                totalHeadMovement += Math.abs((diskSize -1) - headPosition); // Move to end
                                headPosition = diskSize -1;
                                steps.push({ currentHeadPosition: headPosition, servicedRequest: null, seekTime: Math.abs((diskSize-1) - steps[steps.length-1].currentHeadPosition), queueSnapshot: [...pendingRequests], direction: currentDirection});
                            }
                            totalHeadMovement += (diskSize -1); // Jump to track 0
                            headPosition = 0;
                            steps.push({ currentHeadPosition: headPosition, servicedRequest: null, seekTime: (diskSize -1), queueSnapshot: [...pendingRequests], direction: currentDirection, });
                         } else { // CLOOK
                            // For C-LOOK, jump directly to the smallest track request
                            totalHeadMovement += Math.abs(pendingRequests[0].track - headPosition); // Move to smallest if no upward requests
                            headPosition = pendingRequests[0].track;
                            steps.push({ currentHeadPosition: headPosition, servicedRequest: null, seekTime: Math.abs(pendingRequests[0].track - steps[steps.length-1].currentHeadPosition), queueSnapshot: [...pendingRequests], direction: currentDirection});
                         }
                        currentScannedRequests = [...pendingRequests].sort((a,b)=> a.track - b.track); // Rescan all for C-SCAN/C-LOOK after wrap
                    }
                }
            } else { // direction 'down'
                currentScannedRequests = pendingRequests.filter(r => r.track <= headPosition).sort((a, b) => b.track - a.track);
                 if (algorithm === DiskSchedulingAlgorithm.CSCAN || algorithm === DiskSchedulingAlgorithm.CLOOK) {
                    if (currentScannedRequests.length === 0 && pendingRequests.length > 0) {
                        if(algorithm === DiskSchedulingAlgorithm.CSCAN) {
                            if(headPosition !== 0) {
                                totalHeadMovement += headPosition; // Move to track 0
                                headPosition = 0;
                                steps.push({ currentHeadPosition: headPosition, servicedRequest: null, seekTime: steps[steps.length-1].currentHeadPosition, queueSnapshot: [...pendingRequests], direction: currentDirection});
                            }
                            totalHeadMovement += (diskSize -1); // Jump to end (diskSize - 1)
                            headPosition = diskSize -1;
                            steps.push({ currentHeadPosition: headPosition, servicedRequest: null, seekTime: (diskSize -1), queueSnapshot: [...pendingRequests], direction: currentDirection});
                        } else { // CLOOK
                            // For C-LOOK, jump directly to largest track request
                             totalHeadMovement += Math.abs(pendingRequests[pendingRequests.length-1].track - headPosition);
                             headPosition = pendingRequests[pendingRequests.length-1].track;
                             steps.push({ currentHeadPosition: headPosition, servicedRequest: null, seekTime: Math.abs(pendingRequests[pendingRequests.length-1].track - steps[steps.length-1].currentHeadPosition), queueSnapshot: [...pendingRequests], direction: currentDirection});
                        }
                        currentScannedRequests = [...pendingRequests].sort((a,b)=> b.track - a.track); // Rescan all for C-SCAN/C-LOOK after wrap
                    }
                }
            }

            if (currentScannedRequests.length === 0) {
                // For SCAN/LOOK, if no requests in current direction, reverse
                if (algorithm === DiskSchedulingAlgorithm.SCAN || algorithm === DiskSchedulingAlgorithm.LOOK) {
                    currentDirection = (currentDirection === 'up') ? 'down' : 'up';
                    // Add a step for reaching the end (for SCAN) or last request (for LOOK) before reversing
                    let endPoint = headPosition;
                    if (algorithm === DiskSchedulingAlgorithm.SCAN) {
                        endPoint = (currentDirection === 'down') ? 0 : diskSize -1; // now moving other way, so end was previous direction's limit
                         if (headPosition !== endPoint) { // only add movement if not already there
                            totalHeadMovement += Math.abs(endPoint - headPosition);
                            headPosition = endPoint;
                            steps.push({ currentHeadPosition: headPosition, servicedRequest: null, seekTime: Math.abs(endPoint - steps[steps.length-1].currentHeadPosition), queueSnapshot: [...pendingRequests], direction: (currentDirection === 'up' ? 'down' : 'up') }); // Show old direction during this move
                        }
                    }
                    // For LOOK, no explicit "end of disk" step if no requests there. Direction flips.
                    // The next loop will pick up requests in new direction.
                } else if (pendingRequests.length > 0) { // C-SCAN/C-LOOK might have wrapped and still have requests
                     continue; // Let the C-SCAN/C-LOOK wrap logic handle it or break if truly no requests
                } else {
                    break; // No more requests anywhere
                }
            }

            for (const req of currentScannedRequests) {
                const movement = Math.abs(req.track - headPosition);
                totalHeadMovement += movement;
                headPosition = req.track;
                servicedSequence.push(req.track);
                pendingRequests = pendingRequests.filter(r => r.id !== req.id);
                steps.push({
                    currentHeadPosition: headPosition,
                    servicedRequest: req,
                    seekTime: movement,
                    queueSnapshot: [...pendingRequests],
                    direction: currentDirection
                });
            }
            
            // After servicing requests in one direction for SCAN/LOOK
            if ((algorithm === DiskSchedulingAlgorithm.SCAN || algorithm === DiskSchedulingAlgorithm.LOOK) && pendingRequests.length > 0) {
                 // For SCAN, move to the absolute end of the disk if it hasn't reached it.
                if (algorithm === DiskSchedulingAlgorithm.SCAN) {
                    const scanEndPoint = (currentDirection === 'up') ? diskSize - 1 : 0;
                    if (headPosition !== scanEndPoint) {
                        totalHeadMovement += Math.abs(scanEndPoint - headPosition);
                        headPosition = scanEndPoint;
                         steps.push({ currentHeadPosition: headPosition, servicedRequest: null, seekTime: Math.abs(scanEndPoint - steps[steps.length-1].currentHeadPosition), queueSnapshot: [...pendingRequests], direction: currentDirection});
                    }
                }
                // For both SCAN and LOOK, if there are still pending requests, reverse direction.
                currentDirection = (currentDirection === 'up') ? 'down' : 'up';
            }
        }
        break;


    default:
      throw new Error(`Algorithm ${algorithm} not implemented.`);
  }

  return {
    algorithm,
    initialHeadPosition: initialHeadPosition, 
    requestSequence: requests,
    servicedSequence,
    totalHeadMovement,
    steps,
    diskSize
  };
};
