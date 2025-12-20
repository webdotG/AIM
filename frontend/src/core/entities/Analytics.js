export class Analytics {
  constructor(data) {
    this.dreams = data.dreams || 0;
    this.memories = data.memories || 0;
    this.thoughts = data.thoughts || 0;
    this.plans = data.plans || 0;
    this.completedPlans = data.completedPlans || 0;
    this.overduePlans = data.overduePlans || 0;
    this.totalEntries = data.totalEntries || 0;
  }

  getTotalByType(type) {
    return this[type] || 0;
  }

  getCompletionRate() {
    if (this.plans === 0) return 0;
    return (this.completedPlans / this.plans) * 100;
  }

  getMostActiveType() {
    const types = {
      dreams: this.dreams,
      memories: this.memories,
      thoughts: this.thoughts,
      plans: this.plans
    };
    return Object.entries(types).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  }
}