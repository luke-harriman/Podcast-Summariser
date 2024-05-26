const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        // Attempt to fetch all users
        const allUsers = await prisma.subscriptions.findMany({
          where: {
            userEmail: email
          }
    });
        console.log(allUsers);
    } catch (error) {
        console.error("Error connecting to the database: ", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();