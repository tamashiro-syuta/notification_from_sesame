import 'dotenv/config'
import express, { Request, Response } from 'express';
import Line from './lib/line';
import Sesame, { LockType } from './lib/sesame';

export const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;
const router = express.Router();

const sesame = new Sesame();
const line = new Line();

// ヘルスチェック
router.get('/', (_: Request, res: Response) => {
  return res.sendStatus(200);
})

// バッチ処理用のエンドポイント
router.get('/lock', async (_: Request, res: Response) => {
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
})

// Webhook
router.post('/webhook', async (req: Request, res: Response) => {
  // Signature検証
  if (!line.validateSignature(req.body, req.headers['x-line-signature'])) {
    return res.status(401).json({
      message: "Invalid signature received"
    })
  }

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
})

app.use('/', router);
app.listen(PORT, () => { console.log(`Listening on ${PORT}!`) });

type Props = {
  lockType: LockType,
  notifyMessage: string,
  failedMessage: string
}

const notifyAfterOperateSesame = async (props: Props) => {
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