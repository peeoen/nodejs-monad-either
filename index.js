import express from "express";
import { Logger } from "./backup/logging-service.js";
import { UserService, Left } from "./user/user-service.js";

const app = express();
const port = 3000;
let count_req = 0;

app.get("/", (req, res) => {
  const appLogger = new Logger("MyApp");
  res.locals.count = ++count_req;
  res.locals.logging = appLogger;
  res.locals.logging.log(` starting ${res.locals.count} `);

  delayWithRandom(() => {
    res.locals.logging.log(` done ${res.locals.count} `);
    res.send("Hello");
  });
});

app.get("/users", async (req, res) => {
  const shouldMockUserData = false;
  const userService = new UserService("https://reqres.in", shouldMockUserData);
  const result = await userService
    .setRetry(3)
    .bind((value) => userService.getUsers(value))
    
  const users_transformed = await  result.bind((value) => userService.transformUserData(value))

  if (result instanceof Left) {
    console.error("Error:", result.value);
    return res.send(result.value);
  } else {
    res.send(users_transformed);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

function delayWithRandom(callback) {
  // Generate a random number between 1 and 5 (inclusive)
  const randomDelay = Math.floor(Math.random() * 5) + 1;

  console.log("request time " + randomDelay + "s");
  // Delay execution using setTimeout with random delay in milliseconds
  setTimeout(callback, randomDelay * 1000);
}
