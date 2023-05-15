import { addition } from "./operation.ts"
describe("Operation test", () => {
    test("simple addition ", () => {
        expect(addition(1, 2)).toEqual(3)
    })
})