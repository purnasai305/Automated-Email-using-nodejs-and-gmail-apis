const express = require("express");
const app = express();
const pathModule = require("path");
const { authenticate: googleAuth } = require("@google-cloud/local-auth");
const fsPromises = require("fs").promises;
const { google } = require("googleapis");

const serverPort = 8080;
const gmailScopes = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://mail.google.com/",
];
const labelName = "Vacation Auto-Reply";

app.get("/", async (req, res) => {
  const authClient = await googleAuth({
    keyfilePath: pathModule.join(__dirname, "credentials.json"),
    scopes: gmailScopes,
  });

  const gmailAPI = google.gmail({ version: "v1", auth: authClient });

  async function getUnrepliedMessages(auth) {
    const gmail = google.gmail({ version: "v1", auth });
    const response = await gmail.users.messages.list({
      userId: "me",
      labelIds: ["INBOX"],
      q: "is:unread",
    });
    return response.data.messages || [];
  }

  async function createLabel(auth) {
    const gmail = google.gmail({ version: "v1", auth });
    try {
      const response = await gmail.users.labels.create({
        userId: "me",
        requestBody: {
          name: labelName,
          labelListVisibility: "labelShow",
          messageListVisibility: "show",
        },
      });
      return response.data.id;
    } catch (error) {
      if (error.code === 409) {
        const response = await gmail.users.labels.list({
          userId: "me",
        });
        const label = response.data.labels.find(
          (label) => label.name === labelName
        );
        return label.id;
      } else {
        throw error;
      }
    }
  }

  async function mainRoutine() {
    const labelId = await createLabel(authClient);

    setInterval(async () => {
      const unrepliedMessages = await getUnrepliedMessages(authClient);

      if (unrepliedMessages && unrepliedMessages.length > 0) {
        for (const message of unrepliedMessages) {
          const messageData = await gmailAPI.users.messages.get({
            auth: authClient,
            userId: "me",
            id: message.id,
          });

          const email = messageData.data;
          const hasReplied = email.payload.headers.some(
            (header) => header.name === "In-Reply-To"
          );

          if (!hasReplied) {
            const replyMessage = {
              userId: "me",
              resource: {
                raw: Buffer.from(
                  // Your reply message content here
                ).toString("base64"),
              },
            };

            await gmailAPI.users.messages.send(replyMessage);

            await gmailAPI.users.messages.modify({
              auth: authClient,
              userId: "me",
              id: message.id,
              resource: {
                addLabelIds: [labelId],
                removeLabelIds: ["INBOX"],
              },
            });
          }
        }
      }
    }, Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000);
  }

  mainRoutine();

  res.json({ message: "Authentication successful" });
});

app.listen(serverPort, () => {
  console.log(`Server is running on port ${serverPort}`);
});
