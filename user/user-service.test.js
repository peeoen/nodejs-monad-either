import { expect } from "chai";
import { UserService, Right } from "./user-service.js";

describe("hello", function () {
  it("should return all users is checked", async function () {
    const userService = new UserService("", true);
    const userData = await userService.mockUserData();

    const transformedData = await userService.transformUserData(userData);
    console.log(transformedData)
    expect(transformedData).to.be.an.instanceOf(Right);
    expect(userData.length).to.equal(1);
    expect(userData[0]).to.have.property("checked", true);
  });
});