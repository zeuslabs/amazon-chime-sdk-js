### About

The device demo showcases a minimal app that can run in various hardware environments. It is comprised of two parts:

1. `Controller app` - A small application that is responsible for sending actions to the room app, and listening for data from the `Room` to update its UI

2. `Room app` - The application that handles the business logic. It listens for messages from the `Controller` and executes them. It may then send a response back to the `Controller` to update its state

### Running the demos

To run the `device` application demo locally:

1. Ensure you have AWS credentials configured in your `~/.aws` folder for a role with a policy allowing `chime:CreateMeeting`, `chime:DeleteMeeting`, and `chime:CreateAttendee`.

2. Navigate to the `demos/device` folder

3. Build dependecies: `npm run build`

4. Start the webpack server: `npm run start:client`

5. In another terminal in the same directory, start the node server: `npm run start:backend`

6. Open two tabs or two browser windows, navigate to https://localhost:3000/ and https://localhost:3000/controller
