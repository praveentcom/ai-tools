import express, { Request, Response, Router } from 'express';
import { AutoTokenizerConfig, autoTokenizerConfig, HFAutoTokenizer } from '../helpers/autotokenizer';

const helpersRouter: Router = express.Router();

const qwen25Coder7bEncoding = new HFAutoTokenizer(
  autoTokenizerConfig.QWEN_2_5_CODER_7B.MODEL_PATH
);

helpersRouter.post('/tokenize', async (req: Request, res: Response) => {
    try {
        const { payload, model } = req.body;
        if (!payload) {
            res.status(400).json({ 
                success: false,
                error: 'Payload is required' 
            });
            return;
        } else if (!model) {
            res.status(400).json({ 
                success: false,
                error: 'Model is required' 
            });
            return;
        }
    
        let encodeResult: number[] = [];
        let encoder: AutoTokenizerConfig | null = null;
        switch (model) {
          case 'qwen-2.5-coder-7b': {
            encodeResult = (await qwen25Coder7bEncoding.encode(payload)) || [];
            encoder = autoTokenizerConfig.QWEN_2_5_CODER_7B;
            break;
          }
          default: {
            res.status(400).json({ 
              success: false,
              error: 'Model not supported' 
            });
            return;
          }
        }
    
        res.send({ 
          success: true,
          result: {
            encoder,
            tokens: {
                count: encodeResult.length,
                value: encodeResult
            }
          } 
        });
        return;
    } catch (error) {
        res.status(500).json({ 
          success: false,
          error: 'Internal server error' 
        });
        return;
    }
});

export default helpersRouter;