-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInformation" (
    "userInformationId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userTypeUserTypeId" UUID,

    CONSTRAINT "UserInformation_pkey" PRIMARY KEY ("userInformationId")
);

-- CreateTable
CREATE TABLE "UserType" (
    "userTypeId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "offerForUserTypeOfferForUserTypeId" UUID,

    CONSTRAINT "UserType_pkey" PRIMARY KEY ("userTypeId")
);

-- CreateTable
CREATE TABLE "Action" (
    "actionId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "identifier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataObject" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "actionTypeId" UUID NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("actionId")
);

-- CreateTable
CREATE TABLE "Offer" (
    "offerId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("offerId")
);

-- CreateTable
CREATE TABLE "OfferForInterval" (
    "offerForIntervalId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "offerId" UUID NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OfferForInterval_pkey" PRIMARY KEY ("offerForIntervalId")
);

-- CreateTable
CREATE TABLE "OfferForRegion" (
    "offerForRegionId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "offerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OfferForRegion_pkey" PRIMARY KEY ("offerForRegionId")
);

-- CreateTable
CREATE TABLE "OfferForUserType" (
    "offerForUserTypeId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "offerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OfferForUserType_pkey" PRIMARY KEY ("offerForUserTypeId")
);

-- CreateTable
CREATE TABLE "UserAction" (
    "userActionId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userInformationId" UUID NOT NULL,
    "dataObject" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "actionTypeId" UUID NOT NULL,

    CONSTRAINT "UserAction_pkey" PRIMARY KEY ("userActionId")
);

-- CreateTable
CREATE TABLE "ActionType" (
    "actionTypeId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ActionType_pkey" PRIMARY KEY ("actionTypeId")
);

-- CreateTable
CREATE TABLE "Links" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "warehouseId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "deliveryRouteId" UUID,
    "warehouseAddressWarehouseAddressId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("warehouseId")
);

-- CreateTable
CREATE TABLE "DeliveryTracker" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderItemId" UUID NOT NULL,
    "deliveryAgentId" UUID NOT NULL,
    "deliveryStatusId" UUID NOT NULL,
    "warehouseId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DeliveryTracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "departmentId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "departmentName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Department_pkey" PRIMARY KEY ("departmentId")
);

-- CreateTable
CREATE TABLE "Employee" (
    "employeeId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "addressId" UUID NOT NULL,
    "salary" INTEGER NOT NULL,
    "departmentID" UUID NOT NULL,
    "mediaMediaId" UUID,
    "employeePositionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("employeeId")
);

-- CreateTable
CREATE TABLE "DeliveryAgent" (
    "deliveryAgentId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DeliveryAgent_pkey" PRIMARY KEY ("deliveryAgentId")
);

-- CreateTable
CREATE TABLE "DeliveryAgentContact" (
    "deliveryAgentContactId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "deliveryAgentId" UUID,
    "contact" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DeliveryAgentContact_pkey" PRIMARY KEY ("deliveryAgentContactId")
);

-- CreateTable
CREATE TABLE "EmployeePosition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "position" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "EmployeePosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseAddress" (
    "warehouseAddressId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "line1" TEXT NOT NULL,
    "line2" TEXT DEFAULT '',
    "zipcode" TEXT NOT NULL,
    "cityId" UUID NOT NULL,
    "latitudeLongitudeId" UUID NOT NULL,
    "warehouseId" UUID NOT NULL,
    "warehouseAddressTypeId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WarehouseAddress_pkey" PRIMARY KEY ("warehouseAddressId")
);

-- CreateTable
CREATE TABLE "WarehouseAddressType" (
    "warehouseAddressTypeId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "addressType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WarehouseAddressType_pkey" PRIMARY KEY ("warehouseAddressTypeId")
);

-- CreateTable
CREATE TABLE "DeliveryRoute" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "deliveryTrackerId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DeliveryRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryStatus" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DeliveryStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wishlist" (
    "wishlistId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userInformationId" UUID,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("wishlistId")
);

-- CreateTable
CREATE TABLE "WishlistItem" (
    "wishlistItemId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "wishlistId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "wishlistItemStatusId" UUID NOT NULL,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("wishlistItemId")
);

-- CreateTable
CREATE TABLE "WishlistItemStatus" (
    "wishlistItemStatusId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WishlistItemStatus_pkey" PRIMARY KEY ("wishlistItemStatusId")
);

-- CreateTable
CREATE TABLE "Brand" (
    "brandId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("brandId")
);

-- CreateTable
CREATE TABLE "BrandMedia" (
    "brandMediaId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brandId" UUID NOT NULL,
    "mediaId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BrandMedia_pkey" PRIMARY KEY ("brandMediaId")
);

-- CreateTable
CREATE TABLE "Media" (
    "mediaId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "mediaTypeMediaTypeId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Media_pkey" PRIMARY KEY ("mediaId")
);

-- CreateTable
CREATE TABLE "MediaType" (
    "mediaTypeId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MediaType_pkey" PRIMARY KEY ("mediaTypeId")
);

-- CreateTable
CREATE TABLE "BrandTag" (
    "brandTagId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BrandTag_pkey" PRIMARY KEY ("brandTagId")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "paymentMethodId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "productProductId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("paymentMethodId")
);

-- CreateTable
CREATE TABLE "Payment" (
    "paymentId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "paymentMethodId" UUID NOT NULL,
    "paymentStatusId" UUID NOT NULL,
    "paymentTypeId" UUID NOT NULL,
    "paymentMethodPaymentMethodId" UUID NOT NULL,
    "paymentStatusPaymentStatusId" UUID NOT NULL,
    "paymentTypePaymentTypeId" UUID NOT NULL,
    "orderItemId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("paymentId")
);

-- CreateTable
CREATE TABLE "PaymentStatus" (
    "paymentStatusId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PaymentStatus_pkey" PRIMARY KEY ("paymentStatusId")
);

-- CreateTable
CREATE TABLE "PaymentType" (
    "paymentTypeId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PaymentType_pkey" PRIMARY KEY ("paymentTypeId")
);

-- CreateTable
CREATE TABLE "ProductWrongInformationReportsCombinedResult" (
    "productWrongInformationReportsOverallId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "productId" UUID NOT NULL,
    "count" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductWrongInformationReportsCombinedResult_pkey" PRIMARY KEY ("productWrongInformationReportsOverallId")
);

-- CreateTable
CREATE TABLE "ProductWrongInformationReport" (
    "productWrongInformationReportId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "userInformationId" UUID NOT NULL,
    "productWrongInformationReportsCombinedResultId" UUID,
    "productProductId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductWrongInformationReport_pkey" PRIMARY KEY ("productWrongInformationReportId")
);

-- CreateTable
CREATE TABLE "ProductTag" (
    "productTagId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductTag_pkey" PRIMARY KEY ("productTagId")
);

-- CreateTable
CREATE TABLE "ProductDetail" (
    "productDetailId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "description" TEXT NOT NULL,
    "productProductId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductDetail_pkey" PRIMARY KEY ("productDetailId")
);

-- CreateTable
CREATE TABLE "ProductDescriptionMedia" (
    "productDescriptionMediaId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productDescriptionId" UUID NOT NULL,
    "mediaId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductDescriptionMedia_pkey" PRIMARY KEY ("productDescriptionMediaId")
);

-- CreateTable
CREATE TABLE "ProductTechnicalDetail" (
    "technicalDetailId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "productId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductTechnicalDetail_pkey" PRIMARY KEY ("technicalDetailId")
);

-- CreateTable
CREATE TABLE "Cart" (
    "cartId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userInformationId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("cartId")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "cartItemId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cartId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("cartItemId")
);

-- CreateTable
CREATE TABLE "SavedForLaterProducts" (
    "savedForLaterProductsId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userInformationId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SavedForLaterProducts_pkey" PRIMARY KEY ("savedForLaterProductsId")
);

-- CreateTable
CREATE TABLE "Orders" (
    "orderId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userInformationId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "orderItemId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "orderStatusId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("orderItemId")
);

-- CreateTable
CREATE TABLE "OrderStatus" (
    "orderStatusId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OrderStatus_pkey" PRIMARY KEY ("orderStatusId")
);

-- CreateTable
CREATE TABLE "ProductInventory" (
    "productInventoryId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "sold" INTEGER NOT NULL,
    "comingSoon" INTEGER NOT NULL,
    "productId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductInventory_pkey" PRIMARY KEY ("productInventoryId")
);

-- CreateTable
CREATE TABLE "Product" (
    "productId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "productInventoryId" UUID,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "giftOptionAvailable" BOOLEAN NOT NULL,
    "replaceFrame" INTEGER NOT NULL,
    "returnFrame" INTEGER NOT NULL,
    "ptags" TEXT[],
    "brandId" UUID NOT NULL,
    "storeId" UUID,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "ProductMedia" (
    "productMediaId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "mediaId" UUID NOT NULL,
    "productProductId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductMedia_pkey" PRIMARY KEY ("productMediaId")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "complaintId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userInformationId" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("complaintId")
);

-- CreateTable
CREATE TABLE "Store" (
    "storeId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "userInformationId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Store_pkey" PRIMARY KEY ("storeId")
);

-- CreateTable
CREATE TABLE "StoreContact" (
    "userContactId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contactType" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "StoreID" UUID,
    "contactTypeId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StoreContact_pkey" PRIMARY KEY ("userContactId")
);

-- CreateTable
CREATE TABLE "StoreContactType" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StoreContactType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreComplaint" (
    "storeComplaintId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userInformationId" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "storeStoreId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StoreComplaint_pkey" PRIMARY KEY ("storeComplaintId")
);

-- CreateTable
CREATE TABLE "StoreTag" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StoreTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreMedia" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "storeId" UUID NOT NULL,
    "mediaId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StoreMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreReviewsCombinedResult" (
    "storeReviewCombinedResultsId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "storeId" UUID NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "reviewCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StoreReviewsCombinedResult_pkey" PRIMARY KEY ("storeReviewCombinedResultsId")
);

-- CreateTable
CREATE TABLE "StoreReview" (
    "storeReviewId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userInformationId" TEXT NOT NULL,
    "storeId" UUID NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "content" TEXT,
    "storeReviewsCombinedResultsId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StoreReview_pkey" PRIMARY KEY ("storeReviewId")
);

-- CreateTable
CREATE TABLE "StoreReviewTag" (
    "storeReviewTagId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StoreReviewTag_pkey" PRIMARY KEY ("storeReviewTagId")
);

-- CreateTable
CREATE TABLE "StoreReviewMedia" (
    "productReviewMediaId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mediaId" UUID NOT NULL,
    "storeReviewId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StoreReviewMedia_pkey" PRIMARY KEY ("productReviewMediaId")
);

-- CreateTable
CREATE TABLE "ProductQuestion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userInformationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductQuestionMedia" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "questionId" UUID NOT NULL,
    "mediaId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductQuestionMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAnswer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userInformationId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL,
    "productQuestionId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAnswerMedia" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "answerId" UUID NOT NULL,
    "mediaId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductAnswerMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductReviewsCombinedResult" (
    "productReviewsCombinedResultsId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rating" DOUBLE PRECISION NOT NULL,
    "reviewsCount" INTEGER NOT NULL,
    "productId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductReviewsCombinedResult_pkey" PRIMARY KEY ("productReviewsCombinedResultsId")
);

-- CreateTable
CREATE TABLE "ProductFeaturesRatingCombinedResult" (
    "productFeatureRatingCombinedResultsId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rating" DOUBLE PRECISION NOT NULL,
    "reviewsCount" INTEGER NOT NULL,
    "featureId" UUID NOT NULL,
    "productReviewsCombinedResultsId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductFeaturesRatingCombinedResult_pkey" PRIMARY KEY ("productFeatureRatingCombinedResultsId")
);

-- CreateTable
CREATE TABLE "ProductReview" (
    "productReviewId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "userInformationId" UUID NOT NULL,
    "overallRating" DOUBLE PRECISION NOT NULL,
    "content" TEXT NOT NULL,
    "verifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "productReviewsCombinedResultsId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("productReviewId")
);

-- CreateTable
CREATE TABLE "ProductReviewTag" (
    "productReviewTagId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductReviewTag_pkey" PRIMARY KEY ("productReviewTagId")
);

-- CreateTable
CREATE TABLE "ProductReviewMedia" (
    "productReviewMediaId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mediaId" UUID NOT NULL,
    "productReviewId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductReviewMedia_pkey" PRIMARY KEY ("productReviewMediaId")
);

-- CreateTable
CREATE TABLE "ProductReviewFeatureRating" (
    "productReviewFeatureId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productReviewId" UUID NOT NULL,
    "featureId" UUID NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductReviewFeatureRating_pkey" PRIMARY KEY ("productReviewFeatureId")
);

-- CreateTable
CREATE TABLE "ProductReviewFeature" (
    "productReviewFeatureId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "description" TEXT NOT NULL,
    "productId" UUID NOT NULL,
    "productReviewFeatureTypeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductReviewFeature_pkey" PRIMARY KEY ("productReviewFeatureId")
);

-- CreateTable
CREATE TABLE "ProductReviewFeatureType" (
    "type" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductReviewFeatureType_pkey" PRIMARY KEY ("type")
);

-- CreateTable
CREATE TABLE "UserContact" (
    "userContactId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contact" TEXT NOT NULL,
    "userInformationUserId" UUID,
    "contactTypeId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "UserContact_pkey" PRIMARY KEY ("userContactId")
);

-- CreateTable
CREATE TABLE "UserContactType" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "UserContactType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auth" (
    "authId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "emailVerifiedDtm" TIMESTAMP(3),
    "passwordId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("authId")
);

-- CreateTable
CREATE TABLE "PasswordHistory" (
    "passwordHistoryId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "authId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PasswordHistory_pkey" PRIMARY KEY ("passwordHistoryId")
);

-- CreateTable
CREATE TABLE "LoginAttempts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "authId" UUID NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LoginAttempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Password" (
    "passwordId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "authId" UUID NOT NULL,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "iterations" INTEGER NOT NULL,
    "hashingAlgorithm" TEXT NOT NULL,
    "passwordHistoryPasswordHistoryId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Password_pkey" PRIMARY KEY ("passwordId")
);

-- CreateTable
CREATE TABLE "SecurityQuestion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "authId" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "hashingAlgorithm" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "iterations" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SecurityQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "userProfileId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "bio" TEXT,
    "profilePictureId" UUID,
    "userInformationId" TEXT NOT NULL,
    "genderId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("userProfileId")
);

-- CreateTable
CREATE TABLE "ProfilePicture" (
    "profilePictureId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mediaId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProfilePicture_pkey" PRIMARY KEY ("profilePictureId")
);

-- CreateTable
CREATE TABLE "Gender" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Gender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAddress" (
    "userAddressId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "line1" TEXT NOT NULL,
    "line2" TEXT DEFAULT '',
    "zipcode" TEXT NOT NULL,
    "cityId" UUID NOT NULL,
    "latitudeLongitudeId" UUID NOT NULL,
    "userInformationUserId" UUID,
    "userAddressTypeId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "offerForRegionOfferForRegionId" TEXT,

    CONSTRAINT "UserAddress_pkey" PRIMARY KEY ("userAddressId")
);

-- CreateTable
CREATE TABLE "UserAddressType" (
    "userAddressTypeId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "UserAddressType_pkey" PRIMARY KEY ("userAddressTypeId")
);

-- CreateTable
CREATE TABLE "LatitudeLongitude" (
    "latitudeLongitudeId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lat" DOUBLE PRECISION NOT NULL,
    "long" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LatitudeLongitude_pkey" PRIMARY KEY ("latitudeLongitudeId")
);

-- CreateTable
CREATE TABLE "City" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "stateId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "identifier" TEXT NOT NULL,
    "countryId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" CHAR(2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "machineIdentifier" TEXT,
    "authId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "_UserToWishlist" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_BrandToBrandTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductToProductTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_variants" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductToSavedForLaterProducts" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_StoreToStoreTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_StoreReviewToStoreReviewTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductReviewToProductReviewTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserInformation_userId_key" ON "UserInformation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserType_name_key" ON "UserType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ActionType_type_key" ON "ActionType"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryAgent_employeeId_key" ON "DeliveryAgent"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseAddress_warehouseId_key" ON "WarehouseAddress"("warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductWrongInformationReportsCombinedResult_productId_key" ON "ProductWrongInformationReportsCombinedResult"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userInformationId_key" ON "Cart"("userInformationId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedForLaterProducts_userInformationId_key" ON "SavedForLaterProducts"("userInformationId");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_userInformationId_key" ON "Orders"("userInformationId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductInventory_productId_key" ON "ProductInventory"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreContactType_name_key" ON "StoreContactType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StoreTag_name_key" ON "StoreTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StoreReviewsCombinedResult_storeId_key" ON "StoreReviewsCombinedResult"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreReviewTag_tag_key" ON "StoreReviewTag"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "ProductReviewsCombinedResult_productId_key" ON "ProductReviewsCombinedResult"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductReviewTag_tag_key" ON "ProductReviewTag"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "UserContactType_name_key" ON "UserContactType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_userId_key" ON "Auth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_passwordId_key" ON "Auth"("passwordId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userInformationId_key" ON "UserProfile"("userInformationId");

-- CreateIndex
CREATE UNIQUE INDEX "Gender_name_key" ON "Gender"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserAddressType_name_key" ON "UserAddressType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToWishlist_AB_unique" ON "_UserToWishlist"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToWishlist_B_index" ON "_UserToWishlist"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BrandToBrandTag_AB_unique" ON "_BrandToBrandTag"("A", "B");

-- CreateIndex
CREATE INDEX "_BrandToBrandTag_B_index" ON "_BrandToBrandTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToProductTag_AB_unique" ON "_ProductToProductTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToProductTag_B_index" ON "_ProductToProductTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_variants_AB_unique" ON "_variants"("A", "B");

-- CreateIndex
CREATE INDEX "_variants_B_index" ON "_variants"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToSavedForLaterProducts_AB_unique" ON "_ProductToSavedForLaterProducts"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToSavedForLaterProducts_B_index" ON "_ProductToSavedForLaterProducts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_StoreToStoreTag_AB_unique" ON "_StoreToStoreTag"("A", "B");

-- CreateIndex
CREATE INDEX "_StoreToStoreTag_B_index" ON "_StoreToStoreTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_StoreReviewToStoreReviewTag_AB_unique" ON "_StoreReviewToStoreReviewTag"("A", "B");

-- CreateIndex
CREATE INDEX "_StoreReviewToStoreReviewTag_B_index" ON "_StoreReviewToStoreReviewTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductReviewToProductReviewTag_AB_unique" ON "_ProductReviewToProductReviewTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductReviewToProductReviewTag_B_index" ON "_ProductReviewToProductReviewTag"("B");

-- AddForeignKey
ALTER TABLE "UserInformation" ADD CONSTRAINT "UserInformation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInformation" ADD CONSTRAINT "UserInformation_userTypeUserTypeId_fkey" FOREIGN KEY ("userTypeUserTypeId") REFERENCES "UserType"("userTypeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserType" ADD CONSTRAINT "UserType_offerForUserTypeOfferForUserTypeId_fkey" FOREIGN KEY ("offerForUserTypeOfferForUserTypeId") REFERENCES "OfferForUserType"("offerForUserTypeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_actionTypeId_fkey" FOREIGN KEY ("actionTypeId") REFERENCES "ActionType"("actionTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferForInterval" ADD CONSTRAINT "OfferForInterval_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("offerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferForRegion" ADD CONSTRAINT "OfferForRegion_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("offerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferForUserType" ADD CONSTRAINT "OfferForUserType_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("offerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAction" ADD CONSTRAINT "UserAction_userInformationId_fkey" FOREIGN KEY ("userInformationId") REFERENCES "UserInformation"("userInformationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAction" ADD CONSTRAINT "UserAction_actionTypeId_fkey" FOREIGN KEY ("actionTypeId") REFERENCES "ActionType"("actionTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_deliveryRouteId_fkey" FOREIGN KEY ("deliveryRouteId") REFERENCES "DeliveryRoute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryTracker" ADD CONSTRAINT "DeliveryTracker_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("orderItemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryTracker" ADD CONSTRAINT "DeliveryTracker_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("warehouseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryTracker" ADD CONSTRAINT "DeliveryTracker_deliveryStatusId_fkey" FOREIGN KEY ("deliveryStatusId") REFERENCES "DeliveryStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryTracker" ADD CONSTRAINT "DeliveryTracker_deliveryAgentId_fkey" FOREIGN KEY ("deliveryAgentId") REFERENCES "DeliveryAgent"("deliveryAgentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_mediaMediaId_fkey" FOREIGN KEY ("mediaMediaId") REFERENCES "Media"("mediaId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_employeePositionId_fkey" FOREIGN KEY ("employeePositionId") REFERENCES "EmployeePosition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "UserAddress"("userAddressId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentID_fkey" FOREIGN KEY ("departmentID") REFERENCES "Department"("departmentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryAgent" ADD CONSTRAINT "DeliveryAgent_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryAgentContact" ADD CONSTRAINT "DeliveryAgentContact_deliveryAgentId_fkey" FOREIGN KEY ("deliveryAgentId") REFERENCES "DeliveryAgent"("deliveryAgentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseAddress" ADD CONSTRAINT "WarehouseAddress_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseAddress" ADD CONSTRAINT "WarehouseAddress_latitudeLongitudeId_fkey" FOREIGN KEY ("latitudeLongitudeId") REFERENCES "LatitudeLongitude"("latitudeLongitudeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseAddress" ADD CONSTRAINT "WarehouseAddress_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("warehouseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseAddress" ADD CONSTRAINT "WarehouseAddress_warehouseAddressTypeId_fkey" FOREIGN KEY ("warehouseAddressTypeId") REFERENCES "WarehouseAddressType"("warehouseAddressTypeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRoute" ADD CONSTRAINT "DeliveryRoute_deliveryTrackerId_fkey" FOREIGN KEY ("deliveryTrackerId") REFERENCES "DeliveryTracker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userInformationId_fkey" FOREIGN KEY ("userInformationId") REFERENCES "UserInformation"("userInformationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("wishlistId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_wishlistItemStatusId_fkey" FOREIGN KEY ("wishlistItemStatusId") REFERENCES "WishlistItemStatus"("wishlistItemStatusId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandMedia" ADD CONSTRAINT "BrandMedia_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("brandId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandMedia" ADD CONSTRAINT "BrandMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("mediaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_mediaTypeMediaTypeId_fkey" FOREIGN KEY ("mediaTypeMediaTypeId") REFERENCES "MediaType"("mediaTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_productProductId_fkey" FOREIGN KEY ("productProductId") REFERENCES "Product"("productId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentMethodPaymentMethodId_fkey" FOREIGN KEY ("paymentMethodPaymentMethodId") REFERENCES "PaymentMethod"("paymentMethodId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentStatusPaymentStatusId_fkey" FOREIGN KEY ("paymentStatusPaymentStatusId") REFERENCES "PaymentStatus"("paymentStatusId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentTypePaymentTypeId_fkey" FOREIGN KEY ("paymentTypePaymentTypeId") REFERENCES "PaymentType"("paymentTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("orderItemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductWrongInformationReportsCombinedResult" ADD CONSTRAINT "ProductWrongInformationReportsCombinedResult_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductWrongInformationReport" ADD CONSTRAINT "ProductWrongInformationReport_userInformationId_fkey" FOREIGN KEY ("userInformationId") REFERENCES "UserInformation"("userInformationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductWrongInformationReport" ADD CONSTRAINT "ProductWrongInformationReport_productWrongInformationRepor_fkey" FOREIGN KEY ("productWrongInformationReportsCombinedResultId") REFERENCES "ProductWrongInformationReportsCombinedResult"("productWrongInformationReportsOverallId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductWrongInformationReport" ADD CONSTRAINT "ProductWrongInformationReport_productProductId_fkey" FOREIGN KEY ("productProductId") REFERENCES "Product"("productId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDetail" ADD CONSTRAINT "ProductDetail_productProductId_fkey" FOREIGN KEY ("productProductId") REFERENCES "Product"("productId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDescriptionMedia" ADD CONSTRAINT "ProductDescriptionMedia_productDescriptionId_fkey" FOREIGN KEY ("productDescriptionId") REFERENCES "ProductDetail"("productDetailId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDescriptionMedia" ADD CONSTRAINT "ProductDescriptionMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("mediaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTechnicalDetail" ADD CONSTRAINT "ProductTechnicalDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userInformationId_fkey" FOREIGN KEY ("userInformationId") REFERENCES "UserInformation"("userInformationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("cartId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedForLaterProducts" ADD CONSTRAINT "SavedForLaterProducts_userInformationId_fkey" FOREIGN KEY ("userInformationId") REFERENCES "UserInformation"("userInformationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_userInformationId_fkey" FOREIGN KEY ("userInformationId") REFERENCES "UserInformation"("userInformationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderStatusId_fkey" FOREIGN KEY ("orderStatusId") REFERENCES "OrderStatus"("orderStatusId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInventory" ADD CONSTRAINT "ProductInventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("brandId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_productProductId_fkey" FOREIGN KEY ("productProductId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("mediaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_userInformationId_fkey" FOREIGN KEY ("userInformationId") REFERENCES "UserInformation"("userInformationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_userInformationId_fkey" FOREIGN KEY ("userInformationId") REFERENCES "UserInformation"("userInformationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreContact" ADD CONSTRAINT "StoreContact_StoreID_fkey" FOREIGN KEY ("StoreID") REFERENCES "Store"("storeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreContact" ADD CONSTRAINT "StoreContact_contactTypeId_fkey" FOREIGN KEY ("contactTypeId") REFERENCES "StoreContactType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreComplaint" ADD CONSTRAINT "StoreComplaint_userInformationId_fkey" FOREIGN KEY ("userInformationId") REFERENCES "UserInformation"("userInformationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreComplaint" ADD CONSTRAINT "StoreComplaint_storeStoreId_fkey" FOREIGN KEY ("storeStoreId") REFERENCES "Store"("storeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreMedia" ADD CONSTRAINT "StoreMedia_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreMedia" ADD CONSTRAINT "StoreMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("mediaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreReviewsCombinedResult" ADD CONSTRAINT "StoreReviewsCombinedResult_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreReview" ADD CONSTRAINT "StoreReview_userInformationId_fkey" FOREIGN KEY ("userInformationId") REFERENCES "UserInformation"("userInformationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreReview" ADD CONSTRAINT "StoreReview_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreReview" ADD CONSTRAINT "StoreReview_storeReviewsCombinedResultsId_fkey" FOREIGN KEY ("storeReviewsCombinedResultsId") REFERENCES "StoreReviewsCombinedResult"("storeReviewCombinedResultsId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreReviewMedia" ADD CONSTRAINT "StoreReviewMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("mediaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreReviewMedia" ADD CONSTRAINT "StoreReviewMedia_storeReviewId_fkey" FOREIGN KEY ("storeReviewId") REFERENCES "StoreReview"("storeReviewId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductQuestion" ADD CONSTRAINT "ProductQuestion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductQuestion" ADD CONSTRAINT "ProductQuestion_userInformationId_fkey" FOREIGN KEY ("userInformationId") REFERENCES "UserInformation"("userInformationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductQuestionMedia" ADD CONSTRAINT "ProductQuestionMedia_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ProductQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductQuestionMedia" ADD CONSTRAINT "ProductQuestionMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("mediaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAnswer" ADD CONSTRAINT "ProductAnswer_userInformationId_fkey" FOREIGN KEY ("userInformationId") REFERENCES "UserInformation"("userInformationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAnswer" ADD CONSTRAINT "ProductAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ProductQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAnswerMedia" ADD CONSTRAINT "ProductAnswerMedia_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "ProductAnswer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAnswerMedia" ADD CONSTRAINT "ProductAnswerMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("mediaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReviewsCombinedResult" ADD CONSTRAINT "ProductReviewsCombinedResult_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFeaturesRatingCombinedResult" ADD CONSTRAINT "ProductFeaturesRatingCombinedResult_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "ProductReviewFeature"("productReviewFeatureId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFeaturesRatingCombinedResult" ADD CONSTRAINT "ProductFeaturesRatingCombinedResult_productReviewsCombined_fkey" FOREIGN KEY ("productReviewsCombinedResultsId") REFERENCES "ProductReviewsCombinedResult"("productReviewsCombinedResultsId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_userInformationId_fkey" FOREIGN KEY ("userInformationId") REFERENCES "UserInformation"("userInformationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_productReviewsCombinedResultsId_fkey" FOREIGN KEY ("productReviewsCombinedResultsId") REFERENCES "ProductReviewsCombinedResult"("productReviewsCombinedResultsId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReviewMedia" ADD CONSTRAINT "ProductReviewMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("mediaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReviewMedia" ADD CONSTRAINT "ProductReviewMedia_productReviewId_fkey" FOREIGN KEY ("productReviewId") REFERENCES "ProductReview"("productReviewId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReviewFeatureRating" ADD CONSTRAINT "ProductReviewFeatureRating_productReviewId_fkey" FOREIGN KEY ("productReviewId") REFERENCES "ProductReview"("productReviewId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReviewFeatureRating" ADD CONSTRAINT "ProductReviewFeatureRating_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "ProductReviewFeature"("productReviewFeatureId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReviewFeature" ADD CONSTRAINT "ProductReviewFeature_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReviewFeature" ADD CONSTRAINT "ProductReviewFeature_productReviewFeatureTypeType_fkey" FOREIGN KEY ("productReviewFeatureTypeType") REFERENCES "ProductReviewFeatureType"("type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserContact" ADD CONSTRAINT "UserContact_userInformationUserId_fkey" FOREIGN KEY ("userInformationUserId") REFERENCES "UserInformation"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserContact" ADD CONSTRAINT "UserContact_contactTypeId_fkey" FOREIGN KEY ("contactTypeId") REFERENCES "UserContactType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auth" ADD CONSTRAINT "Auth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auth" ADD CONSTRAINT "Auth_passwordId_fkey" FOREIGN KEY ("passwordId") REFERENCES "Password"("passwordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordHistory" ADD CONSTRAINT "PasswordHistory_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("authId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginAttempts" ADD CONSTRAINT "LoginAttempts_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("authId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Password" ADD CONSTRAINT "Password_passwordHistoryPasswordHistoryId_fkey" FOREIGN KEY ("passwordHistoryPasswordHistoryId") REFERENCES "PasswordHistory"("passwordHistoryId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityQuestion" ADD CONSTRAINT "SecurityQuestion_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("authId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_profilePictureId_fkey" FOREIGN KEY ("profilePictureId") REFERENCES "ProfilePicture"("profilePictureId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userInformationId_fkey" FOREIGN KEY ("userInformationId") REFERENCES "UserInformation"("userInformationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_genderId_fkey" FOREIGN KEY ("genderId") REFERENCES "Gender"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfilePicture" ADD CONSTRAINT "ProfilePicture_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("mediaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_latitudeLongitudeId_fkey" FOREIGN KEY ("latitudeLongitudeId") REFERENCES "LatitudeLongitude"("latitudeLongitudeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_userInformationUserId_fkey" FOREIGN KEY ("userInformationUserId") REFERENCES "UserInformation"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_userAddressTypeId_fkey" FOREIGN KEY ("userAddressTypeId") REFERENCES "UserAddressType"("userAddressTypeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_offerForRegionOfferForRegionId_fkey" FOREIGN KEY ("offerForRegionOfferForRegionId") REFERENCES "OfferForRegion"("offerForRegionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("authId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToWishlist" ADD CONSTRAINT "_UserToWishlist_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToWishlist" ADD CONSTRAINT "_UserToWishlist_B_fkey" FOREIGN KEY ("B") REFERENCES "Wishlist"("wishlistId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrandToBrandTag" ADD CONSTRAINT "_BrandToBrandTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Brand"("brandId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrandToBrandTag" ADD CONSTRAINT "_BrandToBrandTag_B_fkey" FOREIGN KEY ("B") REFERENCES "BrandTag"("brandTagId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToProductTag" ADD CONSTRAINT "_ProductToProductTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToProductTag" ADD CONSTRAINT "_ProductToProductTag_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductTag"("productTagId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_variants" ADD CONSTRAINT "_variants_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_variants" ADD CONSTRAINT "_variants_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToSavedForLaterProducts" ADD CONSTRAINT "_ProductToSavedForLaterProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToSavedForLaterProducts" ADD CONSTRAINT "_ProductToSavedForLaterProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "SavedForLaterProducts"("savedForLaterProductsId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StoreToStoreTag" ADD CONSTRAINT "_StoreToStoreTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Store"("storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StoreToStoreTag" ADD CONSTRAINT "_StoreToStoreTag_B_fkey" FOREIGN KEY ("B") REFERENCES "StoreTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StoreReviewToStoreReviewTag" ADD CONSTRAINT "_StoreReviewToStoreReviewTag_A_fkey" FOREIGN KEY ("A") REFERENCES "StoreReview"("storeReviewId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StoreReviewToStoreReviewTag" ADD CONSTRAINT "_StoreReviewToStoreReviewTag_B_fkey" FOREIGN KEY ("B") REFERENCES "StoreReviewTag"("storeReviewTagId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductReviewToProductReviewTag" ADD CONSTRAINT "_ProductReviewToProductReviewTag_A_fkey" FOREIGN KEY ("A") REFERENCES "ProductReview"("productReviewId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductReviewToProductReviewTag" ADD CONSTRAINT "_ProductReviewToProductReviewTag_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductReviewTag"("productReviewTagId") ON DELETE CASCADE ON UPDATE CASCADE;
