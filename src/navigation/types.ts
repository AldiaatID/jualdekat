export type RootStackParamList = {
  AppTabs: undefined;
  ProductDetail: { productId: string };
  ChatRoom: { conversationId: string; productName: string; peerName: string };
  EditProfile: undefined;
  UserProfile: { userId: string };
  CreateReport: { productId?: string; reportedUserId?: string };
  CreateRating: { transactionId: string; reviewedUserId: string; productId: string | null };
  MarkAsSold: { productId: string };
};
