import { Client, ClientConfig, FlexContainer, FlexMessage, validateSignature } from "@line/bot-sdk";

class Line {
  config: ClientConfig
  userId: string
  partnerId: string
  client: Client
  NOTIFY_MESSAGE = 'カギが開いていますぅぅ!!!!'

  constructor() {
    this.config = {
      channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
      channelSecret: process.env.CHANNEL_SECRET,
    }
    this.userId = process.env.LINE_USER_ID || '';
    this.partnerId = process.env.LINE_PARTNER_ID || '';
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
    const notifyMembers = [this.userId, this.partnerId].filter(item => item)
    notifyMembers.forEach(async (id) => {
      await this.client.pushMessage(id, message)
        .catch((err) => {
          console.log(err);
        });
    })
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
