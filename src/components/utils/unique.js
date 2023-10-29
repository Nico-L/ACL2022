export default function returnUniques(data, key) {
    let flag = []
    let unique = []
    data.forEach(elem => {
        if (!flag[elem[key]]) {
            flag[elem[key]] = true
            unique.push(elem)
        }
    })
    return unique
}