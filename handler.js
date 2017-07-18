'use strict'

const axios = require('axios')

// TODO: Ersetze diese Token mit den Tokens aus der Facebook Konsole
const VERIFICATION_TOKEN = '<verification-token>'
const ACCESS_TOKEN = '<access-token>'
const MESSAGES_URL = `https://graph.facebook.com/v2.6/me/messages?access_token=${ACCESS_TOKEN}`

// Behandelt Anfragen zur Verifizierung deines Webhooks.
// Verifizierungsanfragen enthalten die URL-Paramter `hub.verify_token` und `hub.challenge`.
// Chatbots authentifizieren sich dabei durch Prüfung und Rückgabe das Challenge-Tokens.
// Siehe dazu auch: https://developers.facebook.com/docs/graph-api/webhooks#verification
module.exports.verify = (event, context, callback) => {
  if (event.query['hub.verify_token'] === VERIFICATION_TOKEN && event.query['hub.challenge']) {
    return callback(null, {
      statusCode: 200,
      body: parseInt(event.query['hub.challenge'])
    })
  } else {
    return callback('Invalid token')
  }
}

// Hier laufen alle Updates ein, die dein Webhook abonniert hat.
// Updates für den Facebook Messenger enthält eine Liste mit Einträgen für jede Seite.
// Jeder Eintrag wiederum enthält eine Liste mit Nachrichten, welche von Nutzern gesendet wurden.
// Siehe dazu auch: https://developers.facebook.com/docs/graph-api/webhooks#update-notification
module.exports.update = (event, context, callback) => {
  event.body.entry.forEach(entry => {
    entry.messaging.forEach(messagingItem => {

      // Eine Textnachricht wurde an unseren Bot gesendet, auf welche wir mit selbiger antworten.
      // Dazu senden wir eine POST-Anfrage an die Graph-API von Facebook
      // Eine Übersicht über alle Elemente, die du einem Nutzer senden kannst findst du unter:
      // https://developers.facebook.com/docs/messenger-platform/send-api-reference 
      if (messagingItem.message && messagingItem.message.text) {
        const payload = {
          recipient: { id: messagingItem.sender.id },
          message: { text: messagingItem.message.text }
        }
        axios.post(MESSAGES_URL, payload).then(response => {
          console.log('Successfully delivered message', response)
        }).catch(error => {
          console.error('Error delivering message', error)
        })
      }

    })
  })
  callback(null, { statusCode: 204 })
}
