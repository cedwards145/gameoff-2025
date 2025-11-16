export class Timer {
    startTime: number = 0;
    duration: number = 0;

    start(duration: number) {
        this.startTime = Date.now();
        this.duration = duration;
    }

    isComplete() {
        return Date.now() >= this.startTime + this.duration;
    }
}
