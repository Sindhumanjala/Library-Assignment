const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const checkBookExists = async (id) => {
  const book = await prisma.book.findUnique({ where: { id } });
  return book !== null;
};

const checkBookAvailability = async (id) => {
  const book = await prisma.book.findUnique({ where: { id } });
  return book && book.availabilityStatus;
};

const updateBookAvailability = async (id, availabilityStatus) => {
  return await prisma.book.update({
    where: { id },
    data: { availabilityStatus }
  });
};

module.exports = {
  checkBookExists,
  checkBookAvailability,
  updateBookAvailability
};
