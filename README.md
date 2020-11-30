# Ticketing Application Backend

## Context

Build the backend for an application that processes event ticket sales. The app should implement RESTful API and connect to a database.

## How to run the app
- Prerequisites:
    - Node v14.15.0 
    - npm 6.14.8
    - Docker version 19.03.5
    - MongoDB
- Clone repo
```
git clone https://github.com/quang-sudo/tiket-app-back-end.git
cd tiket-app-back-end
npm install
```
- Run the unit tests
    - Modifty file `.env.test` with your test environment.
    - Run 
        ```
        npm run test
        ```
    - If everything works correct, it dislays:
        ![Alt text](./images/unit-test.png?raw=true "Unit test result")

- Run a docker container:
    - Build and deploy docker
        ``` 
        docker build -t tiket-app:v1 .
        docker-compose up
        ```
    - Check your browser at `http://<SERVER_HOST>:3000/`, it will display a message like this.  ![Alt text](./images/welcome-screen.png?raw=true "Welcome screen")

- DocBlocks for API
    - After run a docker container you can check the document for APIs at `http://<SERVER_HOST>:3000/api-docs`. The Swagger doc will display: ![Alt text](./images/api-docs.png?raw=true "Welcome screen")

- Initial dummy database by run:
    ```
        node populatedb <your mongodb url>
    ```

- API endpoints (Detail information you can see in DocBlocks for API at `http://<SERVER_HOST>:3000/api-docs`)
    - Handling User:
        - Get list user: `/users/`
        - Get single user: `/users/:user_id`
        - Create user: `/users/create_user`
        - Update user: `/users/update_user`
        - Delete user: `/users/delete_user`
    - Handling Event:
        - Get list event: `/events/`
        - Get single event: `/events/events`
        - Create event: `/events/create_event`
        - Update event: `/events/update_event`
        - Delete event: `/events/delete_event`
    - Handling orders
        - Get list order: `/orders/`
        - Get single order: `/orders/orders`
        - Create order: `/orders/create_order`
        - Update order: `/orders/update_order`
        - Delete order: `/orders/delete_order` 

- User authentication/authorization:
    - I tried to use `keycloak` for secure API, it works fine in local computer, but when I setup in `docker-compose` it doesn't work(I get an error 403 (forbidden)). I have try many ways but still have not resolved it.

- Handle race conditions:
    - The system use `Async-Mutex `for handling race conditions.
    - When multiple users may try to buy the same ticket at the same time, Mutex lock to only allow one request to be processed at a time, blocking the other requests until it is their turn. Detail implementation at `orderController.createOrder` function
-  Logging strategy:
    - The system use `winston` to logger 
    - Configuration of logger can be found at `winston.js`
    - Error logs are written to `errors.log`


## Requirements

### Functionality

- Endpoints for handling users (id, name, email, etc.)

- Endpoints for handling events (id, name, date, location, price, quantity, etc.)
- Endpoints for handling orders (id, user_id, event_id, etc.)
- Provide proper unit tests
- Provide DocBlocks for your API
- Create your own initial dummy data
- Persist the data in a database

You may need additional tables and objects in your app. Feel free to implement as needed.

### Tech stack
- Use Node.js and any framework
- Use a DB of your choice
- The app must run inside a Docker container

### Bonus (in order of importance)

- Provide a complete user authentication/authorization strategy with OAuth or Keycloak.
- Handle race conditions where multiple users may try to buy the same ticket at the same time.
- Implement a clear logging strategy.

