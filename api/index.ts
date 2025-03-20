import 'dotenv/config';
import express, { Application, json } from 'express';
import helpersRouter from './routes/helpers';

const app: Application = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 8080;

app.use(json());

app.get('/', (req, res) => {
    res.json({ message: 'Hey there!' });
});

app.use('/helpers', helpersRouter);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

export default app;