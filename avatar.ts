
export interface Avatar {
  id: string;
  name: string;
  image: string;
  voiceId: string;
  avatarId: string;
}

export interface VideoRequest {
  avatarId: string;
  voiceId: string;
  script: string;
}

export interface VideoResponse {
  id: string;
  video_url: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
}
