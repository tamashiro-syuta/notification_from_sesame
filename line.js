const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
const client = new line.Client(config);
const userId = process.env.LINE_USER_ID;

const NOTIFY_MESSAGE = 'カギが開いていますぅぅ!!!!'

// Webhookの署名検証
exports.validateSignature = (body, signature) => {
  return line.validateSignature(Buffer.from(JSON.stringify(body)), config.channelSecret, signature);
}

// プッシュ通知を送る
exports.notify = async () => {
  const message = {
    type: "flex",
    altText: NOTIFY_MESSAGE,
    contents: flexContents
  };
  await client.pushMessage(userId, message)
    .catch((err) => {
      console.log(err);
    });
}

// フレックスメッセージ
const flexContents = {
  type: "bubble",
  body: {
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "text",
        text: NOTIFY_MESSAGE,
        weight: "bold",
        size: "md"
      }
    ]
  },
  footer: {
    type: "box",
    layout: "vertical",
    spacing: "sm",
    contents: [
      {
        type: "button",
        style: "primary",
        height: "sm",
        action: {
          type: "postback",
          label: "頼む！閉めてくれ！",
          data: "lock"
        }
      },
      {
        type: "box",
        layout: "vertical",
        contents: [],
        margin: "sm"
      }
    ],
    flex: 0
  }
}