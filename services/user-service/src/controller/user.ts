import { TryCatch } from "../utils/TryCatch";
import { AuthenticatedRequest } from "../middleware/auth";
import ErrorHandler from "../utils/ErrorHandler";
import { sql } from "../utils/db";
import getBuffer from "../utils/buffer";
import axios from "axios";

export const myProfile = TryCatch(async(req: AuthenticatedRequest, res, next)=>{
    const user = req.user;
    res.json(user);
})

export const getUserProfile = TryCatch(async(req,res,next)=>{
    const {userID} = req.params;
    console.log("Requested userID:", userID);


    const users = await sql `
    SELECT
    u.user_id,
    u.name,
    u.email,
    u.phone_number,
    u.role,
    u.bio,
    u.resume,
    u.profile_pic,
    u.resume_public_id,
    u.subscription,
    ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
FROM users u
LEFT JOIN user_skills us ON u.user_id = us.user_id
LEFT JOIN skills s ON us.skill_id = s.skill_id
WHERE u.user_id = ${userID}
GROUP BY
    u.user_id,
    u.name,
    u.email,
    u.phone_number,
    u.role,
    u.bio,
    u.resume,
    u.profile_pic,
    u.resume_public_id,
    u.subscription
    `;
    
    if(users.length == 0){
        throw new ErrorHandler("User not found",404);
    }

    const user = users[0];
    user.skills = user.skills || [];

    res.json(user);

})
export const updateProfile = TryCatch(
async (req: AuthenticatedRequest, res, next) => {
const user = req.user;

if (!user) {
  throw new ErrorHandler("Unauthorized", 401);
}

const {
  name,
  phone_number,
  bio,
  profile_pic,
  resume,
  subscription,
} = req.body;

const updatedUsers = await sql`
  UPDATE users
  SET
    name = COALESCE(${name}, name),
    phone_number = COALESCE(${phone_number}, phone_number),
    bio = COALESCE(${bio}, bio),
    profile_pic = COALESCE(${profile_pic}, profile_pic),
    resume = COALESCE(${resume}, resume),
    subscription = COALESCE(${subscription}, subscription)
  WHERE user_id = ${user.user_id}
  RETURNING *
`;

if (updatedUsers.length === 0) {
  throw new ErrorHandler("User not found", 404);
}

res.status(200).json({
  success: true,
  message: "Profile updated successfully",
  user: updatedUsers[0],
});


}
);

export const addSkill = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler("Unauthorized", 401);
    }

    const { skillName } = req.body;

    if (!skillName || !skillName.trim()) {
      throw new ErrorHandler("Skill name is required", 400);
    }

    let wasSkillAdded = false;

    try {
      await sql`BEGIN`;

      const [skill] = await sql`
        INSERT INTO skills (name)
        VALUES (${skillName.trim()})
        ON CONFLICT (name)
        DO UPDATE SET name = EXCLUDED.name
        RETURNING skill_id
      `;

      const skillId = skill.skill_id;

      const insertionResult = await sql`
        INSERT INTO user_skills (user_id, skill_id)
        VALUES (${user.user_id}, ${skillId})
        ON CONFLICT (user_id, skill_id)
        DO NOTHING
        RETURNING user_id
      `;

      if (insertionResult.length > 0) {
        wasSkillAdded = true;
      }

      await sql`COMMIT`;
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }

    if (!wasSkillAdded) {
      return res.status(200).json({
        success: false,
        message: "User already possesses this skill",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Skill added successfully",
    });
  }
);

export const deleteSkill = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler("Unauthorized", 401);
    }

    const { skillName } = req.body;

    if (!skillName?.trim()) {
      throw new ErrorHandler("Skill name is required", 400);
    }

    const result = await sql`
      DELETE FROM user_skills
      WHERE user_id = ${user.user_id}
      AND skill_id = (
        SELECT skill_id
        FROM skills
        WHERE LOWER(name) = LOWER(${skillName.trim()})
      )
      RETURNING user_id
    `;

    if (result.length === 0) {
      throw new ErrorHandler("Skill not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Skill removed successfully",
    });
  }
);
export const updateProfilePic = TryCatch(
  async (req: AuthenticatedRequest, res,next) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler("Authentication required",401);
    }

    const file = req.file;

    if (!file) {
      throw new ErrorHandler("No image file provided",400);
    }

    const oldPublicId = user.profile_pic_public_id;

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      throw new ErrorHandler("failed to generate buffer",500);
    }

    const { data: uploadResult } = await axios.post(
      `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
      {
        buffer: fileBuffer.content,
        public_id: oldPublicId,
      }
    );

    const [updatedUser] = await sql`
    UPDATE users SET profile_pic = ${uploadResult.url}, profile_pic_public_id = ${uploadResult.public_id} WHERE user_id = ${user.user_id} RETURNING user_id, name, profile_pic;
    `;

    res.json({
      message: "profile pic updated",
      updatedUser,
    });
  }
);

export const updateResume = TryCatch(async (req: AuthenticatedRequest, res,next) => {
  const user = req.user;

  if (!user) {
    throw new ErrorHandler("Authentication required",401);
  }

  const file = req.file;

  if (!file) {
    throw new ErrorHandler("No pdf file provided",400);
  }

  const oldPublicId = user.resume_public_id;

  const fileBuffer = getBuffer(file);

  if (!fileBuffer || !fileBuffer.content) {
    throw new ErrorHandler("failed to generate buffer",500);
  }

  const { data: uploadResult } = await axios.post(
    `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
    {
      buffer: fileBuffer.content,
      public_id: oldPublicId,
    }
  );

  const [updatedUser] = await sql`
    UPDATE users SET resume = ${uploadResult.url}, resume_public_id = ${uploadResult.public_id} WHERE user_id = ${user.user_id} RETURNING user_id, name, resume;
    `;

  res.json({
    message: "Resume updated",
    updatedUser,
  });
});