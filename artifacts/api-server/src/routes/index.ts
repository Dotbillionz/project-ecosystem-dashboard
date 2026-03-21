import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import tradeRouter from "./trade";
import userRouter from "./user";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(tradeRouter);
router.use(userRouter);

export default router;
