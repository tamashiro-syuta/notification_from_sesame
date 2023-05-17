import { Client, ClientConfig, FlexContainer, FlexMessage, validateSignature } from "@line/bot-sdk";

class Line {
  config: ClientConfig
  userId: string
  client: Client
  NOTIFY_MESSAGE: string = 'カギが開いていますぅぅ!!!!'

  constructor() {
    this.config = {
      channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
      channelSecret: process.env.CHANNEL_SECRET,
    }
    this.userId = process.env.LINE_USER_ID || '';
    this.client = new Client(this.config)
  }

  validateSignature = (body: string | Buffer, signature: string | string[] | undefined) => {
    const stringSignature = this.setSignature(signature)
    return validateSignature(
      Buffer.from(JSON.stringify(body)),
      this.config.channelSecret || '',
      stringSignature
    );
  }

  notify = async () => {
    const message: FlexMessage = {
      type: "flex",
      altText: this.NOTIFY_MESSAGE,
      contents: this.flexContents
    };
    await this.client.pushMessage(this.userId || '', message)
      .catch((err) => {
        console.log(err);
      });
  }

  private setSignature = (signature: string | string[] | undefined) => {
    if (typeof signature === 'undefined') return ''
    if (typeof signature === 'string') return signature
    return signature[1]
  }

  private flexContents: FlexContainer = {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: this.NOTIFY_MESSAGE,
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
}

export default Line
// const config: ClientConfig = {
//   channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
//   channelSecret: process.env.CHANNEL_SECRET || '',
// };

// const client: Client = new Client(config);
// const userId = process.env.LINE_USER_ID;

// const NOTIFY_MESSAGE = 'カギが開いていますぅぅ!!!!'

// Webhookの署名検証
// exports.validateSignature = (body: string | Buffer, signature: string | string[] | undefined) => {
//   const stringSignature = setSignature(signature)
//   return validateSignature(
//     Buffer.from(JSON.stringify(body)),
//     config.channelSecret || '',
//     stringSignature
//   );
// }

// プッシュ通知を送る
// exports.notify = async () => {
//   const message: FlexMessage = {
//     type: "flex",
//     altText: NOTIFY_MESSAGE,
//     contents: flexContents
//   };
//   await client.pushMessage(userId || '', message)
//     .catch((err) => {
//       console.log(err);
//     });
// }

// const setSignature = (signature: string | string[] | undefined) => {
//   if (typeof signature === 'undefined') return ''
//   if (typeof signature === 'string') return signature
//   return signature[1]
// }

// フレックスメッセージ
// const flexContents: FlexContainer = {
//   type: "bubble",
//   body: {
//     type: "box",
//     layout: "vertical",
//     contents: [
//       {
//         type: "text",
//         text: NOTIFY_MESSAGE,
//         weight: "bold",
//         size: "md"
//       }
//     ]
//   },
//   footer: {
//     type: "box",
//     layout: "vertical",
//     spacing: "sm",
//     contents: [
//       {
//         type: "button",
//         style: "primary",
//         height: "sm",
//         action: {
//           type: "postback",
//           label: "頼む！閉めてくれ！",
//           data: "lock"
//         }
//       },
//       {
//         type: "box",
//         layout: "vertical",
//         contents: [],
//         margin: "sm"
//       }
//     ],
//     flex: 0
//   }
// }