
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const requests = await prisma.bonafideRequest.findMany({
        include: {
            student: true,
            purpose: true
        }
    });

    console.log('Total Requests:', requests.length);
    requests.forEach(r => {
        console.log(`- Request ${r.id}: Student ${r.student.email} (${r.student.department}-${r.student.section}) Status: ${r.status}`);
    });

    const student1 = await prisma.user.findUnique({ where: { email: 'student1@college.edu' } });
    console.log('\nStudent1:', student1?.email, student1?.department, student1?.section);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
