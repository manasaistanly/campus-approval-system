import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('password123', 10);

    // Create Super Admin
    await prisma.user.upsert({
        where: { email: 'manasaistanly0@gmail.com' },
        update: {},
        create: {
            email: 'manasaistanly0@gmail.com',
            passwordHash: await bcrypt.hash('', 10), // User provided password
            role: Role.ADMIN,
            fullName: 'Manasai Stanly',
        },
    });

    // Create Bonafide Reasons
    const reasons = [
        { reason: 'Internship', category: 'Academic' },
        { reason: 'Industrial Visit', category: 'Academic' },
        { reason: 'Project Work', category: 'Academic' },
        { reason: 'Visa Application', category: 'Travel' },
        { reason: 'Passport Application', category: 'Travel' },
        { reason: 'Bus Pass', category: 'Transport' },
        { reason: 'Education Loan', category: 'Financial' },
        { reason: 'Scholarship Application', category: 'Financial' },
        { reason: 'Bank Account Opening', category: 'Financial' },
    ];

    for (const r of reasons) {
        await prisma.bonafideReason.upsert({
            where: { reason: r.reason },
            update: {},
            create: {
                reason: r.reason,
                category: r.category,
            },
        });
    }

    console.log('Seeding completed. Only Admin and Reasons created.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
