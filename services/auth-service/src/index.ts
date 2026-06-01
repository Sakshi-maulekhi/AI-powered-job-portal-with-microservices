import app from './app.js';
import dotenv from 'dotenv';
import {sql} from './utils/db.js';


dotenv.config()

async function initDb(){
    try{
        await sql `
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role')
            THEN
            CREATE TYPE user_role AS ENUM('jobseeker','recruiter');
            END IF;
        END $$
        `;
        await sql`
        CREATE TABLE IF NOT EXISTS users(
            user_id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            phone_number VARCHAR(20) NOT NULL,
            password VARCHAR(255) NOT NULL,
            role user_role NOT NULL,
            bio TEXT,
            resume VARCHAR(255),
            profile_pic VARCHAR(255),
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            subscription TIMESTAMPTZ
        )
        `
        await sql`
        Create table if not exists skills(
         skill_id SERIAL PRIMARY KEY,
         name VARCHAR(255) NOT NULL UNIQUE
        )`
        await sql`
        CREATE TABLE IF NOT EXISTS user_skills(
            user_id Integer NOT NULL REFERENCES users(user_id) on delete cascade,
            skill_id Integer NOT NULL REFERENCES skills(skill_id) on delete cascade,
            PRIMARY KEY (user_id, skill_id)
        )`
        console.log('✔ Database table created successfully');
        
    }
    catch(error){
        console.log('✖ Error initializing database:', error);
        process.exit(1);
    }
}

initDb().then(()=>{
    app.listen(process.env.PORT, ()=>{
    console.log(`Auth service is running on  http://localhost:${process.env.PORT}`);
})
})
