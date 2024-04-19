require('dotenv').config({ path: '/Users/lukeh/Desktop/python_projects/youtube_scraper/.env' }); // Ensure this path is correct

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        // Attempt to fetch all users
        const allUsers = await prisma.users.findMany();
        console.log(allUsers);
    } catch (error) {
        console.error("Error connecting to the database: ", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();