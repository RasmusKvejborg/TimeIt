export class Registration {
  constructor(
    startTime,
    endTime,
    date,
    totalHours,
    activityNum,
    activityName,
    projectNum,
    projectName,
    note
  ) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.date = date;
    this.totalHours = totalHours;
    this.activity = activityNum;
    this.activityName = activityName;
    this.project = projectNum;
    this.projectName = projectName;
    this.note = note;
  }
}
