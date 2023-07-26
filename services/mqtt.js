const mqtt = require("mqtt");
const io = require("./socketio");

const host = "sonic.domainenroll.com";
const port = "1883";
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const axios = require("axios");
// const moment = require('moment');

const connectUrl = `mqtt://${host}:${port}`;

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: "sonic.domainenroll.com",
  password: "domainenroll:de120467",
  reconnectPeriod: 1000,
});

const topic = "/user_data";
const userData = "/devlacus/hubo";


client.on("connect", () => {
  console.log("Connected");

  client.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`);
    // client.publish(topic, 'hello world', { qos: 0, retain: false }, (error) => {
    //   if (error) {
    //     console.error(error)
    //   }
    // })
  });
  client.subscribe([userData], () => {
    console.log(`Subscribe to topic '${userData}'`);
    // client.publish(topic, 'hello world', { qos: 0, retain: false }, (error) => {
    //   if (error) {
    //     console.error(error)
    //   }
    // })
  });
});

client.on("message", async (topic, payload) => {
  console.log("Received Message:", topic, payload.toString());
  let axiosResponce = null;
  if (payload.toString() == "Unknown") {
    axiosResponce = { 
      display_name:"Unknown",
     };
    console.log(axiosResponce, "😬");
    // return axiosResponce
  } else {
    axiosResponce = await axios
      .post("https://hubo2.domainenroll.com/api/v1/single-user", {
        user_id: payload.toString(),
      })
      .then((response) => {
        // Handle the response data
        console.log(response.data?.data?.display_name);
        console.log(response.data.length > 0, "🫤");

        return response.data?.data;
      })
      .catch((error) => {
        // Handle the error
        console.error(error);
      });
  }
  // const allUsersResponce =  await axios.get('https://hubo2.domainenroll.com/api/v1/all-users')
  // .then(response => {
  //   // Handle the response data
  //   console.log(response.data?.data);
  //   return response.data?.data
  // })
  // .catch(error => {
  //   console.error(error);
  // });
  if (axiosResponce) {
    io.emit("message", JSON.stringify({ user: axiosResponce }));
  }
});




client.on("allusers", async () => {
  console.log("Received Message:", topic, payload.toString());
  const axiosResponce = await axios
    .get("https://hubo2.domainenroll.com/api/v1/all-users")
    .then((response) => {
      // Handle the response data
      // console.log(response.data?.data);
      return response.data?.data;
    })
    .catch((error) => {
      // Handle the error
      console.error(error);
    });
  if (axiosResponce) {
    io.emit("allusers", JSON.stringify(axiosResponce));
  }
});

io.on(`connection`, (socket) => {

  socket.on("confirmuser", (payload) => {
    console.log("Received confirmuser event:", payload);
    const data =  JSON.stringify(payload)
    client.publish(userData, data, { qos: 0, retain: false }, (error) => {
      if (error) {
        console.error(error);
      }
    });

    // Handle the payload data or perform any necessary operations
  });


  socket.on("message", (data) => {
    // console.log(data);

    client.publish(topic, data, { qos: 0, retain: false }, (error) => {
      if (error) {
        console.error(error);
      }
    });
  });

  socket.on("payload", async (data) => {
    try {
      // Call the API using Axios

      // const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

      // console.log(currentTime); // Example output: 2023-07-10 15:30:45

      //       const mockData = {
      // user_id:'9f94e975-5727-45ab-b155-b2672d1605df',
      // date_time:currentTime
      //       }
      const response = await axios.post(
        "https://hubo2.domainenroll.com/api/v1/calendar-time-specific",
        data
      );
      // console.log(response,"🫥")

      // Emit the API response to the client
      socket.emit("apiResponse", JSON.stringify(response.data));
    } catch (error) {
      console.error(error);
    }
  });
 

  socket.on("getAllUsers", async (data) => {
    const allUsersResponce = await axios.get(
      "https://hubo2.domainenroll.com/api/v1/all-users"
    );
    if (allUsersResponce) {
      // Handle the response data
      // console.log(allUsersResponce.data?.data);
      socket.emit("userList", JSON.stringify(allUsersResponce.data?.data));

      return allUsersResponce.data?.data;
    }
  });

});

module.exports = client;
