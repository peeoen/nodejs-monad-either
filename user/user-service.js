import axios from "axios";

export class UserService {
  constructor(apiUrl, shouldMockData) {
    this.apiUrl = apiUrl;
    this.shouldMockData = shouldMockData;
  }

  setRetry(maxRetries) {
    if (maxRetries < 1) {
      return Either.left("Max retries should more than 1.");
    }
    return Either.right(maxRetries);
  }

  async getUsers(maxRetries = 1) {
    try {
      if (this.shouldMockData) {
        return Either.right(this.mockUserData());
      } else {
        const response = await this.retry(
          () => axios.get(`${this.apiUrl}/api/users?page=1`),
          maxRetries
        );
        return Either.right(response.data);
      }
    } catch (error) {
      return Either.left(`Error fetching users: ${error.message}`);
    }
  }

  async retry(apiCall, maxRetries = 1) {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        const response = await apiCall();
        return response.data;
      } catch (error) {
        console.error(`Error on attempt ${retries + 1}: ${error.message}`);
        retries++;
      }
    }
    throw new Error(`Max retries exceeded (${maxRetries})`);
  }

  async transformUserData(users) {
    if (users.length > 0) {
      users = users.map((x) => ({ ...x, checked: true }));
      return Either.right(users);
    }
    return Either.left(`Error transfing users.`);
  }

  async getUsersWithTransformation() {
    try {
      const users = await this.getUsers();
      const transformedData = await this.transformUserData(users);
      return transformedData;
    } catch (error) {
      throw new Error(`Error transforming user data: ${error.message}`);
    }
  }

  async mockUserData() {
    const mockData = [
      {
        id: 1,
        email: "ponza@mail.com",
        first_name: "Pon",
        last_name: "Pon",
        avatar: "https://reqres.in/img/faces/1-image.jpg",
        checked: true
      },
    ];
    // return new Promise((resolve, reject) => {
    //   resolve(mockData);
    // });
    return mockData;
  }
}

class Either {
  constructor(value) {
    this.value = value;
  }

  static left(error) {
    return new Left(error);
  }

  static right(value) {
    return new Right(value);
  }

  // Bind function
  async bind(fn) {
    if (this instanceof Left) {
      return this;
    }
    return await fn(this.value);
  }
}

// Left side of Either, represents a failure
export class Left extends Either {
  constructor(value) {
    super(value);
  }

  bind() {
    return this;
  }
}

// Right side of Either, represents a success
export class Right extends Either {
  constructor(value) {
    super(value);
  }
}
