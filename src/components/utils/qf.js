export default function coefQF(qf) {
    if (qf <= 0 || qf === null || qf === "") {
        return 1
    } else if (qf < 600) {
        return 0.6
    } else if (qf < 900) {
        return 0.8
    } else {
        return 1
    }
}