
import { PageReplacementAlgorithm, PageReplacementStep, PageReplacementResult } from '../types';

export const runPageReplacementAlgorithm = (
  algorithm: PageReplacementAlgorithm,
  referenceString: number[],
  frameCount: number
): PageReplacementResult => {
  switch (algorithm) {
    case PageReplacementAlgorithm.FIFO:
      return fifoPageReplacement(referenceString, frameCount);
    case PageReplacementAlgorithm.LRU:
      return lruPageReplacement(referenceString, frameCount);
    case PageReplacementAlgorithm.OPTIMAL:
      return optimalPageReplacement(referenceString, frameCount);
    default:
      throw new Error(`Algorithm ${algorithm} not implemented.`);
  }
};

// --- FIFO Implementation ---
const fifoPageReplacement = (referenceString: number[], frameCount: number): PageReplacementResult => {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const frameQueue: number[] = []; // Stores page numbers in order of arrival into frames
  const steps: PageReplacementStep[] = [];
  let pageFaults = 0;
  let pageHits = 0;

  for (const pageNum of referenceString) {
    let currentFramesState = [...frames];
    let isFault = false;
    let replacedPage: number | null = null;
    let actionDescription = "";
    let highlightedFrameIndex = -1;

    if (frames.includes(pageNum)) {
      pageHits++;
      isFault = false;
      highlightedFrameIndex = frames.indexOf(pageNum);
      actionDescription = `Page ${pageNum} HIT in Frame ${highlightedFrameIndex}.`;
    } else {
      pageFaults++;
      isFault = true;
      const emptyFrameIndex = frames.indexOf(null);
      if (emptyFrameIndex !== -1) {
        frames[emptyFrameIndex] = pageNum;
        frameQueue.push(pageNum);
        highlightedFrameIndex = emptyFrameIndex;
        actionDescription = `Page ${pageNum} FAULT. Loaded into empty Frame ${emptyFrameIndex}.`;
      } else {
        replacedPage = frameQueue.shift()!; // Oldest page to replace
        const frameToReplaceIndex = frames.indexOf(replacedPage);
        frames[frameToReplaceIndex] = pageNum;
        frameQueue.push(pageNum);
        highlightedFrameIndex = frameToReplaceIndex;
        actionDescription = `Page ${pageNum} FAULT. Replaced Page ${replacedPage} in Frame ${frameToReplaceIndex}.`;
      }
    }
    steps.push({
      pageNumber: pageNum,
      frames: [...frames],
      isPageFault: isFault,
      replacedPage: replacedPage,
      pageToPlace: pageNum,
      highlightedFrameIndex: highlightedFrameIndex,
      actionDescription
    });
  }

  return {
    steps,
    pageFaults,
    pageHits,
    pageFaultRate: referenceString.length > 0 ? (pageFaults / referenceString.length) * 100 : 0,
    algorithm: PageReplacementAlgorithm.FIFO,
    referenceString,
    frameCount
  };
};

// --- LRU Implementation ---
const lruPageReplacement = (referenceString: number[], frameCount: number): PageReplacementResult => {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const frameUsage: number[] = []; // Stores page numbers, most recently used at the end
  const steps: PageReplacementStep[] = [];
  let pageFaults = 0;
  let pageHits = 0;

  for (const pageNum of referenceString) {
    let isFault = false;
    let replacedPage: number | null = null;
    let actionDescription = "";
    let highlightedFrameIndex = -1;

    const pageIndexInFrames = frames.indexOf(pageNum);

    if (pageIndexInFrames !== -1) { // Page Hit
      pageHits++;
      isFault = false;
      // Move page to end of usage list (most recently used)
      frameUsage.splice(frameUsage.indexOf(pageNum), 1);
      frameUsage.push(pageNum);
      highlightedFrameIndex = pageIndexInFrames;
      actionDescription = `Page ${pageNum} HIT in Frame ${highlightedFrameIndex}. (LRU: P${pageNum} is now most recent).`;
    } else { // Page Fault
      pageFaults++;
      isFault = true;
      const emptyFrameIndex = frames.indexOf(null);
      if (emptyFrameIndex !== -1) { // If there's an empty frame
        frames[emptyFrameIndex] = pageNum;
        frameUsage.push(pageNum);
        highlightedFrameIndex = emptyFrameIndex;
        actionDescription = `Page ${pageNum} FAULT. Loaded into empty Frame ${emptyFrameIndex}.`;
      } else { // Frames are full, replace LRU page
        replacedPage = frameUsage.shift()!; // LRU page is at the start of usage list
        const frameToReplaceIndex = frames.indexOf(replacedPage);
        frames[frameToReplaceIndex] = pageNum;
        frameUsage.push(pageNum); // Add new page as most recently used
        highlightedFrameIndex = frameToReplaceIndex;
        actionDescription = `Page ${pageNum} FAULT. Replaced LRU Page ${replacedPage} in Frame ${frameToReplaceIndex}.`;
      }
    }
    steps.push({
      pageNumber: pageNum,
      frames: [...frames],
      isPageFault: isFault,
      replacedPage: replacedPage,
      pageToPlace: pageNum,
      highlightedFrameIndex: highlightedFrameIndex,
      actionDescription
    });
  }
  return {
    steps,
    pageFaults,
    pageHits,
    pageFaultRate: referenceString.length > 0 ? (pageFaults / referenceString.length) * 100 : 0,
    algorithm: PageReplacementAlgorithm.LRU,
    referenceString,
    frameCount
  };
};

// --- Optimal Implementation ---
const optimalPageReplacement = (referenceString: number[], frameCount: number): PageReplacementResult => {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const steps: PageReplacementStep[] = [];
  let pageFaults = 0;
  let pageHits = 0;

  for (let i = 0; i < referenceString.length; i++) {
    const pageNum = referenceString[i];
    let isFault = false;
    let replacedPage: number | null = null;
    let actionDescription = "";
    let highlightedFrameIndex = -1;

    if (frames.includes(pageNum)) { // Page Hit
      pageHits++;
      isFault = false;
      highlightedFrameIndex = frames.indexOf(pageNum);
      actionDescription = `Page ${pageNum} HIT in Frame ${highlightedFrameIndex}.`;
    } else { // Page Fault
      pageFaults++;
      isFault = true;
      const emptyFrameIndex = frames.indexOf(null);
      if (emptyFrameIndex !== -1) { // Use empty frame
        frames[emptyFrameIndex] = pageNum;
        highlightedFrameIndex = emptyFrameIndex;
        actionDescription = `Page ${pageNum} FAULT. Loaded into empty Frame ${emptyFrameIndex}.`;
      } else { // Frames full, find optimal page to replace
        let farthest = -1;
        let frameToReplaceIndex = -1;
        
        for (let j = 0; j < frames.length; j++) {
          const currentPageInFrame = frames[j]!;
          let foundInFuture = false;
          for (let k = i + 1; k < referenceString.length; k++) {
            if (currentPageInFrame === referenceString[k]) {
              if (k > farthest) {
                farthest = k;
                frameToReplaceIndex = j;
              }
              foundInFuture = true;
              break;
            }
          }
          if (!foundInFuture) { // This page in frame is not used again, optimal to replace
            frameToReplaceIndex = j;
            break; 
          }
        }
        // If all pages in frames are used in future, frameToReplaceIndex will be the one used farthest.
        // If frameToReplaceIndex is still -1 (shouldn't happen if frames are full and logic is correct, but as a fallback use first frame)
        if (frameToReplaceIndex === -1) frameToReplaceIndex = 0; 
        
        replacedPage = frames[frameToReplaceIndex];
        frames[frameToReplaceIndex] = pageNum;
        highlightedFrameIndex = frameToReplaceIndex;
        actionDescription = `Page ${pageNum} FAULT. Replaced OPT Page ${replacedPage} in Frame ${frameToReplaceIndex}.`;
      }
    }
    steps.push({
      pageNumber: pageNum,
      frames: [...frames],
      isPageFault: isFault,
      replacedPage: replacedPage,
      pageToPlace: pageNum,
      highlightedFrameIndex: highlightedFrameIndex,
      actionDescription
    });
  }
  return {
    steps,
    pageFaults,
    pageHits,
    pageFaultRate: referenceString.length > 0 ? (pageFaults / referenceString.length) * 100 : 0,
    algorithm: PageReplacementAlgorithm.OPTIMAL,
    referenceString,
    frameCount
  };
};
