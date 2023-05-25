import 'dotenv/config'
import express, { Request, Response } from 'express';
import Line from './lib/line';
import Sesame from './lib/sesame';

export const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;
const router = express.Router();

const sesame = new Sesame();
const line = new Line();

// ヘルスチェック
router.get('/', (req: Request, res: Response) => {
  res.json({
    message: "Application running..."
  });
})

// 家のSESAMEの開閉状態を取得する
router.get('/status', async (req: Request, res: Response) => {
  const { data } = await sesame.get_status();
  res.json(data);
})

// 鍵が開いていれば、閉じる処理を行い、LINE通知する
router.get('/check_key', async (_: Request, res: Response) => {
  const { data } = await sesame.get_status();

  if (data.CHSesame2Status == 'unlocked') {
    await sesame.lock_cmd();
    await line.notify('カギあけっぱだったから、閉めといたで〜');
    return res.json({
      message: "The key is locked"
    })
  };
  res.json({
    message: "The key is already locked"
  })
})

// Webhook
router.post('/webhook', async (req: Request, res: Response) => {
  // Signature検証
  if (!line.validateSignature(req.body, req.headers['x-line-signature'])) {
    return res.status(401).json({
      message: "Invalid signature received"
    })
  }
  // postbackイベントを処理する
  if (req.body.events.length > 0 && req.body.events[0].type == "postback") {
    await sesame.lock_cmd();
  }
  res.sendStatus(200);
})

app.use('/', router);
app.listen(PORT, () => { console.log(`Listening on ${PORT}!`) });
