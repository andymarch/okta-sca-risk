'use strict';

const moment = require("moment")
const okta = require('@okta/okta-sdk-nodejs');



module.exports.handler = async (event) => {
  console.log("Recieved"+JSON.stringify(event.body))

  var payload = JSON.parse(event.body)
  var value = payload.transactionValue
  var subject = payload.subject

  var timestamp = moment().toISOString()
  var expires = moment().add(2, 'minutes').toISOString()
  var risk = "LOW"

  //TODO write evaluation logic here
  if(value > 25){
    risk = "HIGH"
  }

  var risk = [
    {
      'timestamp': timestamp,
      'expiresAt': expires,
      'subjects': [
        {
          'ip': subject,
          'riskLevel': risk
        }
      ]
    }
  ]

  const request = {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(risk)
  };

  try{
    console.log(JSON.stringify(request.body))
    const client = new okta.Client({
      orgUrl: "https://"+process.env.TENANT,
      authorizationMode: 'PrivateKey',
      clientId: process.env.CLIENT_ID,
      scopes: ['okta.riskEvents.manage'],
      privateKey: process.env.CLIENT_SECRET_JWT
    });
    
    await client.http.http("https://"+process.env.TENANT+"/api/v1/risk/events/ip",request)
    return {
      statusCode: 200,
      body: JSON.stringify(
              {
                "result": "Done",
                "expires": expires,
              }
          )
    };

  } catch(err){
    console.log(err)
    return {
      statusCode: 500,
      body: JSON.stringify(
              {
                "result": "Fail",
                "error": err
              }
          )
    };
  }
};