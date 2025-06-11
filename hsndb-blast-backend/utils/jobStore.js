// Simple LRU Cache implementation for job storage
class JobStore {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    this.jobs = new Map();
    this.accessOrder = new Map(); // Track access order for LRU
  }

  set(jobId, jobData) {
    // Remove oldest entries if at capacity
    if (this.jobs.size >= this.maxSize && !this.jobs.has(jobId)) {
      const oldestJobId = this.accessOrder.keys().next().value;
      this.delete(oldestJobId);
    }

    this.jobs.set(jobId, {
      ...jobData,
      lastAccessed: Date.now(),
    });

    // Update access order
    this.accessOrder.delete(jobId);
    this.accessOrder.set(jobId, Date.now());
  }

  get(jobId) {
    const job = this.jobs.get(jobId);
    if (job) {
      // Update access time and order
      job.lastAccessed = Date.now();
      this.accessOrder.delete(jobId);
      this.accessOrder.set(jobId, Date.now());
    }
    return job;
  }

  has(jobId) {
    return this.jobs.has(jobId);
  }

  delete(jobId) {
    this.jobs.delete(jobId);
    this.accessOrder.delete(jobId);
  }

  clear() {
    this.jobs.clear();
    this.accessOrder.clear();
  }

  size() {
    return this.jobs.size;
  }

  values() {
    return this.jobs.values();
  }

  entries() {
    return this.jobs.entries();
  }

  // Cleanup old jobs based on age
  cleanupOldJobs(maxAge = 60 * 60 * 1000) {
    // 1 hour default
    const now = Date.now();
    let cleanedCount = 0;

    for (const [jobId, job] of this.jobs.entries()) {
      if (now - job.startTime > maxAge) {
        this.delete(jobId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  // Get statistics
  getStats() {
    const now = Date.now();
    let completed = 0;
    let running = 0;
    let failed = 0;

    for (const job of this.jobs.values()) {
      switch (job.status) {
        case "completed":
          completed++;
          break;
        case "running":
        case "queued":
          running++;
          break;
        case "failed":
          failed++;
          break;
      }
    }

    return {
      total: this.jobs.size,
      completed,
      running,
      failed,
      maxSize: this.maxSize,
    };
  }
}

module.exports = JobStore;
