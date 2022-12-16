
export class Tools {
    static matchAllRegExp(expression, text) {
        let result: any[] = []
        let match = expression.exec(text);
        while (match) {
            result.push(match)
            match = expression.exec(text);
        }
        return result
    }
}
