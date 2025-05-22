
import { BankerSnapshot, BankerSafetyResult, BankerRequestResult, BankerProcessResourceMatrix, BankerAvailableVector } from '../types';

export const runBankerSafetyCheck = (snapshot: BankerSnapshot): BankerSafetyResult => {
  const { available, max, allocation, need, numProcesses, numResources } = snapshot;
  
  let work = [...available];
  const finish: boolean[] = Array(numProcesses).fill(false);
  const safeSequence: string[] = [];
  const stepsLog: string[] = [`Initial: Work = [${work.join(', ')}], Finish = [${finish.join(', ')}]`];

  let N = numProcesses;
  let M = numResources;
  let count = 0;

  while (count < N) {
    let found = false;
    for (let i = 0; i < N; i++) {
      const pName = `P${i}`;
      if (finish[i] === false) {
        stepsLog.push(`Checking P${i}: Finish[${i}]=${finish[i]}. Need[${pName}]=[${need[pName].join(', ')}], Work=[${work.join(', ')}]`);
        let canAllocate = true;
        for (let j = 0; j < M; j++) {
          if (need[pName][j] > work[j]) {
            canAllocate = false;
            stepsLog.push(`  P${i}: Need[${pName}][${j}] (${need[pName][j]}) > Work[${j}] (${work[j]}). Cannot allocate.`);
            break;
          }
        }

        if (canAllocate) {
          stepsLog.push(`  P${i} can be allocated. Updating Work and Finish.`);
          for (let k = 0; k < M; k++) {
            work[k] += allocation[pName][k];
          }
          finish[i] = true;
          safeSequence.push(pName);
          count++;
          found = true;
          stepsLog.push(`  New Work = [${work.join(', ')}], Finish[${i}]=true. Safe sequence: [${safeSequence.join('->')}]`);
        }
      }
    }
    if (found === false) {
      stepsLog.push("No process found that can be allocated. System might be in an unsafe state.");
      break; // No process could be allocated in this pass
    }
  }

  const isSafe = safeSequence.length === N;
  if(isSafe) {
    stepsLog.push(`All processes finished. System is in a SAFE state. Safe Sequence: ${safeSequence.join(' -> ')}`);
  } else {
    stepsLog.push(`Not all processes could finish. System is in an UNSAFE state.`);
  }

  return {
    isSafe: isSafe,
    safeSequence: isSafe ? safeSequence : null,
    steps: stepsLog,
    initialSnapshot: snapshot
  };
};


export const runBankerResourceRequest = (
  requestingProcessId: string,
  requestVector: number[],
  initialSnapshot: BankerSnapshot
): BankerRequestResult => {
  const { available, max, allocation, need, numProcesses, numResources } = initialSnapshot;
  const pIndex = parseInt(requestingProcessId.substring(1));
  const stepsLog: string[] = [];

  stepsLog.push(`Process ${requestingProcessId} requests [${requestVector.join(', ')}].`);

  // 1. Check if Request_i <= Need_i
  for (let j = 0; j < numResources; j++) {
    if (requestVector[j] > need[requestingProcessId][j]) {
      const reason = `Request for R${j} (${requestVector[j]}) exceeds Need (${need[requestingProcessId][j]}). Error: Process has exceeded its maximum claim.`;
      stepsLog.push(reason);
      return { requestingProcessId, requestVector, canBeGranted: false, reason, steps: stepsLog, initialSnapshot };
    }
  }
  stepsLog.push(`Step 1: Request [${requestVector.join(', ')}] <= Need [${need[requestingProcessId].join(', ')}]. (OK)`);

  // 2. Check if Request_i <= Available
  for (let j = 0; j < numResources; j++) {
    if (requestVector[j] > available[j]) {
      const reason = `Request for R${j} (${requestVector[j]}) exceeds Available (${available[j]}). Process must wait.`;
      stepsLog.push(reason);
      return { requestingProcessId, requestVector, canBeGranted: false, reason, steps: stepsLog, initialSnapshot };
    }
  }
  stepsLog.push(`Step 2: Request [${requestVector.join(', ')}] <= Available [${available.join(', ')}]. (OK)`);

  // 3. Pretend to allocate
  const newAvailable: BankerAvailableVector = [...available];
  const newAllocation: BankerProcessResourceMatrix = JSON.parse(JSON.stringify(allocation));
  const newNeed: BankerProcessResourceMatrix = JSON.parse(JSON.stringify(need));

  for (let j = 0; j < numResources; j++) {
    newAvailable[j] -= requestVector[j];
    newAllocation[requestingProcessId][j] += requestVector[j];
    newNeed[requestingProcessId][j] -= requestVector[j];
  }
  stepsLog.push(`Step 3: Pretend allocation. New Available=[${newAvailable.join(', ')}], New Allocation[${requestingProcessId}]=[${newAllocation[requestingProcessId].join(', ')}], New Need[${requestingProcessId}]=[${newNeed[requestingProcessId].join(', ')}]`);
  
  const newSnapshot: BankerSnapshot = {
    available: newAvailable,
    max, // Max doesn't change
    allocation: newAllocation,
    need: newNeed,
    numProcesses,
    numResources
  };

  // 4. Run safety check on new state
  stepsLog.push("Step 4: Running safety check on the new (pretend) state...");
  const safetyCheckResult = runBankerSafetyCheck(newSnapshot);
  stepsLog.push(...safetyCheckResult.steps.map(s => `  (Safety Check) ${s}`));


  if (safetyCheckResult.isSafe) {
    stepsLog.push("Step 5: New state is SAFE. Request can be granted.");
    return { 
        requestingProcessId, 
        requestVector, 
        canBeGranted: true, 
        newSnapshot, 
        safetyCheckAfterGrant: safetyCheckResult,
        steps: stepsLog,
        initialSnapshot 
    };
  } else {
    stepsLog.push("Step 5: New state is UNSAFE. Request cannot be granted. Process must wait, state is restored.");
    return { 
        requestingProcessId, 
        requestVector, 
        canBeGranted: false, 
        reason: "Granting request would lead to an unsafe state.",
        safetyCheckAfterGrant: safetyCheckResult,
        steps: stepsLog,
        initialSnapshot
    };
  }
};
