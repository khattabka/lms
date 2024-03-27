import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
    await db.category.createMany({
        data: [
            {
                name: "Housing",
            },
            {
                name: "Food",
            },
            {
                name: "Transportation",
            },
            {
                name: "Utilities",
            },
            {
                name: "Insurance",
            },
            {
                name: "Personal",
            },
            {
                name: "Other",
            },      
        ],
        
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        console.log("Finished seeding categories");
        
        await db.$disconnect();
    })