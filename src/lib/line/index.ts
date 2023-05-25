import { Client, ClientConfig, FlexContainer, FlexMessage, Message, validateSignature } from "@line/bot-sdk";

class Line {
  config: ClientConfig
  notifyMembers: string[]
  client: Client

  constructor() {
    this.config = {
      channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
      channelSecret: process.env.CHANNEL_SECRET,
    }
    const adminUserId = process.env.LINE_USER_ID || '';
    const partnerId = process.env.LINE_PARTNER_ID || '';
    this.notifyMembers = [adminUserId, partnerId].filter(item => item)
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

  notify = async (messageText: string) => {
    const message: Message = {
      type: 'text',
      text: messageText
    };

    await this.client.multicast(this.notifyMembers, message)
      .catch((err) => {
        console.log(err);
      });
  }

  private setSignature = (signature: string | string[] | undefined) => {
    if (typeof signature === 'undefined') return ''
    if (typeof signature === 'string') return signature
    return signature[1]
  }
}

export default Line
