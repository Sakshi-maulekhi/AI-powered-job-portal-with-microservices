import express from 'express';
import {isAuth} from "../middleware/auth.js";
import {updateProfile, getUserProfile, myProfile, addSkill, deleteSkill} from "../controller/user.js"; 

const router = express.Router();

router.get("/me",isAuth, myProfile);
router.get("/:userID", getUserProfile);
router.put("/updated/:userID",isAuth,updateProfile)
router.post(
  "/skill/add",
  isAuth,
  addSkill
);

router.delete(
  "/skill/delete",
  isAuth,
  deleteSkill
);

export default router;