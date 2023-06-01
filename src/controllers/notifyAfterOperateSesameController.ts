import { Request, Response } from 'express';
import Sesame, { LockType } from '../services/sesame';
import Line from '../services/line';

type Props = {
  lockType: LockType,
  notifyMessage: string,
  failedMessage: string
}

const notifyAfterOperateSesame = async (props: Props) => {
  const sesame = new Sesame();
  const line = new Line();

  const { lockType, notifyMessage, failedMessage } = props;
  const { data } = await sesame.getStatus();

  if (data.CHSesame2Status !== lockType) {
    const operateCmd = lockType == 'locked' ? sesame.lockCmd : sesame.unlockCmd;
    try {
      await operateCmd();
      await line.notify(notifyMessage);
    } catch (error) {
      await line.notify(failedMessage);
      throw error;
    }
  }
}

// TODO 後で消す
export const sample = (_: Request, res: Response) => {
  res.sendStatus(500)
}

// バッチ処理用
export const lock = async (_: Request, res: Response) => {
  try {
    await notifyAfterOperateSesame({
      lockType: 'locked',
      notifyMessage: 'カギあけっぱだったから、閉めといたで〜',
      failedMessage: 'すまん！カギ閉めるのできんかった！',
    })
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
}

export const webhook = async (req: Request, res: Response) => {
  try {
    const UNLOCK_TEXT = "開け、ゴマ!!!!"
    const LOCK_TEXT = "閉まれ、ゴマ!!!!"
    const unlockCondition = req.body.events.length > 0 && req.body.events[0].message.text == UNLOCK_TEXT
    const lockCondition = req.body.events.length > 0 && req.body.events[0].message.text == LOCK_TEXT

    if (unlockCondition) {
      await notifyAfterOperateSesame({
        lockType: 'unlocked',
        notifyMessage: 'カギ開けたで〜',
        failedMessage: 'すまん！カギ開けるのできんかった！',
      })
    }
    if (lockCondition) {
      await notifyAfterOperateSesame({
        lockType: 'locked',
        notifyMessage: 'カギ閉めといたで〜',
        failedMessage: 'すまん！カギ閉めるのできんかった！',
      })
    }
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
}
