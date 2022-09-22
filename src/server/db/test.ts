import { prisma } from "./client";

export async function insertData() {
  const user = await prisma.user.create({
    data: {
      email: "user2@gmail.com",
      firstName: "user1",
      lastName: "user1",
      password: "user1",
      age: 20,
      dateCreated: new Date(),
      dateUpdated: new Date(),
      Store: {
        create: {
          name: "store1",
          description: "store1",
          dateCreated: new Date(),
          dateUpdated: new Date(),
          products: {
            create: [
              {
                name: "product1",
                paymentMethod: 1,
                giftOptionAvailable: false,
                stockAvailable: 12,
                replaceFrame: 12,
                flagedForWrongInfo: 12,
                returnFrame: 15,
                ptags: [],
                isVariant: false,
                // description: "product1",
                price: 100,
                dateCreated: new Date(),
                dateUpdated: new Date(),
                brand: {
                  create: {
                    name: "brand1",
                  },
                },
              },
              {
                name: "product2",
                // description: "product2",
                flagedForWrongInfo: 14,
                paymentMethod: 1,
                giftOptionAvailable: false,
                stockAvailable: 12,
                replaceFrame: 12,
                returnFrame: 15,
                brand: {
                  create: {
                    name: "brand2",
                  },
                },
                ptags: [],
                isVariant: false,
                price: 200,
                dateCreated: new Date(),
                dateUpdated: new Date(),
              },
              {
                name: "product3",
                // description: "product3",
                price: 300,
                flagedForWrongInfo: 16,
                paymentMethod: 1,
                giftOptionAvailable: false,
                stockAvailable: 12,
                replaceFrame: 12,
                returnFrame: 15,
                brand: {
                  create: {
                    name: "brand3",
                  },
                },
                ptags: [],
                isVariant: false,
                dateCreated: new Date(),
                dateUpdated: new Date(),
              },
            ],
          },
        },
      },
    },
  });
}
export async function getData() {
  const data = await prisma.product.findMany({
    // where: {
    // name: "product1",
    // },
    // select: {
    // name: true,
    // price: true,
    // },
  });
  console.log(data);
  console.log((data as any).Store);
  return data;
}
