import { prisma } from "./client";

export async function insertData() {
  const user = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@crypto.com",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: "Alice",
      email: "2alice@crypto.com",
    },
  });

  const store = await prisma.store.create({
    data: {
      name: "Alice's Store",
      description: "Alice's Store Description",
      manager: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  const product = await prisma.product.create({
    data: {
      name: "Tesla",
      price: 100000,
      paymentMethods: 2,
      giftOptionAvailable: true,
      stock: 100,
      flagedForWrongInfo: 2,
      returnFrame: 0,
      replaceFrame: 10,
      isVariant: false,
      store: {
        connect: {
          id: store.id,
        },
      },
      brand: {
        connectOrCreate: {
          where: {
            name: "Tesla",
          },
          create: {
            name: "Tesla",
          },
        },
      },
    },
  });

  const question = await prisma.question.create({
    data: {
      content: "question 1",
      user: {
        connect: {
          id: user.id,
        },
      },
      product: {
        connect: {
          id: product.id,
        },
      },
      answers: {
        create: [
          {
            content: "answer 1",
            user: {
              connect: {
                id: user.id,
              },
            },
          },
          {
            content: "answer 2",
            user: {
              connect: {
                id: user1.id,
              },
            },
          },
        ],
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "user2@gmail.com",
      name: "user 1",
      password: "user1",
      dob: new Date("2000"),
      dateCreated: new Date(),
      dateUpdated: new Date(),
      Store: {
        create: {
          name: "store1",
          description: "store1",
          products: {
            create: [
              {
                name: "product1",
                paymentMethods: 1,
                giftOptionAvailable: false,
                stock: 12,
                images: [],
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
                questions: {
                  createMany: {
                    data: [
                      {
                        uid: user.id,
                        content: "question 1",
                        // answers:
                      },
                      {
                        uid: user.id,
                        content: "question 2",
                      },
                      {
                        uid: user.id,
                        content: "question 3",
                      },
                    ],
                  },
                },
              },
              {
                name: "product2",
                // description: "product2",
                flagedForWrongInfo: 14,
                paymentMethods: 1,
                giftOptionAvailable: false,
                stock: 12,
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
                paymentMethods: 4,
                giftOptionAvailable: false,
                stock: 12,
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
  // prisma.question.createMany({})
  console.log(data);
  console.log((data as any).Store);
  return data;
}
