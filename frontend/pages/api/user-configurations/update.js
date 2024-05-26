// Importing necessary modules
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

// Creating an instance of PrismaClient
const prisma = new PrismaClient();

// Handler for the API endpoint
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        // Handling the case where the method is not POST
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Extracting data from the request body
    const { email, creator_link, creator_name, key_words, multi_media } = req.body;

    try {
        // Using raw SQL to execute a MERGE statement for an array of creators
        // const mergeResult = await prisma.$executeRawUnsafe(`
        //   MERGE INTO user_configurations AS u
        //   USING (SELECT $1::text AS email, $2::text[] AS creator_link, $3::text[] AS creator_name, $4::text[] AS key_words, $5::boolean AS multi_media) AS v
        //   ON u.email = v.email
        //   WHEN MATCHED THEN
        //     UPDATE SET 
        //       creator_link = v.creator_link,
        //       creator_name = v.creator_name,
        //       key_words = v.key_words,
        //       multi_media = v.multi_media
        //   WHEN NOT MATCHED THEN
        //     INSERT (email, creator_link, creator_name, key_words, multi_media)
        //     VALUES (v.email, v.creator_link, v.creator_name, v.key_words, v.multi_media)
        //     RETURNING *;
        // `, email, creator_link, creator_name, key_words, multi_media); // Ensure the data types match your schema


        const upsertResult = await prisma.$queryRawUnsafe(`
                INSERT INTO user_configurations (email, creator_link, creator_name, key_words, multi_media, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (email) DO UPDATE
                SET creator_link = EXCLUDED.creator_link,
                    creator_name = EXCLUDED.creator_name,
                    key_words = EXCLUDED.key_words,
                    multi_media = EXCLUDED.multi_media,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING email, updated_at, created_at;
        `, email, creator_link, creator_name, key_words, multi_media);


        if (new Date(upsertResult[0].updated_at).getTime() === new Date(upsertResult[0].created_at).getTime()) {
            // Insert into the weekly_user_configuration_snapshot table if new records were inserted
            await prisma.$executeRawUnsafe(`
                INSERT INTO weekly_user_configuration_snapshot (user_id, full_name, email, creator_link, creator_name, key_words, multi_media, snapshot_time)
                SELECT u.user_id, u.full_name, uc.email, uc.creator_link, uc.creator_name, uc.key_words, uc.multi_media, CURRENT_TIMESTAMP
                FROM user_configurations uc
                JOIN users u
	                ON uc.email = u.email
                WHERE uc.email = $1;
            `, email);
            console.log('Inserted into weekly_user_configuration_snapshot');
        }

        // Check if the merge result was successful
        if (upsertResult) {
            // Sending a successful response back
            res.status(200).json({ message: 'User configuration updated successfully' });
        } else {
            // Throwing an error if the merge did not succeed
            throw new Error('Merge operation did not succeed.');
        }
    } catch (error) {
        // Handling any errors during the process
        console.error('Request error', error);
        res.status(500).json({ error: 'Error updating user configuration', details: error.message });
    }
}
