var AWS = require('./aws-sdk');
var ddb = new AWS.DynamoDB();
const chime = new AWS.Chime({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');

const oneDayFromNow = Math.floor(Date.now() / 1000) + 60 * 60 * 24;

// Read resource names from the environment
const meetingsTableName = process.env.MEETINGS_TABLE_NAME;
const attendeesTableName = process.env.ATTENDEES_TABLE_NAME;
const sqsQueueArn = process.env.SQS_QUEUE_ARN;
const provideQueueArn = process.env.USE_EVENT_BRIDGE === 'false';

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const getMeeting = async(meetingTitle) => {
  const result = await ddb.getItem({
    TableName: meetingsTableName,
    Key: {
      'Title': {
        S: meetingTitle
      },
    },
  }).promise();
  if (!result.Item) {
    return null;
  }
  const meetingData = JSON.parse(result.Item.Data.S);
  return meetingData;
}

const putMeeting = async(title, meetingInfo) => {
  await ddb.putItem({
    TableName: meetingsTableName,
    Item: {
      'Title': { S: title },
      'Data': { S: JSON.stringify(meetingInfo) },
      'TTL': {
        N: '' + oneDayFromNow
      }
    }
  }).promise();
}

const getAttendee = async(title, attendeeId) => {
  const result = await ddb.getItem({
    TableName: attendeesTableName,
    Key: {
      'AttendeeId': {
        S: `${title}/${attendeeId}`
      }
    }
  }).promise();
  if (!result.Item) {
    return 'Unknown';
  }
  return result.Item.Name.S;
}

const putAttendee = async(title, attendeeId, name) => {
  await ddb.putItem({
    TableName: attendeesTableName,
    Item: {
      'AttendeeId': {
        S: `${title}/${attendeeId}`
      },
      'Name': { S: name },
      'TTL': {
        N: '' + oneDayFromNow
      }
    }
  }).promise();
}

function getNotificationsConfig() {
  if (provideQueueArn) {
    return  {
      SqsQueueArn: sqsQueueArn,
    };
  }
  return {}
}


exports.joinPin = async(event, context, callback) => {
  await new Promise((resolve, reject) => {
    const url = 'https://api.express.ue1.app.chime.aws/meetings/v2/anonymous/join_meeting';
    const pin = event.queryStringParameters.pin;
    const pinFrom = event.queryStringParameters.pin_from;
    const requestBody = JSON.stringify({
      Passcode: pin,
      DisplayName: `Bridge ${pin} <-> ${pinFrom}`,
      DeviceId: uuid(),
      DevicePlatform: 'webclient'
    });
    const options = {
      hostname: 'api.express.ue1.app.chime.aws',
      port: 443,
      path: '/meetings/v2/anonymous/join_meeting',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': requestBody.length
      }
    };
    let responseBody = '';
    const req = require('https').request(options, res => {
      res.on('data', d => {
        responseBody += d;
      });
      res.on('end', () => {
        console.log(`CCP Status: ${res.statusCode}`);
        if (((res.statusCode/100)|0) === 2) {
          const bodyJson = JSON.parse(responseBody);
          const result = {
            Meeting: {
              MeetingId: bodyJson.Meeting.JoinableMeeting.Id,
              MediaPlacement: {
                AudioHostUrl: bodyJson.Meeting.MediaPlacement.AudioDtlsUrl,
                SignalingUrl: `${bodyJson.Meeting.MediaPlacement.SignalingUrl}/control/${bodyJson.Meeting.JoinableMeeting.Id}`,
                TurnControlUrl: bodyJson.Meeting.MediaPlacement.TurnControlUrl,
                ScreenDataUrl: bodyJson.Meeting.MediaPlacement.ScreenBrowserUrl,
                ScreenViewingUrl: bodyJson.Meeting.MediaPlacement.ScreenBrowserUrl,
                ScreenSharingUrl: bodyJson.Meeting.MediaPlacement.ScreenBrowserUrl,
              }
            },
            Attendee: {
              AttendeeId: bodyJson.Meeting.CurrentAttendee.ProfileId,
              JoinToken: bodyJson.SessionToken,
            }
          };
          callback(null, {
            statusCode: 201,
            headers: {},
            body: JSON.stringify(result),
            isBase64Encoded: false
          });
          result.Attendee.JoinToken = result.Attendee.JoinToken.replace(/./g, '*');
          console.log(`Result: ${JSON.stringify(result)}`);
          resolve();
        } else {
          callback(null, {
            statusCode: 404,
            headers: {},
            body: `{"Error": "Could not join PIN (${res.statusCode})"}`,
            isBase64Encoded: false
          });
          resolve();
        }
      });
    });
    req.on('error', error => {
      callback(null, {
        statusCode: 400,
        headers: {},
        body: `{"Error": ${error.message}}`,
        isBase64Encoded: false
      });
      console.error(error);
      resolve();
    });
    req.write(requestBody);
    req.end();
  });
};

// ===== Join or create meeting ===================================
exports.createMeeting = async(event, context, callback) => {
  var response = {
    "statusCode": 200,
    "headers": {},
    "body": '',
    "isBase64Encoded": false
  };

  if (!event.queryStringParameters.title) {
    response["statusCode"] = 400;
    response["body"] = "Must provide title";
    callback(null, response);
    return;
  }
  const title = event.queryStringParameters.title;
  const region = event.queryStringParameters.region || 'us-east-1';
  let meetingInfo = await getMeeting(title);
  if (!meetingInfo) {
    const request = {
      ClientRequestToken: uuid(),
      MediaRegion: region,
      NotificationsConfiguration: getNotificationsConfig(),
    };
    console.info('Creating new meeting: ' + JSON.stringify(request));
    meetingInfo = await chime.createMeeting(request).promise();
    await putMeeting(title, meetingInfo);
  }

  const joinInfo = {
    JoinInfo: {
      Title: title,
      Meeting: meetingInfo.Meeting,
    },
  };

  response.body = JSON.stringify(joinInfo, '', 2);
  callback(null, response);
};

exports.join = async(event, context, callback) => {
  var response = {
    "statusCode": 200,
    "headers": {},
    "body": '',
    "isBase64Encoded": false
  };

  if (!event.queryStringParameters.title || !event.queryStringParameters.name) {
    response["statusCode"] = 400;
    response["body"] = "Must provide title and name";
    callback(null, response);
    return;
  }
  const title = event.queryStringParameters.title;
  const name = event.queryStringParameters.name;
  const region = event.queryStringParameters.region || 'us-east-1';
  let meetingInfo = await getMeeting(title);
  if (!meetingInfo) {
    const request = {
      ClientRequestToken: uuid(),
      MediaRegion: region,
      NotificationsConfiguration: getNotificationsConfig(),
    };
    console.info('Creating new meeting: ' + JSON.stringify(request));
    meetingInfo = await chime.createMeeting(request).promise();
    await putMeeting(title, meetingInfo);
  }

  console.info('Adding new attendee');
  const attendeeInfo = (await chime.createAttendee({
      MeetingId: meetingInfo.Meeting.MeetingId,
      ExternalUserId: uuid(),
    }).promise());

  putAttendee(title, attendeeInfo.Attendee.AttendeeId, name);

  const joinInfo = {
    JoinInfo: {
      Title: title,
      Meeting: meetingInfo.Meeting,
      Attendee: attendeeInfo.Attendee
    },
  };

  response.body = JSON.stringify(joinInfo, '', 2);
  callback(null, response);
};

exports.attendee = async(event, context, callback) => {
  var response = {
    "statusCode": 200,
    "headers": {},
    "body": '',
    "isBase64Encoded": false
  };
  const title = event.queryStringParameters.title;
  const attendeeId = event.queryStringParameters.attendee;
  const attendeeInfo = {
    AttendeeInfo: {
      AttendeeId: attendeeId,
      Name: await getAttendee(title, attendeeId),
    },
  };
  response.body = JSON.stringify(attendeeInfo, '', 2);
  callback(null, response);
};

exports.end = async(event, context, callback) => {
  var response = {
    "statusCode": 200,
    "headers": {},
    "body": '',
    "isBase64Encoded": false
  };
  const title = event.queryStringParameters.title;
  let meetingInfo = await getMeeting(title);
  await chime.deleteMeeting({
    MeetingId: meetingInfo.Meeting.MeetingId,
  }).promise();
  callback(null, response);
};
