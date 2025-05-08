export interface Producer {
  id: string;
  username: string;
  avatar?: string;
  email: string;
}

export interface Track {
  id: string;
  title: string;
  description: string;
  producer: Producer;
  audioFileUrl: string;
  trackLengthSeconds: number;
  playsCount: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrackResponse {
  respType: string;
  status: {
    statusCode: number;
    statusMessage: string;
    statusMessageKey: string;
  };
  data: Track[];
}
