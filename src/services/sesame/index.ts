import axios, { AxiosResponse } from "axios";

export type LockType = 'locked' | 'unlocked' | 'moved'

type Status = {
  "batteryPercentage": number,  // 電池残量94%
  "batteryVoltage": number,     // 電池の電圧, 単位: ボルト(V)
  "position": number,           // セサミデバイスの角度, 360˚ は 1024
  "CHSesame2Status": LockType,  // locked | unlocked | moved
  "timestamp": number           // Sesame Shadow が更新された時間。 1970/1/1 00:00:00 からミリ秒単位のタイムスタンプ
}

class Sesame {
  aesCmac: (key: Buffer, message: Buffer) => Buffer;

  constructor() {
    this.aesCmac = require('node-aes-cmac').aesCmac;
  }

  getStatus = async (): Promise<AxiosResponse<Status, any>> => {
    const { SESAME_UUID, SESAME_API_KEY } = process.env
    const url = `https://app.candyhouse.co/api/sesame2/${SESAME_UUID}`;

    return await axios.get(url, { headers: { 'x-api-key': SESAME_API_KEY! } });
  }

  lockCmd = async (): Promise<AxiosResponse<any, any>> => {
    return await this.operateSesame('locked')
  }

  unlockCmd = async (): Promise<AxiosResponse<any, any>> => {
    return await this.operateSesame('unlocked')
  }

  private operateSesame = async (lockType: LockType) => {
    const { SESAME_UUID, SESAME_API_KEY, KEY_SECRET_HEX } = process.env
    const url = `https://app.candyhouse.co/api/sesame2/${SESAME_UUID}/cmd`;
    const { cmd, history } = this.setCmdAndHistory(lockType);
    const base64History = Buffer.from(history).toString('base64');
    const sign: Buffer = this.generateRandomTag(KEY_SECRET_HEX || '');

    const headers = { 'x-api-key': SESAME_API_KEY! }
    const body = {
      cmd: cmd,
      history: base64History,
      sign: sign
    }

    return await axios.post(url, body, { headers: headers });
  }

  private generateRandomTag = (secret: string) => {
    const key = Buffer.from(secret, 'hex');
    const date = Math.floor(Date.now() / 1000);
    const dateDate = Buffer.allocUnsafe(4);
    dateDate.writeUInt32LE(date);
    const message = Buffer.from(dateDate.slice(1, 4));
    return this.aesCmac(key, message);
  }

  // toggle: 88, lock: 82, unlock: 83
  private setCmdAndHistory = (cmd: LockType) => {
    const LOCK_USER = 'お家見守り隊'
    if (cmd === "unlocked") return { cmd: 83, history: LOCK_USER }
    if (cmd === 'locked') return { cmd: 82, history: LOCK_USER }
    return { cmd: 88, history: 'toggled by web api' } // == toggle the key
  }
}

export default Sesame