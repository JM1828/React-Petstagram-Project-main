import axios from 'axios';

class ChatRoomService {
  static BASE_URL = '/api';

  // 채팅방 생성
  static async createChatRoom(chatRoomDTO) {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${this.BASE_URL}/user/chatRooms`,
      chatRoomDTO,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }

  // 채팅방 및 메시지 목록 조회
  static async chatRoomMessagesWithInfo(chatRoomId) {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${this.BASE_URL}/user/chatRooms/${chatRoomId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }

  // 모든 채팅방의 메시지 개수 반환
  static async sentMessageCount() {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${this.BASE_URL}/user/chatRooms/sentMessageCount`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }

  // 모든 채팅방의 메시지 개수 반환
  static async receivedMessageCount() {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${this.BASE_URL}/user/chatRooms/receivedMessageCount`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }

  // 채팅방 리스트 가져오기
  static async getChatRoomList() {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${this.BASE_URL}/user/chatRooms/list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  // 이미지 파일 업로드 메서드
  static async uploadImage(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.BASE_URL}/user/uploadImage`, {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.imageUrl; // 서버에서 반환하는 이미지 URL
  }
}

export default ChatRoomService;
