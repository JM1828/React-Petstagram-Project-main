import axios from 'axios';

class ChatRoomService {
  static BASE_URL = '/api';

  // 메시지 작성
  static async sendMessage(formData) {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${ChatRoomService.BASE_URL}/user/message/send`,
      formData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }

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
  static async chatRoomMessages(chatRoomId) {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${this.BASE_URL}/user/chatRooms/${chatRoomId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }

  // 모든 채팅방 리스트 가져오기
  static async getChatRoomList() {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${this.BASE_URL}/user/chatRooms/list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  // 특정 채팅방의 상세 정보 가져오기
  static async getChatRoomById(chatRoomId) {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${this.BASE_URL}/user/chatRooms/list/${chatRoomId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }

  // 이미 존재하는 채팅방이 있는지 확인
  static async checkChatRoomExists(userId1, userId2) {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${this.BASE_URL}/user/chatRooms/exists?userId1=${userId1}&userId2=${userId2}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }
}

export default ChatRoomService;
